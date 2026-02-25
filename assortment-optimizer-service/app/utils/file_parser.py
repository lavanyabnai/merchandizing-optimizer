"""File parsing utilities for CSV and JSON imports."""

import csv
import io
import json
from typing import Any

from pydantic import BaseModel, ValidationError

from app.core.logging import get_logger
from app.db.models import BrandTier, IncomeIndex, LocationType, StoreFormat

logger = get_logger(__name__)


class FileParseError(Exception):
    """Exception raised when file parsing fails."""

    def __init__(self, message: str, errors: list[dict] | None = None):
        self.message = message
        self.errors = errors or []
        super().__init__(message)


# =============================================================================
# Schema Validation Models
# =============================================================================


class ProductImportSchema(BaseModel):
    """Schema for validating product imports."""

    sku: str
    name: str
    brand: str
    brand_tier: str
    subcategory: str
    size: str
    pack_type: str
    price: float
    cost: float
    width_inches: float
    space_elasticity: float = 0.15
    flavor: str | None = None
    price_tier: str | None = None
    is_active: bool = True


class StoreImportSchema(BaseModel):
    """Schema for validating store imports."""

    store_code: str
    name: str
    format: str
    location_type: str
    income_index: str
    total_facings: int
    num_shelves: int = 4
    shelf_width_inches: float = 48.0
    weekly_traffic: int
    region: str | None = None
    is_active: bool = True


class SaleImportSchema(BaseModel):
    """Schema for validating sale imports."""

    sku: str  # Will be converted to product_id
    store_code: str  # Will be converted to store_id
    week_number: int
    year: int
    units_sold: int
    revenue: float
    facings: int = 1
    on_promotion: bool = False


# =============================================================================
# CSV Parsing
# =============================================================================


def parse_csv(content: bytes | str, encoding: str = "utf-8") -> list[dict[str, Any]]:
    """Parse CSV content into a list of dictionaries.

    Args:
        content: CSV content as bytes or string.
        encoding: Character encoding for bytes content.

    Returns:
        List of dictionaries, one per row.

    Raises:
        FileParseError: If CSV parsing fails.
    """
    try:
        if isinstance(content, bytes):
            content = content.decode(encoding)

        # Handle different line endings
        content = content.replace("\r\n", "\n").replace("\r", "\n")

        reader = csv.DictReader(io.StringIO(content))
        rows = []

        for row_num, row in enumerate(reader, start=2):  # Start at 2 (1 is header)
            # Convert empty strings to None
            cleaned_row = {
                k.strip(): v.strip() if v and v.strip() else None
                for k, v in row.items()
                if k  # Skip empty column names
            }

            # Convert numeric fields
            cleaned_row = _convert_numeric_fields(cleaned_row)
            rows.append(cleaned_row)

        logger.info("Parsed CSV file", rows=len(rows))
        return rows

    except csv.Error as e:
        raise FileParseError(f"Invalid CSV format: {str(e)}")
    except UnicodeDecodeError as e:
        raise FileParseError(f"Invalid file encoding: {str(e)}")
    except Exception as e:
        raise FileParseError(f"Failed to parse CSV: {str(e)}")


def _convert_numeric_fields(row: dict[str, Any]) -> dict[str, Any]:
    """Convert string numeric fields to appropriate types."""
    numeric_fields = {
        "price",
        "cost",
        "width_inches",
        "space_elasticity",
        "shelf_width_inches",
        "total_facings",
        "num_shelves",
        "weekly_traffic",
        "week_number",
        "year",
        "units_sold",
        "revenue",
        "facings",
    }
    bool_fields = {"is_active", "on_promotion"}

    result = {}
    for key, value in row.items():
        if value is None:
            result[key] = None
        elif key in numeric_fields:
            try:
                # Try int first, then float
                if "." in str(value):
                    result[key] = float(value)
                else:
                    result[key] = int(value)
            except (ValueError, TypeError):
                result[key] = value
        elif key in bool_fields:
            if isinstance(value, str):
                result[key] = value.lower() in ("true", "1", "yes", "y")
            else:
                result[key] = bool(value)
        else:
            result[key] = value

    return result


# =============================================================================
# JSON Parsing
# =============================================================================


def parse_json(content: bytes | str, encoding: str = "utf-8") -> list[dict[str, Any]]:
    """Parse JSON content into a list of dictionaries.

    Args:
        content: JSON content as bytes or string.
        encoding: Character encoding for bytes content.

    Returns:
        List of dictionaries.

    Raises:
        FileParseError: If JSON parsing fails.
    """
    try:
        if isinstance(content, bytes):
            content = content.decode(encoding)

        data = json.loads(content)

        # Handle both array and object with "data" key
        if isinstance(data, list):
            rows = data
        elif isinstance(data, dict):
            if "data" in data:
                rows = data["data"]
            elif "items" in data:
                rows = data["items"]
            elif "products" in data:
                rows = data["products"]
            elif "stores" in data:
                rows = data["stores"]
            elif "sales" in data:
                rows = data["sales"]
            else:
                raise FileParseError(
                    "JSON object must contain 'data', 'items', or entity-specific key"
                )
        else:
            raise FileParseError("JSON must be an array or object")

        if not isinstance(rows, list):
            raise FileParseError("JSON data must be an array")

        logger.info("Parsed JSON file", rows=len(rows))
        return rows

    except json.JSONDecodeError as e:
        raise FileParseError(f"Invalid JSON format: {str(e)}")
    except UnicodeDecodeError as e:
        raise FileParseError(f"Invalid file encoding: {str(e)}")


