"""
Assortment Optimization using greedy heuristic algorithm.

Optimizes SKU selection and facing allocation subject to business constraints.
This is a port of the original Streamlit app's optimizer to work with
the FastAPI microservice and SQLAlchemy models.
"""

import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.models import (
    AssortmentProduct,
    AssortmentSale,
    AssortmentStore,
    OptimizationRun,
    OptimizationStatus,
)
from app.db.repository import OptimizationRunRepository
from app.schemas.optimization import (
    ConstraintSatisfaction,
    OptimizationConstraints,
    OptimizationResult,
    ProductAllocation,
    SpaceAllocation,
)
from app.services.demand_model import DemandModelService

logger = get_logger(__name__)


@dataclass
class SKUMetrics:
    """Aggregated metrics for a SKU."""

    product_id: UUID
    sku: str
    name: str
    brand: str
    subcategory: str
    price: float
    price_tier: str | None
    space_elasticity: float
    avg_profit: float
    avg_units: float
    avg_revenue: float
    current_facings: int = 0


class AssortmentOptimizerService:
    """
    Assortment optimizer using greedy heuristic.

    Maximizes profit while respecting space and coverage constraints.

    Algorithm:
    1. Add must-carry items first
    2. Ensure subcategory coverage (min SKUs per subcategory)
    3. Ensure price tier coverage (min SKUs per price tier)
    4. Fill remaining space with highest profit SKUs
    5. Allocate extra facings to top performers
    6. Calculate profit lift with space elasticity effects
    """

    def __init__(
        self,
        session: AsyncSession,
        demand_service: DemandModelService | None = None,
    ):
        """Initialize the optimizer service.

        Args:
            session: Database session.
            demand_service: Optional demand model service for advanced calculations.
        """
        self.session = session
        self.demand_service = demand_service or DemandModelService()
        self.optimization_repo = OptimizationRunRepository(session)

    async def optimize(
        self,
        store_id: UUID | None,
        constraints: OptimizationConstraints,
        user_id: str | None = None,
        subcategories: list[str] | None = None,
    ) -> OptimizationResult:
        """Run the optimization to find the best assortment.

        Args:
            store_id: Store to optimize for (None for all stores).
            constraints: Optimization constraints.
            user_id: User who initiated the optimization.
            subcategories: Optional list of subcategories to include.

        Returns:
            OptimizationResult with complete results.
        """
        start_time = time.perf_counter()
        run_id = uuid4()

        logger.info(
            "Starting optimization",
            run_id=str(run_id),
            store_id=str(store_id) if store_id else None,
            total_facings=constraints.total_facings,
        )

        try:
            # Create optimization run record
            run_data = {
                "id": run_id,
                "store_id": store_id,
                "status": OptimizationStatus.RUNNING,
                "constraints": constraints.model_dump(),
                "user_id": user_id,
            }
            await self.optimization_repo.create(run_data)
            await self.session.flush()

            # Load data
            sku_metrics = await self._load_sku_metrics(store_id, subcategories)

            if not sku_metrics:
                raise ValueError("No products with sales data found")

            # Calculate current profit
            current_profit = sum(
                m.avg_profit for m in sku_metrics if m.current_facings > 0
            )

            # Run greedy optimization
            selected_facings = self._greedy_optimize(sku_metrics, constraints)

            # Calculate optimized profit with space elasticity
            optimized_profit = 0.0
            for sku, num_facings in selected_facings.items():
                metrics = next((m for m in sku_metrics if m.sku == sku), None)
                if metrics:
                    base_facings = metrics.current_facings or 2
                    elasticity = metrics.space_elasticity
                    adjusted_profit = metrics.avg_profit * (
                        num_facings / base_facings
                    ) ** elasticity
                    optimized_profit += adjusted_profit

            profit_lift = optimized_profit - current_profit
            profit_lift_pct = (
                (profit_lift / current_profit * 100) if current_profit > 0 else 0
            )

            # Build detailed results
            product_allocations = self._build_product_allocations(
                sku_metrics, selected_facings
            )
            space_allocations = self._build_space_allocations(
                sku_metrics, selected_facings, constraints.total_facings
            )
            constraint_checks = self._check_constraints(
                sku_metrics, selected_facings, constraints
            )

            # Count changes
            products_added = sum(
                1 for a in product_allocations
                if a.current_facings == 0 and a.optimized_facings > 0
            )
            products_removed = sum(
                1 for a in product_allocations
                if a.current_facings > 0 and a.optimized_facings == 0
            )
            products_unchanged = sum(
                1 for a in product_allocations
                if a.current_facings == a.optimized_facings
            )

            execution_time_ms = int((time.perf_counter() - start_time) * 1000)

            # Update run record
            await self.optimization_repo.update(
                run_id,
                {
                    "status": OptimizationStatus.COMPLETED,
                    "results": {
                        "selected_skus": list(selected_facings.keys()),
                        "facings": selected_facings,
                        "product_allocations": [a.model_dump() for a in product_allocations],
                        "space_allocations": [s.model_dump() for s in space_allocations],
                    },
                    "profit_lift_pct": profit_lift_pct,
                    "profit_lift_absolute": profit_lift,
                    "execution_time_ms": execution_time_ms,
                },
            )
            await self.session.commit()

            result = OptimizationResult(
                run_id=run_id,
                store_id=store_id,
                status=OptimizationStatus.COMPLETED,
                current_profit=round(current_profit, 2),
                optimized_profit=round(optimized_profit, 2),
                profit_lift_absolute=round(profit_lift, 2),
                profit_lift_pct=round(profit_lift_pct, 2),
                product_allocations=product_allocations,
                space_allocations=space_allocations,
                constraint_satisfaction=constraint_checks,
                products_added=products_added,
                products_removed=products_removed,
                products_unchanged=products_unchanged,
                execution_time_ms=execution_time_ms,
                run_date=datetime.now(timezone.utc),
            )

            logger.info(
                "Optimization completed",
                run_id=str(run_id),
                profit_lift_pct=profit_lift_pct,
                execution_time_ms=execution_time_ms,
            )

            return result

        except Exception as e:
            execution_time_ms = int((time.perf_counter() - start_time) * 1000)
            logger.error("Optimization failed", run_id=str(run_id), error=str(e))

            # Update run with error
            await self.optimization_repo.update(
                run_id,
                {
                    "status": OptimizationStatus.FAILED,
                    "error_message": str(e),
                    "execution_time_ms": execution_time_ms,
                },
            )
            await self.session.commit()

            raise

    async def _load_sku_metrics(
        self,
        store_id: UUID | None,
        subcategories: list[str] | None = None,
    ) -> list[SKUMetrics]:
        """Load SKU metrics from sales data.

        Args:
            store_id: Optional store filter.
            subcategories: Optional subcategory filter.

        Returns:
            List of SKUMetrics with aggregated sales data.
        """
        from sqlalchemy import func

        # Build query for sales aggregation
        query = (
            select(
                AssortmentProduct.id,
                AssortmentProduct.sku,
                AssortmentProduct.name,
                AssortmentProduct.brand,
                AssortmentProduct.subcategory,
                AssortmentProduct.price,
                AssortmentProduct.cost,
                AssortmentProduct.price_tier,
                AssortmentProduct.space_elasticity,
                func.avg(AssortmentSale.units_sold).label("avg_units"),
                func.avg(AssortmentSale.revenue).label("avg_revenue"),
                func.avg(AssortmentSale.facings).label("avg_facings"),
            )
            .join(AssortmentSale, AssortmentSale.product_id == AssortmentProduct.id)
            .where(AssortmentProduct.is_active == True)
            .group_by(
                AssortmentProduct.id,
                AssortmentProduct.sku,
                AssortmentProduct.name,
                AssortmentProduct.brand,
                AssortmentProduct.subcategory,
                AssortmentProduct.price,
                AssortmentProduct.cost,
                AssortmentProduct.price_tier,
                AssortmentProduct.space_elasticity,
            )
        )

        if store_id:
            query = query.where(AssortmentSale.store_id == store_id)

        if subcategories:
            query = query.where(AssortmentProduct.subcategory.in_(subcategories))

        result = await self.session.execute(query)
        rows = result.all()

        metrics = []
        for row in rows:
            avg_units = float(row.avg_units or 0)
            price = float(row.price)
            cost = float(row.cost)
            avg_profit = avg_units * (price - cost)
            avg_revenue = float(row.avg_revenue or 0)

            metrics.append(
                SKUMetrics(
                    product_id=row.id,
                    sku=row.sku,
                    name=row.name,
                    brand=row.brand,
                    subcategory=row.subcategory,
                    price=price,
                    price_tier=row.price_tier,
                    space_elasticity=float(row.space_elasticity),
                    avg_profit=avg_profit,
                    avg_units=avg_units,
                    avg_revenue=avg_revenue,
                    current_facings=int(row.avg_facings or 0),
                )
            )

        return metrics

    def _greedy_optimize(
        self,
        sku_metrics: list[SKUMetrics],
        constraints: OptimizationConstraints,
    ) -> dict[str, int]:
        """Run the greedy optimization algorithm.

        Algorithm:
        1. First satisfy must-carry constraints
        2. Ensure subcategory coverage (min SKUs per subcategory)
        3. Ensure price tier coverage (min SKUs per price tier)
        4. Fill remaining space with highest-profit SKUs
        5. Allocate extra facings to high-profit SKUs

        Args:
            sku_metrics: List of SKU metrics.
            constraints: Optimization constraints.

        Returns:
            Dictionary mapping SKU to facings.
        """
        selected: dict[str, int] = {}  # sku -> facings
        remaining_facings = constraints.total_facings

        # Build lookup maps
        sku_map = {m.sku: m for m in sku_metrics}
        exclude_set = set(constraints.exclude)

        # Filter out excluded SKUs
        available = [m for m in sku_metrics if m.sku not in exclude_set]

        # Sort by profit for ranking
        available_sorted = sorted(available, key=lambda m: m.avg_profit, reverse=True)

        # Step 1: Add must-carry items first
        for sku in constraints.must_carry:
            if sku in exclude_set:
                continue
            if sku in sku_map and remaining_facings >= constraints.min_facings_per_sku:
                facings = min(constraints.min_facings_per_sku, remaining_facings)
                selected[sku] = facings
                remaining_facings -= facings

        # Step 2: Ensure subcategory coverage
        subcategories = set(m.subcategory for m in available)
        for subcat in subcategories:
            subcat_skus = [m for m in available_sorted if m.subcategory == subcat]

            # Count already selected from this subcategory
            selected_from_subcat = sum(
                1 for sku in selected if sku_map.get(sku) and sku_map[sku].subcategory == subcat
            )

            needed = max(0, constraints.min_skus_per_subcategory - selected_from_subcat)

            for m in subcat_skus:
                if needed <= 0 or remaining_facings < constraints.min_facings_per_sku:
                    break
                if m.sku not in selected:
                    facings = min(constraints.min_facings_per_sku, remaining_facings)
                    selected[m.sku] = facings
                    remaining_facings -= facings
                    needed -= 1

        # Step 3: Ensure price tier coverage
        price_tiers = set(m.price_tier for m in available if m.price_tier)
        for tier in price_tiers:
            tier_skus = [m for m in available_sorted if m.price_tier == tier]

            # Count already selected from this tier
            selected_from_tier = sum(
                1 for sku in selected if sku_map.get(sku) and sku_map[sku].price_tier == tier
            )

            needed = max(0, constraints.min_skus_per_price_tier - selected_from_tier)

            for m in tier_skus:
                if needed <= 0 or remaining_facings < constraints.min_facings_per_sku:
                    break
                if m.sku not in selected:
                    facings = min(constraints.min_facings_per_sku, remaining_facings)
                    selected[m.sku] = facings
                    remaining_facings -= facings
                    needed -= 1

        # Step 4: Fill remaining space with best SKUs
        remaining_skus = [m for m in available_sorted if m.sku not in selected]

        for m in remaining_skus:
            if remaining_facings < constraints.min_facings_per_sku:
                break

            # Check brand constraint
            brand_count = sum(
                1 for sku in selected if sku_map.get(sku) and sku_map[sku].brand == m.brand
            )

            if brand_count >= constraints.max_skus_per_brand:
                continue

            facings = min(constraints.min_facings_per_sku, remaining_facings)
            selected[m.sku] = facings
            remaining_facings -= facings

        # Step 5: Allocate extra facings to high-profit SKUs
        selected_by_profit = sorted(
            selected.keys(),
            key=lambda sku: sku_map.get(sku, SKUMetrics(
                product_id=uuid4(), sku=sku, name="", brand="", subcategory="",
                price=0, price_tier=None, space_elasticity=0.15, avg_profit=0,
                avg_units=0, avg_revenue=0,
            )).avg_profit,
            reverse=True,
        )

        for sku in selected_by_profit:
            if remaining_facings <= 0:
                break
            current = selected[sku]
            can_add = min(
                constraints.max_facings_per_sku - current,
                remaining_facings,
            )
            if can_add > 0:
                selected[sku] += can_add
                remaining_facings -= can_add

        return selected

    def _build_product_allocations(
        self,
        sku_metrics: list[SKUMetrics],
        selected_facings: dict[str, int],
    ) -> list[ProductAllocation]:
        """Build detailed product allocation results.

        Args:
            sku_metrics: List of SKU metrics.
            selected_facings: Selected SKUs and their facings.

        Returns:
            List of ProductAllocation objects.
        """
        allocations = []
        sku_map = {m.sku: m for m in sku_metrics}

        # Include all SKUs that are either currently stocked or selected
        all_skus = set(selected_facings.keys()) | {
            m.sku for m in sku_metrics if m.current_facings > 0
        }

        for sku in all_skus:
            metrics = sku_map.get(sku)
            if not metrics:
                continue

            current_facings = metrics.current_facings
            optimized_facings = selected_facings.get(sku, 0)
            facing_change = optimized_facings - current_facings

            # Calculate profits
            base_facings = current_facings or 2
            current_profit = metrics.avg_profit if current_facings > 0 else 0

            if optimized_facings > 0:
                optimized_profit = metrics.avg_profit * (
                    optimized_facings / base_facings
                ) ** metrics.space_elasticity
            else:
                optimized_profit = 0

            profit_change = optimized_profit - current_profit
            profit_change_pct = (
                (profit_change / current_profit * 100) if current_profit > 0 else 0
            )

            allocations.append(
                ProductAllocation(
                    product_id=metrics.product_id,
                    sku=metrics.sku,
                    name=metrics.name,
                    brand=metrics.brand,
                    subcategory=metrics.subcategory,
                    current_facings=current_facings,
                    optimized_facings=optimized_facings,
                    facing_change=facing_change,
                    current_profit=round(current_profit, 2),
                    optimized_profit=round(optimized_profit, 2),
                    profit_change=round(profit_change, 2),
                    profit_change_pct=round(profit_change_pct, 2),
                )
            )

        # Sort by profit change descending
        allocations.sort(key=lambda a: a.profit_change, reverse=True)

        return allocations

    def _build_space_allocations(
        self,
        sku_metrics: list[SKUMetrics],
        selected_facings: dict[str, int],
        total_facings: int,
    ) -> list[SpaceAllocation]:
        """Build space allocation summary by subcategory.

        Args:
            sku_metrics: List of SKU metrics.
            selected_facings: Selected SKUs and their facings.
            total_facings: Total facings available.

        Returns:
            List of SpaceAllocation objects.
        """
        sku_map = {m.sku: m for m in sku_metrics}

        # Calculate current facings by subcategory
        current_by_subcat: dict[str, int] = {}
        for m in sku_metrics:
            if m.current_facings > 0:
                current_by_subcat[m.subcategory] = (
                    current_by_subcat.get(m.subcategory, 0) + m.current_facings
                )

        # Calculate optimized facings by subcategory
        optimized_by_subcat: dict[str, int] = {}
        for sku, facings in selected_facings.items():
            metrics = sku_map.get(sku)
            if metrics:
                optimized_by_subcat[metrics.subcategory] = (
                    optimized_by_subcat.get(metrics.subcategory, 0) + facings
                )

        # Calculate totals for percentages
        current_total = sum(current_by_subcat.values()) or 1
        optimized_total = sum(optimized_by_subcat.values()) or 1

        # Build allocations
        all_subcats = set(current_by_subcat.keys()) | set(optimized_by_subcat.keys())
        allocations = []

        for subcat in sorted(all_subcats):
            current = current_by_subcat.get(subcat, 0)
            optimized = optimized_by_subcat.get(subcat, 0)

            allocations.append(
                SpaceAllocation(
                    subcategory=subcat,
                    current_facings=current,
                    optimized_facings=optimized,
                    current_pct=round(current / current_total * 100, 1),
                    optimized_pct=round(optimized / optimized_total * 100, 1),
                    change=optimized - current,
                )
            )

        return allocations

    def _check_constraints(
        self,
        sku_metrics: list[SKUMetrics],
        selected_facings: dict[str, int],
        constraints: OptimizationConstraints,
    ) -> list[ConstraintSatisfaction]:
        """Check if all constraints are satisfied.

        Args:
            sku_metrics: List of SKU metrics.
            selected_facings: Selected SKUs and their facings.
            constraints: Optimization constraints.

        Returns:
            List of ConstraintSatisfaction objects.
        """
        sku_map = {m.sku: m for m in sku_metrics}
        checks = []

        # Total facings
        total_used = sum(selected_facings.values())
        checks.append(
            ConstraintSatisfaction(
                constraint_name="total_facings",
                satisfied=total_used <= constraints.total_facings,
                current_value=total_used,
                required_value=constraints.total_facings,
                message=f"Used {total_used} of {constraints.total_facings} facings",
            )
        )

        # Min/Max facings per SKU
        for sku, facings in selected_facings.items():
            if facings < constraints.min_facings_per_sku:
                checks.append(
                    ConstraintSatisfaction(
                        constraint_name=f"min_facings_{sku}",
                        satisfied=False,
                        current_value=facings,
                        required_value=constraints.min_facings_per_sku,
                        message=f"SKU {sku} has {facings} facings, min is {constraints.min_facings_per_sku}",
                    )
                )
            if facings > constraints.max_facings_per_sku:
                checks.append(
                    ConstraintSatisfaction(
                        constraint_name=f"max_facings_{sku}",
                        satisfied=False,
                        current_value=facings,
                        required_value=constraints.max_facings_per_sku,
                        message=f"SKU {sku} has {facings} facings, max is {constraints.max_facings_per_sku}",
                    )
                )

        # SKUs per subcategory
        subcat_counts: dict[str, int] = {}
        for sku in selected_facings:
            m = sku_map.get(sku)
            if m:
                subcat_counts[m.subcategory] = subcat_counts.get(m.subcategory, 0) + 1

        for subcat in set(m.subcategory for m in sku_metrics):
            count = subcat_counts.get(subcat, 0)
            satisfied = count >= constraints.min_skus_per_subcategory
            checks.append(
                ConstraintSatisfaction(
                    constraint_name=f"min_skus_subcategory_{subcat}",
                    satisfied=satisfied,
                    current_value=count,
                    required_value=constraints.min_skus_per_subcategory,
                    message=f"{subcat}: {count} SKUs (min {constraints.min_skus_per_subcategory})",
                )
            )

        # SKUs per price tier
        tier_counts: dict[str, int] = {}
        for sku in selected_facings:
            m = sku_map.get(sku)
            if m and m.price_tier:
                tier_counts[m.price_tier] = tier_counts.get(m.price_tier, 0) + 1

        for tier in set(m.price_tier for m in sku_metrics if m.price_tier):
            count = tier_counts.get(tier, 0)
            satisfied = count >= constraints.min_skus_per_price_tier
            checks.append(
                ConstraintSatisfaction(
                    constraint_name=f"min_skus_price_tier_{tier}",
                    satisfied=satisfied,
                    current_value=count,
                    required_value=constraints.min_skus_per_price_tier,
                    message=f"Price tier {tier}: {count} SKUs (min {constraints.min_skus_per_price_tier})",
                )
            )

        # SKUs per brand
        brand_counts: dict[str, int] = {}
        for sku in selected_facings:
            m = sku_map.get(sku)
            if m:
                brand_counts[m.brand] = brand_counts.get(m.brand, 0) + 1

        for brand, count in brand_counts.items():
            if count > constraints.max_skus_per_brand:
                checks.append(
                    ConstraintSatisfaction(
                        constraint_name=f"max_skus_brand_{brand}",
                        satisfied=False,
                        current_value=count,
                        required_value=constraints.max_skus_per_brand,
                        message=f"Brand {brand}: {count} SKUs (max {constraints.max_skus_per_brand})",
                    )
                )

        # Must-carry items
        for sku in constraints.must_carry:
            included = sku in selected_facings
            checks.append(
                ConstraintSatisfaction(
                    constraint_name=f"must_carry_{sku}",
                    satisfied=included,
                    current_value=included,
                    required_value=True,
                    message=f"Must-carry SKU {sku}: {'included' if included else 'MISSING'}",
                )
            )

        # Excluded items
        for sku in constraints.exclude:
            excluded = sku not in selected_facings
            checks.append(
                ConstraintSatisfaction(
                    constraint_name=f"exclude_{sku}",
                    satisfied=excluded,
                    current_value=not excluded,
                    required_value=False,
                    message=f"Excluded SKU {sku}: {'excluded' if excluded else 'INCLUDED (error)'}",
                )
            )

        return checks

    async def get_optimization_run(self, run_id: UUID) -> OptimizationRun | None:
        """Get an optimization run by ID.

        Args:
            run_id: Optimization run ID.

        Returns:
            OptimizationRun or None if not found.
        """
        return await self.optimization_repo.get_by_id(run_id)

    async def get_optimization_history(
        self,
        store_id: UUID | None = None,
        user_id: str | None = None,
        limit: int = 20,
    ) -> list[OptimizationRun]:
        """Get optimization history.

        Args:
            store_id: Optional store filter.
            user_id: Optional user filter.
            limit: Maximum number of results.

        Returns:
            List of OptimizationRun objects.
        """
        if store_id:
            return await self.optimization_repo.get_by_store(store_id, limit=limit)
        else:
            return await self.optimization_repo.get_recent(limit=limit, user_id=user_id)

    async def delete_optimization_run(self, run_id: UUID) -> bool:
        """Delete an optimization run.

        Args:
            run_id: Optimization run ID.

        Returns:
            True if deleted, False if not found.
        """
        deleted = await self.optimization_repo.delete(run_id)
        await self.session.commit()
        return deleted

    async def compare_runs(
        self,
        run_id_1: UUID,
        run_id_2: UUID,
    ) -> dict[str, Any]:
        """Compare two optimization runs.

        Args:
            run_id_1: First run ID.
            run_id_2: Second run ID.

        Returns:
            Comparison dictionary.
        """
        run1 = await self.optimization_repo.get_by_id(run_id_1)
        run2 = await self.optimization_repo.get_by_id(run_id_2)

        if not run1 or not run2:
            raise ValueError("One or both optimization runs not found")

        # Compare profit lifts
        lift1 = float(run1.profit_lift_pct or 0)
        lift2 = float(run2.profit_lift_pct or 0)

        # Compare facings allocations
        facings1 = run1.results.get("facings", {}) if run1.results else {}
        facings2 = run2.results.get("facings", {}) if run2.results else {}

        all_skus = set(facings1.keys()) | set(facings2.keys())
        products_diff = []

        for sku in all_skus:
            f1 = facings1.get(sku, 0)
            f2 = facings2.get(sku, 0)
            if f1 != f2:
                products_diff.append({
                    "sku": sku,
                    "run1_facings": f1,
                    "run2_facings": f2,
                    "difference": f2 - f1,
                })

        return {
            "run_id_1": run_id_1,
            "run_id_2": run_id_2,
            "profit_lift_pct_1": lift1,
            "profit_lift_pct_2": lift2,
            "profit_lift_diff": lift2 - lift1,
            "products_diff": products_diff,
            "total_products_changed": len(products_diff),
        }
