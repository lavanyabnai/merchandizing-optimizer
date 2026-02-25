"""Repository pattern for database operations."""

from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.db.database import Base
from app.db.models import (
    AssortmentProduct,
    AssortmentSale,
    AssortmentStore,
    ClusteringRun,
    OptimizationRun,
    SimulationRun,
    SwitchingMatrix,
)

logger = get_logger(__name__)

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations."""

    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id: UUID) -> ModelType | None:
        """Get a single record by ID."""
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_id_or_raise(self, id: UUID) -> ModelType:
        """Get a single record by ID or raise NotFoundError."""
        record = await self.get_by_id(id)
        if record is None:
            raise NotFoundError(self.model.__name__, str(id))
        return record

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Any | None = None,
    ) -> list[ModelType]:
        """Get all records with pagination."""
        query = select(self.model)
        if order_by is not None:
            query = query.order_by(order_by)
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def count(self) -> int:
        """Count total records."""
        result = await self.session.execute(
            select(func.count()).select_from(self.model)
        )
        return result.scalar_one()

    async def create(self, data: dict[str, Any]) -> ModelType:
        """Create a new record."""
        instance = self.model(**data)
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def create_many(self, data_list: list[dict[str, Any]]) -> list[ModelType]:
        """Create multiple records."""
        instances = [self.model(**data) for data in data_list]
        self.session.add_all(instances)
        await self.session.flush()
        for instance in instances:
            await self.session.refresh(instance)
        return instances

    async def update(self, id: UUID, data: dict[str, Any]) -> ModelType:
        """Update a record by ID."""
        await self.session.execute(
            update(self.model)
            .where(self.model.id == id)
            .values(**data)
        )
        await self.session.flush()
        return await self.get_by_id_or_raise(id)

    async def delete(self, id: UUID) -> bool:
        """Delete a record by ID."""
        result = await self.session.execute(
            delete(self.model).where(self.model.id == id)
        )
        await self.session.flush()
        return result.rowcount > 0

    async def delete_many(self, ids: list[UUID]) -> int:
        """Delete multiple records by IDs."""
        result = await self.session.execute(
            delete(self.model).where(self.model.id.in_(ids))
        )
        await self.session.flush()
        return result.rowcount

    async def exists(self, id: UUID) -> bool:
        """Check if a record exists."""
        result = await self.session.execute(
            select(func.count()).select_from(self.model).where(self.model.id == id)
        )
        return result.scalar_one() > 0


class ProductRepository(BaseRepository[AssortmentProduct]):
    """Repository for Product operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(AssortmentProduct, session)

    async def get_by_sku(self, sku: str) -> AssortmentProduct | None:
        """Get product by SKU."""
        result = await self.session.execute(
            select(AssortmentProduct).where(AssortmentProduct.sku == sku)
        )
        return result.scalar_one_or_none()

    async def get_by_skus(self, skus: list[str]) -> list[AssortmentProduct]:
        """Get products by multiple SKUs."""
        result = await self.session.execute(
            select(AssortmentProduct).where(AssortmentProduct.sku.in_(skus))
        )
        return list(result.scalars().all())

    async def get_by_subcategory(
        self,
        subcategory: str,
        active_only: bool = True,
    ) -> list[AssortmentProduct]:
        """Get products by subcategory."""
        query = select(AssortmentProduct).where(
            AssortmentProduct.subcategory == subcategory
        )
        if active_only:
            query = query.where(AssortmentProduct.is_active == True)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_brand(
        self,
        brand: str,
        active_only: bool = True,
    ) -> list[AssortmentProduct]:
        """Get products by brand."""
        query = select(AssortmentProduct).where(
            AssortmentProduct.brand == brand
        )
        if active_only:
            query = query.where(AssortmentProduct.is_active == True)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_active_products(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[AssortmentProduct]:
        """Get all active products."""
        result = await self.session.execute(
            select(AssortmentProduct)
            .where(AssortmentProduct.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_subcategories(self) -> list[str]:
        """Get unique subcategories."""
        result = await self.session.execute(
            select(AssortmentProduct.subcategory)
            .distinct()
            .order_by(AssortmentProduct.subcategory)
        )
        return [row[0] for row in result.all()]

    async def get_brands(self) -> list[str]:
        """Get unique brands."""
        result = await self.session.execute(
            select(AssortmentProduct.brand)
            .distinct()
            .order_by(AssortmentProduct.brand)
        )
        return [row[0] for row in result.all()]

    async def search(
        self,
        subcategory: str | None = None,
        brand: str | None = None,
        brand_tier: str | None = None,
        price_tier: str | None = None,
        is_active: bool | None = True,
        min_price: float | None = None,
        max_price: float | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[AssortmentProduct], int]:
        """Search products with filters."""
        query = select(AssortmentProduct)
        count_query = select(func.count()).select_from(AssortmentProduct)

        # Apply filters
        filters = []
        if subcategory:
            filters.append(AssortmentProduct.subcategory == subcategory)
        if brand:
            filters.append(AssortmentProduct.brand == brand)
        if brand_tier:
            filters.append(AssortmentProduct.brand_tier == brand_tier)
        if price_tier:
            filters.append(AssortmentProduct.price_tier == price_tier)
        if is_active is not None:
            filters.append(AssortmentProduct.is_active == is_active)
        if min_price is not None:
            filters.append(AssortmentProduct.price >= min_price)
        if max_price is not None:
            filters.append(AssortmentProduct.price <= max_price)

        for f in filters:
            query = query.where(f)
            count_query = count_query.where(f)

        # Get total count
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        # Get paginated results
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)

        return list(result.scalars().all()), total


class StoreRepository(BaseRepository[AssortmentStore]):
    """Repository for Store operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(AssortmentStore, session)

    async def get_by_code(self, store_code: str) -> AssortmentStore | None:
        """Get store by code."""
        result = await self.session.execute(
            select(AssortmentStore).where(AssortmentStore.store_code == store_code)
        )
        return result.scalar_one_or_none()

    async def get_by_codes(self, codes: list[str]) -> list[AssortmentStore]:
        """Get stores by multiple codes."""
        result = await self.session.execute(
            select(AssortmentStore).where(AssortmentStore.store_code.in_(codes))
        )
        return list(result.scalars().all())

    async def get_active_stores(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> list[AssortmentStore]:
        """Get all active stores."""
        result = await self.session.execute(
            select(AssortmentStore)
            .where(AssortmentStore.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_format(
        self,
        format: str,
        active_only: bool = True,
    ) -> list[AssortmentStore]:
        """Get stores by format."""
        query = select(AssortmentStore).where(
            AssortmentStore.format == format
        )
        if active_only:
            query = query.where(AssortmentStore.is_active == True)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def search(
        self,
        format: str | None = None,
        location_type: str | None = None,
        income_index: str | None = None,
        region: str | None = None,
        is_active: bool | None = True,
        min_traffic: int | None = None,
        max_traffic: int | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[AssortmentStore], int]:
        """Search stores with filters."""
        query = select(AssortmentStore)
        count_query = select(func.count()).select_from(AssortmentStore)

        filters = []
        if format:
            filters.append(AssortmentStore.format == format)
        if location_type:
            filters.append(AssortmentStore.location_type == location_type)
        if income_index:
            filters.append(AssortmentStore.income_index == income_index)
        if region:
            filters.append(AssortmentStore.region == region)
        if is_active is not None:
            filters.append(AssortmentStore.is_active == is_active)
        if min_traffic is not None:
            filters.append(AssortmentStore.weekly_traffic >= min_traffic)
        if max_traffic is not None:
            filters.append(AssortmentStore.weekly_traffic <= max_traffic)

        for f in filters:
            query = query.where(f)
            count_query = count_query.where(f)

        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()

        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)

        return list(result.scalars().all()), total


class SaleRepository(BaseRepository[AssortmentSale]):
    """Repository for Sale operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(AssortmentSale, session)

    async def get_by_product_and_store(
        self,
        product_id: UUID,
        store_id: UUID,
        week_number: int | None = None,
        year: int | None = None,
    ) -> list[AssortmentSale]:
        """Get sales for a product at a store."""
        query = select(AssortmentSale).where(
            AssortmentSale.product_id == product_id,
            AssortmentSale.store_id == store_id,
        )
        if week_number:
            query = query.where(AssortmentSale.week_number == week_number)
        if year:
            query = query.where(AssortmentSale.year == year)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_store(
        self,
        store_id: UUID,
        year: int | None = None,
        skip: int = 0,
        limit: int = 1000,
    ) -> list[AssortmentSale]:
        """Get all sales for a store."""
        query = select(AssortmentSale).where(AssortmentSale.store_id == store_id)
        if year:
            query = query.where(AssortmentSale.year == year)
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_product(
        self,
        product_id: UUID,
        year: int | None = None,
        skip: int = 0,
        limit: int = 1000,
    ) -> list[AssortmentSale]:
        """Get all sales for a product."""
        query = select(AssortmentSale).where(AssortmentSale.product_id == product_id)
        if year:
            query = query.where(AssortmentSale.year == year)
        query = query.offset(skip).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_weekly_summary(
        self,
        store_id: UUID | None = None,
        year: int | None = None,
    ) -> list[dict]:
        """Get weekly sales summary."""
        query = select(
            AssortmentSale.week_number,
            AssortmentSale.year,
            func.sum(AssortmentSale.units_sold).label("total_units"),
            func.sum(AssortmentSale.revenue).label("total_revenue"),
            func.count(func.distinct(AssortmentSale.product_id)).label("unique_products"),
        ).group_by(
            AssortmentSale.week_number,
            AssortmentSale.year,
        ).order_by(
            AssortmentSale.year,
            AssortmentSale.week_number,
        )

        if store_id:
            query = query.where(AssortmentSale.store_id == store_id)
        if year:
            query = query.where(AssortmentSale.year == year)

        result = await self.session.execute(query)
        return [
            {
                "week_number": row.week_number,
                "year": row.year,
                "total_units": row.total_units,
                "total_revenue": float(row.total_revenue),
                "unique_products": row.unique_products,
            }
            for row in result.all()
        ]

    async def get_product_summary(
        self,
        store_id: UUID | None = None,
        year: int | None = None,
    ) -> list[dict]:
        """Get product-level sales summary."""
        query = select(
            AssortmentSale.product_id,
            func.sum(AssortmentSale.units_sold).label("total_units"),
            func.sum(AssortmentSale.revenue).label("total_revenue"),
            func.avg(AssortmentSale.facings).label("avg_facings"),
            func.count().label("total_weeks"),
        ).group_by(
            AssortmentSale.product_id,
        )

        if store_id:
            query = query.where(AssortmentSale.store_id == store_id)
        if year:
            query = query.where(AssortmentSale.year == year)

        result = await self.session.execute(query)
        return [
            {
                "product_id": row.product_id,
                "total_units": row.total_units,
                "total_revenue": float(row.total_revenue),
                "avg_facings": float(row.avg_facings),
                "total_weeks": row.total_weeks,
            }
            for row in result.all()
        ]


class SwitchingMatrixRepository(BaseRepository[SwitchingMatrix]):
    """Repository for SwitchingMatrix operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(SwitchingMatrix, session)

    async def get_by_from_brand(self, from_brand: str) -> list[SwitchingMatrix]:
        """Get switching probabilities from a brand."""
        result = await self.session.execute(
            select(SwitchingMatrix).where(SwitchingMatrix.from_brand == from_brand)
        )
        return list(result.scalars().all())

    async def get_matrix(
        self,
        subcategory: str | None = None,
    ) -> list[SwitchingMatrix]:
        """Get full switching matrix."""
        query = select(SwitchingMatrix)
        if subcategory:
            query = query.where(SwitchingMatrix.subcategory == subcategory)
        result = await self.session.execute(query)
        return list(result.scalars().all())


class OptimizationRunRepository(BaseRepository[OptimizationRun]):
    """Repository for OptimizationRun operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(OptimizationRun, session)

    async def get_by_store(
        self,
        store_id: UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> list[OptimizationRun]:
        """Get optimization runs for a store."""
        result = await self.session.execute(
            select(OptimizationRun)
            .where(OptimizationRun.store_id == store_id)
            .order_by(OptimizationRun.run_date.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_recent(
        self,
        limit: int = 20,
        user_id: str | None = None,
    ) -> list[OptimizationRun]:
        """Get recent optimization runs."""
        query = select(OptimizationRun).order_by(OptimizationRun.run_date.desc())
        if user_id:
            query = query.where(OptimizationRun.user_id == user_id)
        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_with_simulations(self, id: UUID) -> OptimizationRun | None:
        """Get optimization run with related simulations."""
        result = await self.session.execute(
            select(OptimizationRun)
            .options(selectinload(OptimizationRun.simulation_runs))
            .where(OptimizationRun.id == id)
        )
        return result.scalar_one_or_none()


class SimulationRunRepository(BaseRepository[SimulationRun]):
    """Repository for SimulationRun operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(SimulationRun, session)

    async def get_by_optimization(
        self,
        optimization_run_id: UUID,
    ) -> list[SimulationRun]:
        """Get simulations for an optimization run."""
        result = await self.session.execute(
            select(SimulationRun)
            .where(SimulationRun.optimization_run_id == optimization_run_id)
            .order_by(SimulationRun.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_recent(
        self,
        limit: int = 20,
        user_id: str | None = None,
    ) -> list[SimulationRun]:
        """Get recent simulation runs."""
        query = select(SimulationRun).order_by(SimulationRun.created_at.desc())
        if user_id:
            query = query.where(SimulationRun.user_id == user_id)
        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())


class ClusteringRunRepository(BaseRepository[ClusteringRun]):
    """Repository for ClusteringRun operations."""

    def __init__(self, session: AsyncSession):
        super().__init__(ClusteringRun, session)

    async def get_recent(
        self,
        limit: int = 20,
        user_id: str | None = None,
    ) -> list[ClusteringRun]:
        """Get recent clustering runs."""
        query = select(ClusteringRun).order_by(ClusteringRun.created_at.desc())
        if user_id:
            query = query.where(ClusteringRun.user_id == user_id)
        query = query.limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())


# Factory function to get repositories
def get_repositories(session: AsyncSession) -> dict[str, BaseRepository]:
    """Get all repositories."""
    return {
        "products": ProductRepository(session),
        "stores": StoreRepository(session),
        "sales": SaleRepository(session),
        "switching_matrix": SwitchingMatrixRepository(session),
        "optimization_runs": OptimizationRunRepository(session),
        "simulation_runs": SimulationRunRepository(session),
        "clustering_runs": ClusteringRunRepository(session),
    }