# =============================================================================
# Schema Validation
# =============================================================================


def validate_product_schema(
    rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict]]:
    """Validate product data against the import schema.

    Args:
        rows: List of product dictionaries.

    Returns:
        Tuple of (valid_products, errors).
    """
    valid = []
    errors = []

    for idx, row in enumerate(rows):
        try:
            # Validate with Pydantic
            product = ProductImportSchema(**row)
            data = product.model_dump()

            # Convert brand_tier string to enum
            try:
                data["brand_tier"] = BrandTier(data["brand_tier"])
            except ValueError:
                # Try mapping common variations
                tier_map = {
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
                }
                tier_lower = data["brand_tier"].lower()
                if tier_lower in tier_map:
                    data["brand_tier"] = tier_map[tier_lower]
                else:
                    raise ValueError(f"Invalid brand tier: {data['brand_tier']}")

            valid.append(data)

        except ValidationError as e:
            errors.append({
                "row": idx + 1,
                "data": row,
                "errors": e.errors(),
            })
        except ValueError as e:
            errors.append({
                "row": idx + 1,
                "data": row,
                "errors": [{"msg": str(e)}],
            })

    logger.info("Validated products", valid=len(valid), errors=len(errors))
    return valid, errors


def validate_store_schema(
    rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict]]:
    """Validate store data against the import schema.

    Args:
        rows: List of store dictionaries.

    Returns:
        Tuple of (valid_stores, errors).
    """
    valid = []
    errors = []

    # Enum mappings
    format_map = {
        "express": StoreFormat.EXPRESS,
        "standard": StoreFormat.STANDARD,
        "superstore": StoreFormat.SUPERSTORE,
        "super store": StoreFormat.SUPERSTORE,
    }
    location_map = {
        "urban": LocationType.URBAN,
        "suburban": LocationType.SUBURBAN,
        "rural": LocationType.RURAL,
    }
    income_map = {
        "low": IncomeIndex.LOW,
        "medium": IncomeIndex.MEDIUM,
        "med": IncomeIndex.MEDIUM,
        "high": IncomeIndex.HIGH,
    }

    for idx, row in enumerate(rows):
        try:
            # Validate with Pydantic
            store = StoreImportSchema(**row)
            data = store.model_dump()

            # Convert enums
            format_lower = data["format"].lower()
            if format_lower in format_map:
                data["format"] = format_map[format_lower]
            else:
                try:
                    data["format"] = StoreFormat(data["format"])
                except ValueError:
                    raise ValueError(f"Invalid store format: {data['format']}")

            location_lower = data["location_type"].lower()
            if location_lower in location_map:
                data["location_type"] = location_map[location_lower]
            else:
                try:
                    data["location_type"] = LocationType(data["location_type"])
                except ValueError:
                    raise ValueError(f"Invalid location type: {data['location_type']}")

            income_lower = data["income_index"].lower()
            if income_lower in income_map:
                data["income_index"] = income_map[income_lower]
            else:
                try:
                    data["income_index"] = IncomeIndex(data["income_index"])
                except ValueError:
                    raise ValueError(f"Invalid income index: {data['income_index']}")

            valid.append(data)

        except ValidationError as e:
            errors.append({
                "row": idx + 1,
                "data": row,
                "errors": e.errors(),
            })
        except ValueError as e:
            errors.append({
                "row": idx + 1,
                "data": row,
                "errors": [{"msg": str(e)}],
            })

    logger.info("Validated stores", valid=len(valid), errors=len(errors))
    return valid, errors


def validate_sale_schema(
    rows: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], list[dict]]:
    """Validate sale data against the import schema.

    Args:
        rows: List of sale dictionaries.

    Returns:
        Tuple of (valid_sales, errors).
        Note: SKU and store_code need to be resolved to IDs by the caller.
    """
    valid = []
    errors = []

    for idx, row in enumerate(rows):
        try:
            sale = SaleImportSchema(**row)
            valid.append(sale.model_dump())

        except ValidationError as e:
            errors.append({
                "row": idx + 1,
                "data": row,
                "errors": e.errors(),
            })

    logger.info("Validated sales", valid=len(valid), errors=len(errors))
    return valid, errors


def detect_file_type(filename: str) -> str:
    """Detect file type from filename extension.

    Args:
        filename: Name of the file.

    Returns:
        File type: 'csv' or 'json'.

    Raises:
        FileParseError: If file type is not supported.
    """
    lower = filename.lower()
    if lower.endswith(".csv"):
        return "csv"
    elif lower.endswith(".json"):
        return "json"
    else:
        raise FileParseError(f"Unsupported file type: {filename}. Use CSV or JSON.")


def parse_file(
    content: bytes | str,
    filename: str,
    encoding: str = "utf-8",
) -> list[dict[str, Any]]:
    """Parse a file based on its extension.

    Args:
        content: File content.
        filename: Original filename (for type detection).
        encoding: Character encoding.

    Returns:
        List of parsed records.
    """
    file_type = detect_file_type(filename)

    if file_type == "csv":
        return parse_csv(content, encoding)
    else:
        return parse_json(content, encoding)
