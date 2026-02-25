"""Data transformation utilities for import/export operations.

This module provides transformation logic for converting between
external data formats and internal database models.
"""

import csv
import io
import json
from datetime import datetime
from typing import Any
from uuid import UUID

from app.core.logging import get_logger
from app.db.models import BrandTier, IncomeIndex, LocationType, StoreFormat

logger = get_logger(__name__)


class DataTransformers:
    """Transform data between external formats and internal models.

    Handles:
    - CSV/JSON export formatting
    - Enum value normalization
    - ID to code resolution
    - Date/time formatting
    """

    # Enum normalization maps (lowercase input -> canonical value)
    BRAND_TIER_MAP = {
        "premium": BrandTier.PREMIUM,
        "national a": BrandTier.NATIONAL_A,
        "national_a": BrandTier.NATIONAL_A,
        "nationala": BrandTier.NATIONAL_A,
        "national b": BrandTier.NATIONAL_B,
        "national_b": BrandTier.NATIONAL_B,
        "nationalb": BrandTier.NATIONAL_B,
        "store brand": BrandTier.STORE_BRAND,
        "store_brand": BrandTier.STORE_BRAND,
        "storebrand": BrandTier.STORE_BRAND,
        "private label": BrandTier.STORE_BRAND,
        "private_label": BrandTier.STORE_BRAND,
    }

    STORE_FORMAT_MAP = {
        "express": StoreFormat.EXPRESS,
        "standard": StoreFormat.STANDARD,
        "superstore": StoreFormat.SUPERSTORE,
        "super store": StoreFormat.SUPERSTORE,
        "super_store": StoreFormat.SUPERSTORE,
    }

    LOCATION_TYPE_MAP = {
        "urban": LocationType.URBAN,
        "suburban": LocationType.SUBURBAN,
        "rural": LocationType.RURAL,
    }

    INCOME_INDEX_MAP = {
        "low": IncomeIndex.LOW,
        "medium": IncomeIndex.MEDIUM,
        "med": IncomeIndex.MEDIUM,
        "high": IncomeIndex.HIGH,
    }

    # =========================================================================
    # Enum Normalization
    # =========================================================================

    @classmethod
    def normalize_brand_tier(cls, value: str) -> BrandTier:
        """Normalize a brand tier string to BrandTier enum.

        Args:
            value: Brand tier string (case-insensitive).

        Returns:
            BrandTier enum value.

        Raises:
            ValueError: If value cannot be normalized.
        """
        normalized = value.lower().strip()
        if normalized in cls.BRAND_TIER_MAP:
            return cls.BRAND_TIER_MAP[normalized]
        # Try direct enum conversion
        try:
            return BrandTier(normalized)
        except ValueError:
            valid_values = list(cls.BRAND_TIER_MAP.keys()) + [t.value for t in BrandTier]
            raise ValueError(
                f"Invalid brand tier '{value}'. Valid values: {', '.join(set(valid_values))}"
            )

    @classmethod
    def normalize_store_format(cls, value: str) -> StoreFormat:
        """Normalize a store format string to StoreFormat enum.

        Args:
            value: Store format string (case-insensitive).

        Returns:
            StoreFormat enum value.

        Raises:
            ValueError: If value cannot be normalized.
        """
        normalized = value.lower().strip()
        if normalized in cls.STORE_FORMAT_MAP:
            return cls.STORE_FORMAT_MAP[normalized]
        try:
            return StoreFormat(normalized)
        except ValueError:
            valid_values = list(cls.STORE_FORMAT_MAP.keys()) + [
                f.value for f in StoreFormat
            ]
            raise ValueError(
                f"Invalid store format '{value}'. Valid values: {', '.join(set(valid_values))}"
            )

    @classmethod
    def normalize_location_type(cls, value: str) -> LocationType:
        """Normalize a location type string to LocationType enum.

        Args:
            value: Location type string (case-insensitive).

        Returns:
            LocationType enum value.

        Raises:
            ValueError: If value cannot be normalized.
        """
        normalized = value.lower().strip()
        if normalized in cls.LOCATION_TYPE_MAP:
            return cls.LOCATION_TYPE_MAP[normalized]
        try:
            return LocationType(normalized)
        except ValueError:
            valid_values = list(cls.LOCATION_TYPE_MAP.keys()) + [
                l.value for l in LocationType
            ]
            raise ValueError(
                f"Invalid location type '{value}'. Valid values: {', '.join(set(valid_values))}"
            )

    @classmethod
    def normalize_income_index(cls, value: str) -> IncomeIndex:
        """Normalize an income index string to IncomeIndex enum.

        Args:
            value: Income index string (case-insensitive).

        Returns:
            IncomeIndex enum value.

        Raises:
            ValueError: If value cannot be normalized.
        """
        normalized = value.lower().strip()
        if normalized in cls.INCOME_INDEX_MAP:
            return cls.INCOME_INDEX_MAP[normalized]
        try:
            return IncomeIndex(normalized)
        except ValueError:
            valid_values = list(cls.INCOME_INDEX_MAP.keys()) + [
                i.value for i in IncomeIndex
            ]
            raise ValueError(
                f"Invalid income index '{value}'. Valid values: {', '.join(set(valid_values))}"
            )

    # =========================================================================
    # Import Transformations
    # =========================================================================

    @classmethod
    def transform_product_for_import(cls, data: dict[str, Any]) -> dict[str, Any]:
        """Transform product data from import format to database format.

        Args:
            data: Product data dictionary from import.

        Returns:
            Transformed dictionary ready for database insertion.
        """
        result = data.copy()

        # Normalize brand tier
        if "brand_tier" in result and result["brand_tier"]:
            if isinstance(result["brand_tier"], str):
                result["brand_tier"] = cls.normalize_brand_tier(result["brand_tier"])

        # Ensure numeric types
        if "price" in result:
            result["price"] = float(result["price"])
        if "cost" in result:
            result["cost"] = float(result["cost"])
        if "width_inches" in result:
            result["width_inches"] = float(result["width_inches"])
        if "space_elasticity" in result and result["space_elasticity"] is not None:
            result["space_elasticity"] = float(result["space_elasticity"])

        # Ensure boolean
        if "is_active" in result:
            result["is_active"] = cls._to_bool(result["is_active"])

        return result

    @classmethod
    def transform_store_for_import(cls, data: dict[str, Any]) -> dict[str, Any]:
        """Transform store data from import format to database format.

        Args:
            data: Store data dictionary from import.

        Returns:
            Transformed dictionary ready for database insertion.
        """
        result = data.copy()

        # Normalize enums
        if "format" in result and result["format"]:
            if isinstance(result["format"], str):
                result["format"] = cls.normalize_store_format(result["format"])

        if "location_type" in result and result["location_type"]:
            if isinstance(result["location_type"], str):
                result["location_type"] = cls.normalize_location_type(
                    result["location_type"]
                )

        if "income_index" in result and result["income_index"]:
            if isinstance(result["income_index"], str):
                result["income_index"] = cls.normalize_income_index(
                    result["income_index"]
                )

        # Ensure numeric types
        if "total_facings" in result:
            result["total_facings"] = int(result["total_facings"])
        if "num_shelves" in result and result["num_shelves"] is not None:
            result["num_shelves"] = int(result["num_shelves"])
        if "shelf_width_inches" in result and result["shelf_width_inches"] is not None:
            result["shelf_width_inches"] = float(result["shelf_width_inches"])
        if "weekly_traffic" in result:
            result["weekly_traffic"] = int(result["weekly_traffic"])

        # Ensure boolean
        if "is_active" in result:
            result["is_active"] = cls._to_bool(result["is_active"])

        return result

    @classmethod
    def transform_sale_for_import(
        cls,
        data: dict[str, Any],
        sku_to_id: dict[str, UUID],
        store_code_to_id: dict[str, UUID],
    ) -> dict[str, Any]:
        """Transform sale data from import format to database format.

        Args:
            data: Sale data dictionary from import.
            sku_to_id: Mapping of SKU to product ID.
            store_code_to_id: Mapping of store code to store ID.

        Returns:
            Transformed dictionary ready for database insertion.

        Raises:
            ValueError: If SKU or store code cannot be resolved.
        """
        result = data.copy()

        # Resolve SKU to product_id
        sku = result.pop("sku", None)
        if sku:
            if sku not in sku_to_id:
                raise ValueError(f"Unknown SKU: {sku}")
            result["product_id"] = sku_to_id[sku]

        # Resolve store_code to store_id
        store_code = result.pop("store_code", None)
        if store_code:
            if store_code not in store_code_to_id:
                raise ValueError(f"Unknown store code: {store_code}")
            result["store_id"] = store_code_to_id[store_code]

        # Ensure numeric types
        if "week_number" in result:
            result["week_number"] = int(result["week_number"])
        if "year" in result:
            result["year"] = int(result["year"])
        if "units_sold" in result:
            result["units_sold"] = int(result["units_sold"])
        if "revenue" in result:
            result["revenue"] = float(result["revenue"])
        if "facings" in result and result["facings"] is not None:
            result["facings"] = int(result["facings"])

        # Ensure boolean
        if "on_promotion" in result:
            result["on_promotion"] = cls._to_bool(result["on_promotion"])

        return result

    # =========================================================================
    # Export Transformations
    # =========================================================================

    @classmethod
    def transform_product_for_export(cls, product: Any) -> dict[str, Any]:
        """Transform a product model to export format.

        Args:
            product: Product model instance or dictionary.

        Returns:
            Dictionary suitable for CSV/JSON export.
        """
        if hasattr(product, "__dict__"):
            data = {
                "sku": product.sku,
                "name": product.name,
                "brand": product.brand,
                "brand_tier": (
                    product.brand_tier.value
                    if hasattr(product.brand_tier, "value")
                    else product.brand_tier
                ),
                "subcategory": product.subcategory,
                "size": product.size,
                "pack_type": product.pack_type,
                "price": float(product.price),
                "cost": float(product.cost),
                "width_inches": float(product.width_inches),
                "space_elasticity": (
                    float(product.space_elasticity) if product.space_elasticity else None
                ),
                "flavor": product.flavor,
                "price_tier": product.price_tier,
                "is_active": product.is_active,
            }
        else:
            data = dict(product)
            # Convert enum values
            if "brand_tier" in data and hasattr(data["brand_tier"], "value"):
                data["brand_tier"] = data["brand_tier"].value

        return data

    @classmethod
    def transform_store_for_export(cls, store: Any) -> dict[str, Any]:
        """Transform a store model to export format.

        Args:
            store: Store model instance or dictionary.

        Returns:
            Dictionary suitable for CSV/JSON export.
        """
        if hasattr(store, "__dict__"):
            data = {
                "store_code": store.store_code,
                "name": store.name,
                "format": (
                    store.format.value
                    if hasattr(store.format, "value")
                    else store.format
                ),
                "location_type": (
                    store.location_type.value
                    if hasattr(store.location_type, "value")
                    else store.location_type
                ),
                "income_index": (
                    store.income_index.value
                    if hasattr(store.income_index, "value")
                    else store.income_index
                ),
                "total_facings": store.total_facings,
                "num_shelves": store.num_shelves,
                "shelf_width_inches": (
                    float(store.shelf_width_inches) if store.shelf_width_inches else None
                ),
                "weekly_traffic": store.weekly_traffic,
                "region": store.region,
                "is_active": store.is_active,
            }
        else:
            data = dict(store)
            # Convert enum values
            for field in ["format", "location_type", "income_index"]:
                if field in data and hasattr(data[field], "value"):
                    data[field] = data[field].value

        return data

    @classmethod
    def transform_sale_for_export(
        cls,
        sale: Any,
        id_to_sku: dict[UUID, str] | None = None,
        id_to_store_code: dict[UUID, str] | None = None,
    ) -> dict[str, Any]:
        """Transform a sale model to export format.

        Args:
            sale: Sale model instance or dictionary.
            id_to_sku: Optional mapping of product ID to SKU.
            id_to_store_code: Optional mapping of store ID to store code.

        Returns:
            Dictionary suitable for CSV/JSON export.
        """
        if hasattr(sale, "__dict__"):
            data = {
                "product_id": str(sale.product_id),
                "store_id": str(sale.store_id),
                "week_number": sale.week_number,
                "year": sale.year,
                "units_sold": sale.units_sold,
                "revenue": float(sale.revenue),
                "facings": sale.facings,
                "on_promotion": sale.on_promotion,
            }
        else:
            data = dict(sale)

        # Resolve IDs to codes if mappings provided
        if id_to_sku:
            product_id = data.get("product_id")
            if product_id:
                if isinstance(product_id, str):
                    product_id = UUID(product_id)
                if product_id in id_to_sku:
                    data["sku"] = id_to_sku[product_id]
                    del data["product_id"]

        if id_to_store_code:
            store_id = data.get("store_id")
            if store_id:
                if isinstance(store_id, str):
                    store_id = UUID(store_id)
                if store_id in id_to_store_code:
                    data["store_code"] = id_to_store_code[store_id]
                    del data["store_id"]

        return data

    # =========================================================================
    # Format Conversions
    # =========================================================================

    @classmethod
    def to_csv(cls, data: list[dict[str, Any]], fields: list[str] | None = None) -> str:
        """Convert a list of dictionaries to CSV string.

        Args:
            data: List of dictionaries.
            fields: Optional list of field names (column order). If not provided,
                   uses keys from first row.

        Returns:
            CSV formatted string.
        """
        if not data:
            return ""

        if fields is None:
            fields = list(data[0].keys())

        output = io.StringIO()
        writer = csv.DictWriter(
            output, fieldnames=fields, extrasaction="ignore", lineterminator="\n"
        )
        writer.writeheader()
        writer.writerows(data)

        return output.getvalue()

    @classmethod
    def to_json(
        cls, data: list[dict[str, Any]], pretty: bool = True, key: str | None = None
    ) -> str:
        """Convert a list of dictionaries to JSON string.

        Args:
            data: List of dictionaries.
            pretty: Whether to format with indentation.
            key: Optional key to wrap data in (e.g., "products").

        Returns:
            JSON formatted string.
        """
        # Convert any non-serializable types
        serializable_data = []
        for item in data:
            serializable_item = {}
            for k, v in item.items():
                if isinstance(v, UUID):
                    serializable_item[k] = str(v)
                elif isinstance(v, datetime):
                    serializable_item[k] = v.isoformat()
                elif hasattr(v, "value"):  # Enum
                    serializable_item[k] = v.value
                else:
                    serializable_item[k] = v
            serializable_data.append(serializable_item)

        if key:
            output = {key: serializable_data}
        else:
            output = serializable_data

        if pretty:
            return json.dumps(output, indent=2)
        return json.dumps(output)

    # =========================================================================
    # Helper Methods
    # =========================================================================

    @staticmethod
    def _to_bool(value: Any) -> bool:
        """Convert a value to boolean.

        Args:
            value: Value to convert.

        Returns:
            Boolean value.
        """
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ("true", "1", "yes", "y", "t")
        return bool(value)

    @classmethod
    def build_id_mappings(
        cls, products: list[Any], stores: list[Any]
    ) -> tuple[dict[str, UUID], dict[str, UUID], dict[UUID, str], dict[UUID, str]]:
        """Build ID mapping dictionaries from product and store lists.

        Args:
            products: List of product models or dictionaries.
            stores: List of store models or dictionaries.

        Returns:
            Tuple of (sku_to_id, store_code_to_id, id_to_sku, id_to_store_code).
        """
        sku_to_id: dict[str, UUID] = {}
        id_to_sku: dict[UUID, str] = {}
        store_code_to_id: dict[str, UUID] = {}
        id_to_store_code: dict[UUID, str] = {}

        for product in products:
            if hasattr(product, "id") and hasattr(product, "sku"):
                product_id = product.id
                sku = product.sku
            else:
                product_id = product.get("id")
                sku = product.get("sku")

            if product_id and sku:
                if isinstance(product_id, str):
                    product_id = UUID(product_id)
                sku_to_id[sku] = product_id
                id_to_sku[product_id] = sku

        for store in stores:
            if hasattr(store, "id") and hasattr(store, "store_code"):
                store_id = store.id
                store_code = store.store_code
            else:
                store_id = store.get("id")
                store_code = store.get("store_code")

            if store_id and store_code:
                if isinstance(store_id, str):
                    store_id = UUID(store_id)
                store_code_to_id[store_code] = store_id
                id_to_store_code[store_id] = store_code

        return sku_to_id, store_code_to_id, id_to_sku, id_to_store_code


