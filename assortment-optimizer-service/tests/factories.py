"""Factory definitions for test data generation using factory-boy patterns."""

import uuid
from datetime import datetime, timezone
from typing import Any

from app.db.models import (
    AssortmentProduct,
    AssortmentSale,
    AssortmentStore,
    BrandTier,
    ClusteringRun,
    IncomeIndex,
    LocationType,
    OptimizationRun,
    OptimizationStatus,
    ScenarioType,
    SimulationRun,
    StoreFormat,
)


class BaseFactory:
    """Base factory with common functionality."""

    model = None
    _counter = 0

    @classmethod
    def _get_counter(cls) -> int:
        """Get unique counter for this factory."""
        cls._counter += 1
        return cls._counter

    @classmethod
    def build(cls, **kwargs) -> Any:
        """Build a model instance without saving."""
        if cls.model is None:
            raise NotImplementedError("Subclass must define model class")

        defaults = cls.get_defaults()
        defaults.update(kwargs)
        return cls.model(**defaults)

    @classmethod
    def get_defaults(cls) -> dict:
        """Get default attribute values. Override in subclasses."""
        return {}

    @classmethod
    async def create(cls, session, **kwargs) -> Any:
        """Create and save a model instance."""
        instance = cls.build(**kwargs)
        session.add(instance)
        await session.commit()
        await session.refresh(instance)
        return instance

    @classmethod
    async def create_batch(cls, session, count: int, **kwargs) -> list:
        """Create multiple instances."""
        instances = [cls.build(**kwargs) for _ in range(count)]
        session.add_all(instances)
        await session.commit()
        for instance in instances:
            await session.refresh(instance)
        return instances


class ProductFactory(BaseFactory):
    """Factory for AssortmentProduct model."""

    model = AssortmentProduct

    # Available options for variety
    BRANDS = ["Coca-Cola", "Pepsi", "Sprite", "7-Up", "Fanta", "Red Bull", "Monster", "Store Brand"]
    BRAND_TIERS = list(BrandTier)
    SUBCATEGORIES = ["Soft Drinks", "Juices", "Water", "Energy Drinks"]
    SIZES = ["12oz", "16oz", "20oz", "2L", "6-pack", "12-pack"]
    PACK_TYPES = ["Single", "6-pack", "12-pack", "Case"]
    PRICE_TIERS = ["Value", "Mid", "Premium"]

    @classmethod
    def get_defaults(cls) -> dict:
        """Generate default product attributes."""
        n = cls._get_counter()
        brand_idx = n % len(cls.BRANDS)
        brand = cls.BRANDS[brand_idx]

        # Determine brand tier based on brand
        if brand == "Store Brand":
            brand_tier = BrandTier.STORE_BRAND
        elif brand in ["Coca-Cola", "Pepsi", "Red Bull"]:
            brand_tier = BrandTier.PREMIUM
        elif brand in ["Sprite", "Fanta", "Monster"]:
            brand_tier = BrandTier.NATIONAL_A
        else:
            brand_tier = BrandTier.NATIONAL_B

        return {
            "id": uuid.uuid4(),
            "sku": f"SKU-{n:06d}",
            "name": f"{brand} {cls.SIZES[n % len(cls.SIZES)]}",
            "brand": brand,
            "brand_tier": brand_tier,
            "subcategory": cls.SUBCATEGORIES[n % len(cls.SUBCATEGORIES)],
            "size": cls.SIZES[n % len(cls.SIZES)],
            "pack_type": cls.PACK_TYPES[n % len(cls.PACK_TYPES)],
            "price": round(1.99 + (n % 10) * 0.5, 2),
            "cost": round(0.99 + (n % 10) * 0.25, 2),
            "width_inches": round(2.5 + (n % 3), 2),
            "space_elasticity": 0.15,
            "flavor": f"Original" if n % 2 == 0 else None,
            "price_tier": cls.PRICE_TIERS[n % len(cls.PRICE_TIERS)],
            "is_active": True,
        }

    @classmethod
    def build_premium(cls, **kwargs) -> AssortmentProduct:
        """Build a premium brand product."""
        defaults = {
            "brand": "Coca-Cola",
            "brand_tier": BrandTier.PREMIUM,
            "price": 3.99,
            "cost": 2.00,
            "price_tier": "Premium",
        }
        defaults.update(kwargs)
        return cls.build(**defaults)

    @classmethod
    def build_store_brand(cls, **kwargs) -> AssortmentProduct:
        """Build a store brand product."""
        defaults = {
            "brand": "Store Brand",
            "brand_tier": BrandTier.STORE_BRAND,
            "price": 1.49,
            "cost": 0.75,
            "price_tier": "Value",
        }
        defaults.update(kwargs)
        return cls.build(**defaults)


