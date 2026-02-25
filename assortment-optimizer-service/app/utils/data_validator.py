"""Data validation utilities for comprehensive data integrity checks.

This module provides validation logic for products, stores, and sales data
including business rule validation and referential integrity checks.
"""

from dataclasses import dataclass, field
from typing import Any

from app.core.logging import get_logger
from app.db.models import BrandTier, IncomeIndex, LocationType, StoreFormat

logger = get_logger(__name__)


@dataclass
class ValidationResult:
    """Result of a validation operation."""

    is_valid: bool
    errors: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[dict[str, Any]] = field(default_factory=list)
    stats: dict[str, Any] = field(default_factory=dict)

    def add_error(
        self,
        message: str,
        row: int | None = None,
        field: str | None = None,
        value: Any = None,
    ) -> None:
        """Add an error to the result."""
        error = {"message": message}
        if row is not None:
            error["row"] = row
        if field is not None:
            error["field"] = field
        if value is not None:
            error["value"] = value
        self.errors.append(error)
        self.is_valid = False

    def add_warning(
        self,
        message: str,
        row: int | None = None,
        field: str | None = None,
        value: Any = None,
    ) -> None:
        """Add a warning to the result."""
        warning = {"message": message}
        if row is not None:
            warning["row"] = row
        if field is not None:
            warning["field"] = field
        if value is not None:
            warning["value"] = value
        self.warnings.append(warning)

    def merge(self, other: "ValidationResult") -> None:
        """Merge another validation result into this one."""
        self.errors.extend(other.errors)
        self.warnings.extend(other.warnings)
        self.stats.update(other.stats)
        if not other.is_valid:
            self.is_valid = False