# Convenience functions for common operations
def normalize_enums(data: dict[str, Any], entity_type: str) -> dict[str, Any]:
    """Normalize enum values in a data dictionary.

    Args:
        data: Dictionary with enum string values.
        entity_type: Type of entity ('product', 'store', 'sale').

    Returns:
        Dictionary with normalized enum values.
    """
    if entity_type == "product":
        return DataTransformers.transform_product_for_import(data)
    elif entity_type == "store":
        return DataTransformers.transform_store_for_import(data)
    else:
        return data


def export_to_csv(
    data: list[dict[str, Any]],
    entity_type: str,
    id_to_sku: dict[UUID, str] | None = None,
    id_to_store_code: dict[UUID, str] | None = None,
) -> str:
    """Export data to CSV format.

    Args:
        data: List of model instances or dictionaries.
        entity_type: Type of entity ('product', 'store', 'sale').
        id_to_sku: Optional mapping for sale exports.
        id_to_store_code: Optional mapping for sale exports.

    Returns:
        CSV formatted string.
    """
    transformed = []
    for item in data:
        if entity_type == "product":
            transformed.append(DataTransformers.transform_product_for_export(item))
        elif entity_type == "store":
            transformed.append(DataTransformers.transform_store_for_export(item))
        elif entity_type == "sale":
            transformed.append(
                DataTransformers.transform_sale_for_export(
                    item, id_to_sku, id_to_store_code
                )
            )
        else:
            transformed.append(dict(item) if not isinstance(item, dict) else item)

    return DataTransformers.to_csv(transformed)


def export_to_json(
    data: list[dict[str, Any]],
    entity_type: str,
    id_to_sku: dict[UUID, str] | None = None,
    id_to_store_code: dict[UUID, str] | None = None,
    pretty: bool = True,
) -> str:
    """Export data to JSON format.

    Args:
        data: List of model instances or dictionaries.
        entity_type: Type of entity ('product', 'store', 'sale').
        id_to_sku: Optional mapping for sale exports.
        id_to_store_code: Optional mapping for sale exports.
        pretty: Whether to format with indentation.

    Returns:
        JSON formatted string.
    """
    transformed = []
    for item in data:
        if entity_type == "product":
            transformed.append(DataTransformers.transform_product_for_export(item))
        elif entity_type == "store":
            transformed.append(DataTransformers.transform_store_for_export(item))
        elif entity_type == "sale":
            transformed.append(
                DataTransformers.transform_sale_for_export(
                    item, id_to_sku, id_to_store_code
                )
            )
        else:
            transformed.append(dict(item) if not isinstance(item, dict) else item)

    key_map = {"product": "products", "store": "stores", "sale": "sales"}
    return DataTransformers.to_json(transformed, pretty=pretty, key=key_map.get(entity_type))