class StoreFactory(BaseFactory):
    """Factory for AssortmentStore model."""

    model = AssortmentStore

    FORMATS = list(StoreFormat)
    LOCATIONS = list(LocationType)
    INCOMES = list(IncomeIndex)
    REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West"]

    @classmethod
    def get_defaults(cls) -> dict:
        """Generate default store attributes."""
        n = cls._get_counter()

        return {
            "id": uuid.uuid4(),
            "store_code": f"S{n:05d}",
            "name": f"Store #{n}",
            "format": cls.FORMATS[n % len(cls.FORMATS)],
            "location_type": cls.LOCATIONS[n % len(cls.LOCATIONS)],
            "income_index": cls.INCOMES[n % len(cls.INCOMES)],
            "total_facings": 100 + (n % 5) * 20,
            "num_shelves": 4,
            "shelf_width_inches": 48.0,
            "weekly_traffic": 2000 + (n % 10) * 500,
            "region": cls.REGIONS[n % len(cls.REGIONS)],
            "is_active": True,
        }

    @classmethod
    def build_superstore(cls, **kwargs) -> AssortmentStore:
        """Build a superstore format store."""
        defaults = {
            "format": StoreFormat.SUPERSTORE,
            "total_facings": 200,
            "num_shelves": 6,
            "weekly_traffic": 8000,
        }
        defaults.update(kwargs)
        return cls.build(**defaults)

    @classmethod
    def build_express(cls, **kwargs) -> AssortmentStore:
        """Build an express format store."""
        defaults = {
            "format": StoreFormat.EXPRESS,
            "total_facings": 60,
            "num_shelves": 3,
            "weekly_traffic": 1500,
        }
        defaults.update(kwargs)
        return cls.build(**defaults)


class SaleFactory(BaseFactory):
    """Factory for AssortmentSale model."""

    model = AssortmentSale

    @classmethod
    def get_defaults(cls) -> dict:
        """Generate default sale attributes."""
        import random

        n = cls._get_counter()

        return {
            "id": uuid.uuid4(),
            "product_id": uuid.uuid4(),  # Should be overridden
            "store_id": uuid.uuid4(),  # Should be overridden
            "week_number": (n % 52) + 1,
            "year": 2024,
            "units_sold": random.randint(10, 100),
            "revenue": round(random.uniform(50, 500), 2),
            "facings": random.randint(1, 5),
            "on_promotion": random.random() > 0.8,
        }

    @classmethod
    def build_for_product_store(
        cls,
        product_id: uuid.UUID,
        store_id: uuid.UUID,
        week: int = 1,
        **kwargs
    ) -> AssortmentSale:
        """Build a sale for specific product and store."""
        defaults = {
            "product_id": product_id,
            "store_id": store_id,
            "week_number": week,
        }
        defaults.update(kwargs)
        return cls.build(**defaults)