class DataValidator:
    """Validates data for products, stores, and sales.

    Provides comprehensive validation including:
    - Required field checks
    - Data type validation
    - Business rule validation
    - Referential integrity checks
    """

    # Valid enum values
    VALID_BRAND_TIERS = {tier.value for tier in BrandTier}
    VALID_STORE_FORMATS = {fmt.value for fmt in StoreFormat}
    VALID_LOCATION_TYPES = {loc.value for loc in LocationType}
    VALID_INCOME_INDICES = {idx.value for idx in IncomeIndex}

    # Brand tier aliases for flexible matching
    BRAND_TIER_ALIASES = {
        "premium": "premium",
        "national a": "national_a",
        "national_a": "national_a",
        "nationala": "national_a",
        "national b": "national_b",
        "national_b": "national_b",
        "nationalb": "national_b",
        "store brand": "store_brand",
        "store_brand": "store_brand",
        "storebrand": "store_brand",
        "private label": "store_brand",
        "private_label": "store_brand",
    }

    # Store format aliases
    STORE_FORMAT_ALIASES = {
        "express": "express",
        "standard": "standard",
        "superstore": "superstore",
        "super store": "superstore",
        "super_store": "superstore",
    }

    # Location type aliases
    LOCATION_TYPE_ALIASES = {
        "urban": "urban",
        "suburban": "suburban",
        "rural": "rural",
    }

    # Income index aliases
    INCOME_INDEX_ALIASES = {
        "low": "low",
        "medium": "medium",
        "med": "medium",
        "high": "high",
    }

    # Required fields for each entity type
    REQUIRED_PRODUCT_FIELDS = {
        "sku",
        "name",
        "brand",
        "brand_tier",
        "subcategory",
        "size",
        "pack_type",
        "price",
        "cost",
        "width_inches",
    }

    REQUIRED_STORE_FIELDS = {
        "store_code",
        "name",
        "format",
        "location_type",
        "income_index",
        "total_facings",
        "weekly_traffic",
    }

    REQUIRED_SALE_FIELDS = {
        "sku",
        "store_code",
        "week_number",
        "year",
        "units_sold",
        "revenue",
    }

    def validate_products(self, products: list[dict[str, Any]]) -> ValidationResult:
        """Validate product data.

        Checks:
        - Required fields present
        - Valid brand_tier enum value
        - Price > cost (positive margin)
        - No duplicate SKUs
        - Positive numeric values where required

        Args:
            products: List of product dictionaries.

        Returns:
            ValidationResult with errors and warnings.
        """
        result = ValidationResult(is_valid=True)
        seen_skus: set[str] = set()

        for idx, product in enumerate(products, start=1):
            # Check required fields
            missing = self.REQUIRED_PRODUCT_FIELDS - set(product.keys())
            for field_name in missing:
                result.add_error(
                    f"Missing required field: {field_name}",
                    row=idx,
                    field=field_name,
                )

            # Skip further validation if required fields missing
            if missing:
                continue

            sku = product.get("sku")

            # Check for duplicate SKUs
            if sku in seen_skus:
                result.add_error(
                    f"Duplicate SKU: {sku}",
                    row=idx,
                    field="sku",
                    value=sku,
                )
            else:
                seen_skus.add(sku)

            # Validate brand_tier
            brand_tier = str(product.get("brand_tier", "")).lower()
            normalized_tier = self.BRAND_TIER_ALIASES.get(brand_tier, brand_tier)
            if normalized_tier not in self.VALID_BRAND_TIERS:
                result.add_error(
                    f"Invalid brand_tier: {product.get('brand_tier')}. "
                    f"Valid values: {', '.join(self.VALID_BRAND_TIERS)}",
                    row=idx,
                    field="brand_tier",
                    value=product.get("brand_tier"),
                )

            # Validate price and cost
            try:
                price = float(product.get("price", 0))
                cost = float(product.get("cost", 0))

                if price <= 0:
                    result.add_error(
                        "Price must be positive",
                        row=idx,
                        field="price",
                        value=price,
                    )

                if cost < 0:
                    result.add_error(
                        "Cost cannot be negative",
                        row=idx,
                        field="cost",
                        value=cost,
                    )

                if price <= cost:
                    result.add_warning(
                        f"Price ({price}) is not greater than cost ({cost}). "
                        "This product has zero or negative margin.",
                        row=idx,
                        field="price",
                    )
            except (ValueError, TypeError) as e:
                result.add_error(
                    f"Invalid numeric value for price/cost: {e}",
                    row=idx,
                )

            # Validate width_inches
            try:
                width = float(product.get("width_inches", 0))
                if width <= 0:
                    result.add_error(
                        "Width must be positive",
                        row=idx,
                        field="width_inches",
                        value=width,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for width_inches",
                    row=idx,
                    field="width_inches",
                    value=product.get("width_inches"),
                )

            # Validate space_elasticity if provided
            if "space_elasticity" in product and product["space_elasticity"] is not None:
                try:
                    elasticity = float(product["space_elasticity"])
                    if not -1 <= elasticity <= 1:
                        result.add_warning(
                            "Space elasticity typically ranges from -1 to 1",
                            row=idx,
                            field="space_elasticity",
                            value=elasticity,
                        )
                except (ValueError, TypeError):
                    result.add_error(
                        "Invalid numeric value for space_elasticity",
                        row=idx,
                        field="space_elasticity",
                        value=product.get("space_elasticity"),
                    )

        result.stats = {
            "total_products": len(products),
            "unique_skus": len(seen_skus),
            "valid_products": len(products) - len(result.errors),
        }

        logger.info(
            "Product validation complete",
            total=len(products),
            errors=len(result.errors),
            warnings=len(result.warnings),
        )

        return result

    def validate_stores(self, stores: list[dict[str, Any]]) -> ValidationResult:
        """Validate store data.

        Checks:
        - Required fields present
        - Valid format enum value
        - Valid location_type enum value
        - Valid income_index enum value
        - No duplicate store codes
        - Positive numeric values where required

        Args:
            stores: List of store dictionaries.

        Returns:
            ValidationResult with errors and warnings.
        """
        result = ValidationResult(is_valid=True)
        seen_codes: set[str] = set()

        for idx, store in enumerate(stores, start=1):
            # Check required fields
            missing = self.REQUIRED_STORE_FIELDS - set(store.keys())
            for field_name in missing:
                result.add_error(
                    f"Missing required field: {field_name}",
                    row=idx,
                    field=field_name,
                )

            # Skip further validation if required fields missing
            if missing:
                continue

            store_code = store.get("store_code")

            # Check for duplicate store codes
            if store_code in seen_codes:
                result.add_error(
                    f"Duplicate store_code: {store_code}",
                    row=idx,
                    field="store_code",
                    value=store_code,
                )
            else:
                seen_codes.add(store_code)

            # Validate format
            store_format = str(store.get("format", "")).lower()
            normalized_format = self.STORE_FORMAT_ALIASES.get(store_format, store_format)
            if normalized_format not in self.VALID_STORE_FORMATS:
                result.add_error(
                    f"Invalid format: {store.get('format')}. "
                    f"Valid values: {', '.join(self.VALID_STORE_FORMATS)}",
                    row=idx,
                    field="format",
                    value=store.get("format"),
                )

            # Validate location_type
            location_type = str(store.get("location_type", "")).lower()
            normalized_location = self.LOCATION_TYPE_ALIASES.get(
                location_type, location_type
            )
            if normalized_location not in self.VALID_LOCATION_TYPES:
                result.add_error(
                    f"Invalid location_type: {store.get('location_type')}. "
                    f"Valid values: {', '.join(self.VALID_LOCATION_TYPES)}",
                    row=idx,
                    field="location_type",
                    value=store.get("location_type"),
                )

            # Validate income_index
            income_index = str(store.get("income_index", "")).lower()
            normalized_income = self.INCOME_INDEX_ALIASES.get(income_index, income_index)
            if normalized_income not in self.VALID_INCOME_INDICES:
                result.add_error(
                    f"Invalid income_index: {store.get('income_index')}. "
                    f"Valid values: {', '.join(self.VALID_INCOME_INDICES)}",
                    row=idx,
                    field="income_index",
                    value=store.get("income_index"),
                )

            # Validate total_facings
            try:
                facings = int(store.get("total_facings", 0))
                if facings <= 0:
                    result.add_error(
                        "Total facings must be positive",
                        row=idx,
                        field="total_facings",
                        value=facings,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for total_facings",
                    row=idx,
                    field="total_facings",
                    value=store.get("total_facings"),
                )

            # Validate weekly_traffic
            try:
                traffic = int(store.get("weekly_traffic", 0))
                if traffic < 0:
                    result.add_error(
                        "Weekly traffic cannot be negative",
                        row=idx,
                        field="weekly_traffic",
                        value=traffic,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for weekly_traffic",
                    row=idx,
                    field="weekly_traffic",
                    value=store.get("weekly_traffic"),
                )

            # Validate optional num_shelves
            if "num_shelves" in store and store["num_shelves"] is not None:
                try:
                    shelves = int(store["num_shelves"])
                    if shelves <= 0:
                        result.add_error(
                            "Number of shelves must be positive",
                            row=idx,
                            field="num_shelves",
                            value=shelves,
                        )
                except (ValueError, TypeError):
                    result.add_error(
                        "Invalid numeric value for num_shelves",
                        row=idx,
                        field="num_shelves",
                        value=store.get("num_shelves"),
                    )

            # Validate optional shelf_width_inches
            if "shelf_width_inches" in store and store["shelf_width_inches"] is not None:
                try:
                    width = float(store["shelf_width_inches"])
                    if width <= 0:
                        result.add_error(
                            "Shelf width must be positive",
                            row=idx,
                            field="shelf_width_inches",
                            value=width,
                        )
                except (ValueError, TypeError):
                    result.add_error(
                        "Invalid numeric value for shelf_width_inches",
                        row=idx,
                        field="shelf_width_inches",
                        value=store.get("shelf_width_inches"),
                    )

        result.stats = {
            "total_stores": len(stores),
            "unique_codes": len(seen_codes),
            "valid_stores": len(stores) - len(result.errors),
        }

        logger.info(
            "Store validation complete",
            total=len(stores),
            errors=len(result.errors),
            warnings=len(result.warnings),
        )

        return result

    def validate_sales(
        self,
        sales: list[dict[str, Any]],
        valid_skus: set[str] | None = None,
        valid_store_codes: set[str] | None = None,
    ) -> ValidationResult:
        """Validate sales data.

        Checks:
        - Required fields present
        - Week number 1-52
        - Year is reasonable (2000-2100)
        - Units sold >= 0
        - Revenue >= 0
        - SKU exists in products (if valid_skus provided)
        - Store code exists in stores (if valid_store_codes provided)

        Args:
            sales: List of sale dictionaries.
            valid_skus: Optional set of valid product SKUs for referential integrity.
            valid_store_codes: Optional set of valid store codes for referential integrity.

        Returns:
            ValidationResult with errors and warnings.
        """
        result = ValidationResult(is_valid=True)
        orphan_skus: set[str] = set()
        orphan_stores: set[str] = set()

        for idx, sale in enumerate(sales, start=1):
            # Check required fields
            missing = self.REQUIRED_SALE_FIELDS - set(sale.keys())
            for field_name in missing:
                result.add_error(
                    f"Missing required field: {field_name}",
                    row=idx,
                    field=field_name,
                )

            # Skip further validation if required fields missing
            if missing:
                continue

            sku = sale.get("sku")
            store_code = sale.get("store_code")

            # Check referential integrity - SKU
            if valid_skus is not None and sku not in valid_skus:
                orphan_skus.add(sku)
                result.add_error(
                    f"SKU '{sku}' does not exist in products",
                    row=idx,
                    field="sku",
                    value=sku,
                )

            # Check referential integrity - store_code
            if valid_store_codes is not None and store_code not in valid_store_codes:
                orphan_stores.add(store_code)
                result.add_error(
                    f"Store code '{store_code}' does not exist in stores",
                    row=idx,
                    field="store_code",
                    value=store_code,
                )

            # Validate week_number
            try:
                week = int(sale.get("week_number", 0))
                if not 1 <= week <= 52:
                    result.add_error(
                        f"Week number must be between 1 and 52, got {week}",
                        row=idx,
                        field="week_number",
                        value=week,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for week_number",
                    row=idx,
                    field="week_number",
                    value=sale.get("week_number"),
                )

            # Validate year
            try:
                year = int(sale.get("year", 0))
                if not 2000 <= year <= 2100:
                    result.add_warning(
                        f"Year {year} seems unusual",
                        row=idx,
                        field="year",
                        value=year,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for year",
                    row=idx,
                    field="year",
                    value=sale.get("year"),
                )

            # Validate units_sold
            try:
                units = int(sale.get("units_sold", 0))
                if units < 0:
                    result.add_error(
                        "Units sold cannot be negative",
                        row=idx,
                        field="units_sold",
                        value=units,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for units_sold",
                    row=idx,
                    field="units_sold",
                    value=sale.get("units_sold"),
                )

            # Validate revenue
            try:
                revenue = float(sale.get("revenue", 0))
                if revenue < 0:
                    result.add_error(
                        "Revenue cannot be negative",
                        row=idx,
                        field="revenue",
                        value=revenue,
                    )
            except (ValueError, TypeError):
                result.add_error(
                    "Invalid numeric value for revenue",
                    row=idx,
                    field="revenue",
                    value=sale.get("revenue"),
                )

            # Validate facings if provided
            if "facings" in sale and sale["facings"] is not None:
                try:
                    facings = int(sale["facings"])
                    if facings <= 0:
                        result.add_error(
                            "Facings must be positive",
                            row=idx,
                            field="facings",
                            value=facings,
                        )
                except (ValueError, TypeError):
                    result.add_error(
                        "Invalid numeric value for facings",
                        row=idx,
                        field="facings",
                        value=sale.get("facings"),
                    )

        result.stats = {
            "total_sales": len(sales),
            "valid_sales": len(sales) - len(result.errors),
            "orphan_skus": len(orphan_skus),
            "orphan_store_codes": len(orphan_stores),
        }

        logger.info(
            "Sales validation complete",
            total=len(sales),
            errors=len(result.errors),
            warnings=len(result.warnings),
        )

        return result

    def validate_referential_integrity(
        self,
        products: list[dict[str, Any]],
        stores: list[dict[str, Any]],
        sales: list[dict[str, Any]],
    ) -> ValidationResult:
        """Validate referential integrity across all entities.

        Checks:
        - All sales reference valid products
        - All sales reference valid stores
        - Products without sales (warning)
        - Stores without sales (warning)

        Args:
            products: List of product dictionaries.
            stores: List of store dictionaries.
            sales: List of sale dictionaries.

        Returns:
            ValidationResult with integrity errors and warnings.
        """
        result = ValidationResult(is_valid=True)

        # Extract valid identifiers
        valid_skus = {p.get("sku") for p in products if p.get("sku")}
        valid_store_codes = {s.get("store_code") for s in stores if s.get("store_code")}

        # Track which products and stores have sales
        skus_with_sales: set[str] = set()
        stores_with_sales: set[str] = set()
        orphan_skus: set[str] = set()
        orphan_stores: set[str] = set()

        for idx, sale in enumerate(sales, start=1):
            sku = sale.get("sku")
            store_code = sale.get("store_code")

            if sku:
                if sku in valid_skus:
                    skus_with_sales.add(sku)
                else:
                    orphan_skus.add(sku)
                    result.add_error(
                        f"Sale references non-existent SKU: {sku}",
                        row=idx,
                        field="sku",
                        value=sku,
                    )

            if store_code:
                if store_code in valid_store_codes:
                    stores_with_sales.add(store_code)
                else:
                    orphan_stores.add(store_code)
                    result.add_error(
                        f"Sale references non-existent store: {store_code}",
                        row=idx,
                        field="store_code",
                        value=store_code,
                    )

        # Check for products without sales
        products_without_sales = valid_skus - skus_with_sales
        if products_without_sales:
            for sku in products_without_sales:
                result.add_warning(
                    f"Product '{sku}' has no sales records",
                    field="sku",
                    value=sku,
                )

        # Check for stores without sales
        stores_without_sales = valid_store_codes - stores_with_sales
        if stores_without_sales:
            for store_code in stores_without_sales:
                result.add_warning(
                    f"Store '{store_code}' has no sales records",
                    field="store_code",
                    value=store_code,
                )

        result.stats = {
            "total_products": len(products),
            "total_stores": len(stores),
            "total_sales": len(sales),
            "products_with_sales": len(skus_with_sales),
            "stores_with_sales": len(stores_with_sales),
            "products_without_sales": len(products_without_sales),
            "stores_without_sales": len(stores_without_sales),
            "orphan_skus_in_sales": len(orphan_skus),
            "orphan_stores_in_sales": len(orphan_stores),
        }

        logger.info(
            "Referential integrity check complete",
            products=len(products),
            stores=len(stores),
            sales=len(sales),
            errors=len(result.errors),
            warnings=len(result.warnings),
        )

        return result

    def validate_all(
        self,
        products: list[dict[str, Any]] | None = None,
        stores: list[dict[str, Any]] | None = None,
        sales: list[dict[str, Any]] | None = None,
    ) -> ValidationResult:
        """Run all validations on provided data.

        Args:
            products: Optional list of product dictionaries.
            stores: Optional list of store dictionaries.
            sales: Optional list of sale dictionaries.

        Returns:
            Combined ValidationResult from all validations.
        """
        result = ValidationResult(is_valid=True)

        # Validate each entity type
        if products:
            product_result = self.validate_products(products)
            result.merge(product_result)
            result.stats["products"] = product_result.stats

        if stores:
            store_result = self.validate_stores(stores)
            result.merge(store_result)
            result.stats["stores"] = store_result.stats

        if sales:
            # Extract valid identifiers for referential integrity
            valid_skus = (
                {p.get("sku") for p in products if p.get("sku")} if products else None
            )
            valid_store_codes = (
                {s.get("store_code") for s in stores if s.get("store_code")}
                if stores
                else None
            )
            sale_result = self.validate_sales(sales, valid_skus, valid_store_codes)
            result.merge(sale_result)
            result.stats["sales"] = sale_result.stats

        # Run referential integrity if all three provided
        if products and stores and sales:
            integrity_result = self.validate_referential_integrity(
                products, stores, sales
            )
            result.merge(integrity_result)
            result.stats["integrity"] = integrity_result.stats

        return result
