"""
Synthetic data generator for Beverages category.

Generates 80 SKUs across 4 subcategories, 25 stores, and 52 weeks of sales data.
This is a port of the original Streamlit app's data generator to work with
the FastAPI microservice and SQLAlchemy models.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.models import (
    AssortmentProduct,
    AssortmentSale,
    AssortmentStore,
    BrandTier,
    IncomeIndex,
    LocationType,
    StoreFormat,
    SwitchingMatrix,
)
from app.db.repository import (
    ProductRepository,
    SaleRepository,
    StoreRepository,
    SwitchingMatrixRepository,
)

logger = get_logger(__name__)


@dataclass
class SubcategoryConfig:
    """Configuration for a product subcategory."""

    brands: list[str]
    brand_tiers: list[BrandTier]
    flavors: list[str]
    space_elasticity: float


@dataclass
class SizeConfig:
    """Configuration for a product size."""

    oz: float
    width: float


@dataclass
class PackConfig:
    """Configuration for a pack type."""

    count: int
    width_mult: float


class DataGeneratorService:
    """Service for generating synthetic assortment data."""

    # Subcategory configurations
    SUBCATEGORIES: dict[str, SubcategoryConfig] = {
        "Soft Drinks": SubcategoryConfig(
            brands=["Coca-Cola", "Pepsi", "Dr Pepper", "Store Brand"],
            brand_tiers=[
                BrandTier.NATIONAL_A,
                BrandTier.NATIONAL_A,
                BrandTier.NATIONAL_B,
                BrandTier.STORE_BRAND,
            ],
            flavors=["Original", "Diet", "Zero Sugar", "Cherry", "Vanilla"],
            space_elasticity=0.15,
        ),
        "Juices": SubcategoryConfig(
            brands=["Tropicana", "Minute Maid", "Simply", "Store Brand"],
            brand_tiers=[
                BrandTier.NATIONAL_A,
                BrandTier.NATIONAL_A,
                BrandTier.NATIONAL_B,
                BrandTier.STORE_BRAND,
            ],
            flavors=["Orange", "Apple", "Grape", "Fruit Punch", "Cranberry"],
            space_elasticity=0.18,
        ),
        "Water": SubcategoryConfig(
            brands=["Aquafina", "Dasani", "Evian", "Store Brand"],
            brand_tiers=[
                BrandTier.NATIONAL_A,
                BrandTier.NATIONAL_A,
                BrandTier.PREMIUM,
                BrandTier.STORE_BRAND,
            ],
            flavors=["Plain", "Lemon", "Lime", "Berry"],
            space_elasticity=0.10,
        ),
        "Energy Drinks": SubcategoryConfig(
            brands=["Red Bull", "Monster", "Rockstar", "Store Brand"],
            brand_tiers=[
                BrandTier.PREMIUM,
                BrandTier.NATIONAL_A,
                BrandTier.NATIONAL_B,
                BrandTier.STORE_BRAND,
            ],
            flavors=["Original", "Sugar Free", "Tropical", "Berry Blast"],
            space_elasticity=0.25,
        ),
    }

    # Size configurations
    SIZES: dict[str, SizeConfig] = {
        "12oz": SizeConfig(oz=12, width=2.5),
        "20oz": SizeConfig(oz=20, width=3.0),
        "1L": SizeConfig(oz=33.8, width=3.5),
        "2L": SizeConfig(oz=67.6, width=4.5),
    }

    # Pack type configurations
    PACK_TYPES: dict[str, PackConfig] = {
        "Single": PackConfig(count=1, width_mult=1.0),
        "6-pack": PackConfig(count=6, width_mult=2.5),
        "12-pack": PackConfig(count=12, width_mult=4.0),
        "24-pack": PackConfig(count=24, width_mult=6.0),
    }

    # Brand tier price multipliers
    TIER_PRICE_MULT: dict[BrandTier, float] = {
        BrandTier.PREMIUM: 1.4,
        BrandTier.NATIONAL_A: 1.2,
        BrandTier.NATIONAL_B: 1.0,
        BrandTier.STORE_BRAND: 0.7,
    }

    # Seasonality pattern (summer peak for beverages)
    SEASONALITY = np.array([
        0.8, 0.8, 0.85, 0.9, 0.95, 1.0,  # Jan-Jun (winter to spring)
        1.15, 1.2, 1.15, 1.0, 0.9, 0.85,  # Jul-Dec (summer peak, fall decline)
    ])

    def __init__(self, session: AsyncSession, seed: int = 42):
        """Initialize the data generator.

        Args:
            session: Async database session.
            seed: Random seed for reproducibility.
        """
        self.session = session
        self.seed = seed
        self._rng = np.random.default_rng(seed)

        # Initialize repositories
        self.product_repo = ProductRepository(session)
        self.store_repo = StoreRepository(session)
        self.sale_repo = SaleRepository(session)
        self.switching_repo = SwitchingMatrixRepository(session)

    def _set_seed(self) -> None:
        """Reset the random number generator to the initial seed."""
        self._rng = np.random.default_rng(self.seed)

    def generate_products(self, count: int = 80) -> list[dict[str, Any]]:
        """Generate beverage products across 4 subcategories.

        Args:
            count: Target number of products (approximately 80 for 4 subcats x 4 brands x 5 SKUs).

        Returns:
            List of product dictionaries ready for database insertion.
        """
        self._set_seed()
        products = []
        sku_id = 1

        pack_probs = [0.4, 0.3, 0.2, 0.1]
        pack_names = list(self.PACK_TYPES.keys())
        size_names = list(self.SIZES.keys())

        for subcat, config in self.SUBCATEGORIES.items():
            for brand_idx, brand in enumerate(config.brands):
                brand_tier = config.brand_tiers[brand_idx]
                tier_price_mult = self.TIER_PRICE_MULT[brand_tier]

                # Generate 5 SKUs per brand (20 per subcategory = 80 total)
                num_skus = 5
                for _ in range(num_skus):
                    # Randomly select attributes
                    size_name = self._rng.choice(size_names)
                    size_info = self.SIZES[size_name]

                    # Pack type distribution: more singles and 6-packs
                    pack_name = self._rng.choice(pack_names, p=pack_probs)
                    pack_info = self.PACK_TYPES[pack_name]

                    flavor = self._rng.choice(config.flavors)

                    # Calculate price based on size, pack, and brand tier
                    base_price_per_oz = 0.08
                    price_variation = 1 + self._rng.uniform(-0.1, 0.1)
                    price = (
                        base_price_per_oz
                        * size_info.oz
                        * pack_info.count
                        * tier_price_mult
                        * price_variation
                    )
                    price = round(price, 2)

                    # Determine price tier
                    if price < 3:
                        price_tier = "Value"
                    elif price < 8:
                        price_tier = "Mid"
                    else:
                        price_tier = "Premium"

                    # Cost and margin
                    if brand_tier == BrandTier.STORE_BRAND:
                        margin_pct = self._rng.uniform(0.35, 0.50)
                    else:
                        margin_pct = self._rng.uniform(0.25, 0.40)
                    cost = round(price * (1 - margin_pct), 2)

                    # Physical dimensions
                    width = round(size_info.width * pack_info.width_mult, 1)

                    # Generate product name
                    name = f"{brand} {flavor} {size_name}"
                    if pack_info.count > 1:
                        name += f" {pack_name}"

                    products.append({
                        "sku": f"SKU-{sku_id:04d}",
                        "name": name,
                        "subcategory": subcat,
                        "brand": brand,
                        "brand_tier": brand_tier,
                        "size": size_name,
                        "pack_type": pack_name,
                        "price": price,
                        "cost": cost,
                        "price_tier": price_tier,
                        "flavor": flavor,
                        "width_inches": width,
                        "space_elasticity": config.space_elasticity,
                        "is_active": True,
                    })
                    sku_id += 1

        logger.info("Generated products", count=len(products))
        return products

    def generate_stores(self, count: int = 25) -> list[dict[str, Any]]:
        """Generate stores with various attributes.

        Args:
            count: Number of stores to generate.

        Returns:
            List of store dictionaries ready for database insertion.
        """
        self._set_seed()

        formats = [StoreFormat.EXPRESS, StoreFormat.STANDARD, StoreFormat.SUPERSTORE]
        format_weights = [0.2, 0.5, 0.3]

        locations = [LocationType.URBAN, LocationType.SUBURBAN, LocationType.RURAL]
        location_weights = [0.3, 0.5, 0.2]

        income_levels = [IncomeIndex.LOW, IncomeIndex.MEDIUM, IncomeIndex.HIGH]

        # Income probability by location
        income_probs_by_location = {
            LocationType.URBAN: [0.2, 0.4, 0.4],
            LocationType.SUBURBAN: [0.2, 0.5, 0.3],
            LocationType.RURAL: [0.4, 0.4, 0.2],
        }

        # Base traffic by format
        base_traffic = {
            StoreFormat.EXPRESS: 3000,
            StoreFormat.STANDARD: 8000,
            StoreFormat.SUPERSTORE: 15000,
        }

        # Location multiplier for traffic
        location_mult = {
            LocationType.URBAN: 1.2,
            LocationType.SUBURBAN: 1.0,
            LocationType.RURAL: 0.7,
        }

        # Sections by format
        sections_by_format = {
            StoreFormat.EXPRESS: 2,
            StoreFormat.STANDARD: 4,
            StoreFormat.SUPERSTORE: 6,
        }

        facings_per_section = 30

        stores = []
        for i in range(1, count + 1):
            # Use indices for numpy choice to avoid numpy string conversion
            format_idx = self._rng.choice(len(formats), p=format_weights)
            store_format = formats[format_idx]

            location_idx = self._rng.choice(len(locations), p=location_weights)
            location = locations[location_idx]

            # Income correlated with location
            income_idx = self._rng.choice(
                len(income_levels), p=income_probs_by_location[location]
            )
            income = income_levels[income_idx]

            # Traffic based on format and location
            traffic = int(
                base_traffic[store_format]
                * location_mult[location]
                * self._rng.uniform(0.8, 1.2)
            )

            sections = sections_by_format[store_format]

            stores.append({
                "store_code": f"STORE-{i:03d}",
                "name": f"Store #{i:03d}",
                "format": store_format,
                "location_type": location,
                "income_index": income,
                "weekly_traffic": traffic,
                "num_shelves": sections,
                "shelf_width_inches": 48.0,
                "total_facings": sections * facings_per_section,
                "is_active": True,
            })

        logger.info("Generated stores", count=len(stores))
        return stores

    def generate_sales(
        self,
        products: list[dict[str, Any]],
        stores: list[dict[str, Any]],
        product_id_map: dict[str, UUID],
        store_id_map: dict[str, UUID],
        weeks: int = 52,
        year: int = 2024,
    ) -> list[dict[str, Any]]:
        """Generate weekly sales data with seasonality.

        Args:
            products: List of product dictionaries (with sku field).
            stores: List of store dictionaries (with store_code field).
            product_id_map: Mapping from SKU to product UUID.
            store_id_map: Mapping from store_code to store UUID.
            weeks: Number of weeks to simulate.
            year: Year for the sales data.

        Returns:
            List of sales dictionaries ready for database insertion.
        """
        self._set_seed()

        # Extend seasonality pattern to cover weeks
        week_seasonality = np.tile(self.SEASONALITY, 5)[:weeks]

        # Precompute income multipliers
        income_premium_mult = {
            IncomeIndex.LOW: 0.7,
            IncomeIndex.MEDIUM: 1.0,
            IncomeIndex.HIGH: 1.4,
        }
        income_value_mult = {
            IncomeIndex.LOW: 1.3,
            IncomeIndex.MEDIUM: 1.0,
            IncomeIndex.HIGH: 0.8,
        }

        # Tier base units
        tier_base = {
            BrandTier.PREMIUM: 15,
            BrandTier.NATIONAL_A: 25,
            BrandTier.NATIONAL_B: 20,
            BrandTier.STORE_BRAND: 18,
        }

        # Pack multipliers
        pack_mult = {
            "Single": 1.5,
            "6-pack": 1.0,
            "12-pack": 0.7,
            "24-pack": 0.4,
        }

        sales_records = []

        for store in stores:
            store_id = store_id_map[store["store_code"]]
            traffic_factor = store["weekly_traffic"] / 8000  # Normalize to standard

            income_idx = store["income_index"]
            if isinstance(income_idx, str):
                income_idx = IncomeIndex(income_idx)

            for product in products:
                product_id = product_id_map[product["sku"]]

                brand_tier = product["brand_tier"]
                if isinstance(brand_tier, str):
                    brand_tier = BrandTier(brand_tier)

                base_units = (
                    tier_base[brand_tier]
                    * pack_mult.get(product["pack_type"], 1.0)
                    * traffic_factor
                )

                # Apply income-based price tier adjustment
                price_tier = product.get("price_tier", "Mid")
                if price_tier == "Premium":
                    base_units *= income_premium_mult[income_idx]
                elif price_tier == "Value":
                    base_units *= income_value_mult[income_idx]

                price = product["price"]
                margin = price - product["cost"]

                for week in range(1, weeks + 1):
                    # Apply seasonality
                    seasonal_units = base_units * week_seasonality[week - 1]

                    # Add random variation (CV = 0.15)
                    units = max(
                        0,
                        int(
                            self._rng.normal(
                                seasonal_units, seasonal_units * 0.15
                            )
                        ),
                    )

                    revenue = round(units * price, 2)

                    sales_records.append({
                        "product_id": product_id,
                        "store_id": store_id,
                        "week_number": week,
                        "year": year,
                        "units_sold": units,
                        "revenue": revenue,
                        "facings": 2,  # Default facings
                        "on_promotion": False,
                    })

        logger.info("Generated sales records", count=len(sales_records))
        return sales_records

    def generate_switching_matrix(self) -> list[dict[str, Any]]:
        """Generate consumer switching behavior matrix.

        Based on research:
        - 27% switch variety (same brand, different flavor)
        - 23% switch size
        - 20% switch brand (different brand, same subcategory)
        - 21% switch subcategory
        - 9% walk away

        Returns:
            List of switching matrix entries ready for database insertion.
        """
        self._set_seed()

        switching_data = [
            {
                "from_brand": "PREFERRED",
                "to_brand": "SAME_BRAND_DIFF_FLAVOR",
                "switching_probability": 0.27,
                "subcategory": None,
            },
            {
                "from_brand": "PREFERRED",
                "to_brand": "SAME_BRAND_DIFF_SIZE",
                "switching_probability": 0.23,
                "subcategory": None,
            },
            {
                "from_brand": "PREFERRED",
                "to_brand": "DIFF_BRAND_SAME_SUBCAT",
                "switching_probability": 0.20,
                "subcategory": None,
            },
            {
                "from_brand": "PREFERRED",
                "to_brand": "DIFF_SUBCATEGORY",
                "switching_probability": 0.21,
                "subcategory": None,
            },
            {
                "from_brand": "PREFERRED",
                "to_brand": "WALK_AWAY",
                "switching_probability": 0.09,
                "subcategory": None,
            },
        ]

        logger.info("Generated switching matrix", count=len(switching_data))
        return switching_data

    def generate_attribute_importance(self) -> list[dict[str, Any]]:
        """Generate attribute importance for Consumer Decision Tree.

        Returns:
            List of attribute importance data.
        """
        return [
            {
                "attribute": "Subcategory",
                "importance": 0.36,
                "description": "Shoppers first decide beverage type",
            },
            {
                "attribute": "Brand",
                "importance": 0.28,
                "description": "Brand preference within subcategory",
            },
            {
                "attribute": "Size",
                "importance": 0.21,
                "description": "Size/pack based on occasion",
            },
            {
                "attribute": "Price",
                "importance": 0.15,
                "description": "Price as final decision factor",
            },
        ]

    async def seed_all_data(
        self,
        num_products: int = 80,
        num_stores: int = 25,
        weeks: int = 52,
        year: int = 2024,
    ) -> dict[str, Any]:
        """Generate and save all synthetic data to the database.

        Args:
            num_products: Number of products to generate.
            num_stores: Number of stores to generate.
            weeks: Number of weeks of sales data.
            year: Year for sales data.

        Returns:
            Summary of generated data.
        """
        logger.info(
            "Starting data seed",
            num_products=num_products,
            num_stores=num_stores,
            weeks=weeks,
        )

        # Generate products
        products_data = self.generate_products(num_products)
        created_products = await self.product_repo.create_many(products_data)
        product_id_map = {p.sku: p.id for p in created_products}

        # Generate stores
        stores_data = self.generate_stores(num_stores)
        created_stores = await self.store_repo.create_many(stores_data)
        store_id_map = {s.store_code: s.id for s in created_stores}

        # Generate sales data
        sales_data = self.generate_sales(
            products_data,
            stores_data,
            product_id_map,
            store_id_map,
            weeks=weeks,
            year=year,
        )

        # Insert sales in batches
        batch_size = 5000
        total_sales = 0
        for i in range(0, len(sales_data), batch_size):
            batch = sales_data[i : i + batch_size]
            await self.sale_repo.create_many(batch)
            total_sales += len(batch)
            logger.debug("Inserted sales batch", batch_num=i // batch_size + 1)

        # Generate switching matrix
        switching_data = self.generate_switching_matrix()
        await self.switching_repo.create_many(switching_data)

        # Commit all changes
        await self.session.commit()

        summary = {
            "products_created": len(created_products),
            "stores_created": len(created_stores),
            "sales_records_created": total_sales,
            "switching_entries_created": len(switching_data),
            "weeks": weeks,
            "year": year,
        }

        logger.info("Data seed completed", **summary)
        return summary

    async def clear_all_data(self) -> dict[str, int]:
        """Clear all data from the database.

        Returns:
            Count of deleted records per table.
        """
        from sqlalchemy import delete

        from app.db.models import (
            AssortmentProduct,
            AssortmentSale,
            AssortmentStore,
            SwitchingMatrix,
        )

        # Delete in order of dependencies
        sales_result = await self.session.execute(delete(AssortmentSale))
        switching_result = await self.session.execute(delete(SwitchingMatrix))
        products_result = await self.session.execute(delete(AssortmentProduct))
        stores_result = await self.session.execute(delete(AssortmentStore))

        await self.session.commit()

        deleted = {
            "sales": sales_result.rowcount,
            "switching_matrix": switching_result.rowcount,
            "products": products_result.rowcount,
            "stores": stores_result.rowcount,
        }

        logger.info("Cleared all data", **deleted)
        return deleted