class OptimizationRunFactory(BaseFactory):
    """Factory for OptimizationRun model."""

    model = OptimizationRun

    @classmethod
    def get_defaults(cls) -> dict:
        """Generate default optimization run attributes."""
        return {
            "id": uuid.uuid4(),
            "store_id": None,  # Can be set
            "status": OptimizationStatus.COMPLETED,
            "constraints": {
                "total_facings": 100,
                "min_facings_per_sku": 1,
                "max_facings_per_sku": 6,
            },
            "results": {
                "profit_lift_pct": 5.0,
                "profit_lift_absolute": 500.0,
                "product_allocations": [],
            },
            "profit_lift_pct": 5.0,
            "profit_lift_absolute": 500.0,
            "execution_time_ms": 1000,
            "user_id": "test-user",
        }

    @classmethod
    def build_pending(cls, **kwargs) -> OptimizationRun:
        """Build a pending optimization run."""
        defaults = {
            "status": OptimizationStatus.PENDING,
            "results": None,
            "profit_lift_pct": None,
            "profit_lift_absolute": None,
        }
        defaults.update(kwargs)
        return cls.build(**defaults)

    @classmethod
    def build_failed(cls, **kwargs) -> OptimizationRun:
        """Build a failed optimization run."""
        defaults = {
            "status": OptimizationStatus.FAILED,
            "results": None,
            "profit_lift_pct": None,
            "profit_lift_absolute": None,
            "error_message": "Optimization failed: infeasible constraints",
        }
        defaults.update(kwargs)
        return cls.build(**defaults)


class SimulationRunFactory(BaseFactory):
    """Factory for SimulationRun model."""

    model = SimulationRun

    @classmethod
    def get_defaults(cls) -> dict:
        """Generate default simulation run attributes."""
        return {
            "id": uuid.uuid4(),
            "optimization_run_id": None,
            "scenario_type": ScenarioType.REMOVE_SKU,
            "parameters": {"sku": "TEST-SKU-001"},
            "num_trials": 1000,
            "status": OptimizationStatus.COMPLETED,
            "results": {
                "revenue_mean": 10000.0,
                "revenue_std": 500.0,
                "profit_mean": 2500.0,
                "profit_std": 125.0,
                "probability_positive": 0.85,
            },
            "execution_time_ms": 500,
            "user_id": "test-user",
        }

    @classmethod
    def build_price_change(cls, **kwargs) -> SimulationRun:
        """Build a price change simulation."""
        defaults = {
            "scenario_type": ScenarioType.CHANGE_PRICE,
            "parameters": {
                "sku": "TEST-SKU-001",
                "current_price": 2.99,
                "new_price": 2.49,
            },
        }
        defaults.update(kwargs)
        return cls.build(**defaults)

    @classmethod
    def build_facings_change(cls, **kwargs) -> SimulationRun:
        """Build a facings change simulation."""
        defaults = {
            "scenario_type": ScenarioType.CHANGE_FACINGS,
            "parameters": {
                "sku": "TEST-SKU-001",
                "current_facings": 2,
                "new_facings": 4,
            },
        }
        defaults.update(kwargs)
        return cls.build(**defaults)


class ClusteringRunFactory(BaseFactory):
    """Factory for ClusteringRun model."""

    model = ClusteringRun

    @classmethod
    def get_defaults(cls) -> dict:
        """Generate default clustering run attributes."""
        return {
            "id": uuid.uuid4(),
            "method": "kmeans",
            "n_clusters": 4,
            "features_used": ["revenue", "premium_share", "traffic"],
            "silhouette_score": 0.45,
            "status": OptimizationStatus.COMPLETED,
            "cluster_assignments": {
                "S001": 0,
                "S002": 1,
                "S003": 0,
                "S004": 2,
                "S005": 3,
            },
            "cluster_profiles": [
                {"cluster_id": 0, "avg_revenue": 5000, "store_count": 2},
                {"cluster_id": 1, "avg_revenue": 8000, "store_count": 1},
                {"cluster_id": 2, "avg_revenue": 3000, "store_count": 1},
                {"cluster_id": 3, "avg_revenue": 6000, "store_count": 1},
            ],
            "pca_coordinates": [
                {"store_id": "S001", "pc1": 1.5, "pc2": -0.5},
                {"store_id": "S002", "pc1": -1.0, "pc2": 2.0},
                {"store_id": "S003", "pc1": 1.2, "pc2": -0.3},
            ],
            "execution_time_ms": 500,
            "user_id": "test-user",
        }

    @classmethod
    def build_gmm(cls, **kwargs) -> ClusteringRun:
        """Build a GMM clustering run."""
        defaults = {
            "method": "gmm",
        }
        defaults.update(kwargs)
        return cls.build(**defaults)
