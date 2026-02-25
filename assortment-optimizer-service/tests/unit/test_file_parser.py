"""Unit tests for file parsing utilities."""

import pytest

from app.db.models import BrandTier, IncomeIndex, LocationType, StoreFormat
from app.utils.file_parser import (
    FileParseError,
    detect_file_type,
    parse_csv,
    parse_json,
    validate_product_schema,
    validate_store_schema,
    validate_sale_schema,
)


class TestParseCSV:
    """Tests for CSV parsing."""

    def test_parse_csv_simple(self):
        """Test parsing a simple CSV."""
        csv_content = """sku,name,price
SKU-001,Product 1,10.99
SKU-002,Product 2,15.50"""

        rows = parse_csv(csv_content)

        assert len(rows) == 2
        assert rows[0]["sku"] == "SKU-001"
        assert rows[0]["name"] == "Product 1"
        assert rows[0]["price"] == 10.99
        assert rows[1]["sku"] == "SKU-002"
        assert rows[1]["price"] == 15.50

    def test_parse_csv_bytes(self):
        """Test parsing CSV from bytes."""
        csv_content = b"""sku,name,price
SKU-001,Product 1,10.99"""

        rows = parse_csv(csv_content)

        assert len(rows) == 1
        assert rows[0]["sku"] == "SKU-001"

    def test_parse_csv_with_empty_values(self):
        """Test that empty values become None."""
        csv_content = """sku,name,flavor
SKU-001,Product 1,
SKU-002,Product 2,Orange"""

        rows = parse_csv(csv_content)

        assert rows[0]["flavor"] is None
        assert rows[1]["flavor"] == "Orange"

    def test_parse_csv_numeric_conversion(self):
        """Test that numeric fields are converted."""
        csv_content = """sku,price,units_sold
SKU-001,10.99,100
SKU-002,15.50,200"""

        rows = parse_csv(csv_content)

        assert isinstance(rows[0]["price"], float)
        assert isinstance(rows[0]["units_sold"], int)
        assert rows[0]["price"] == 10.99
        assert rows[0]["units_sold"] == 100

    def test_parse_csv_boolean_conversion(self):
        """Test that boolean fields are converted."""
        csv_content = """sku,is_active,on_promotion
SKU-001,true,false
SKU-002,1,0
SKU-003,yes,no"""

        rows = parse_csv(csv_content)

        assert rows[0]["is_active"] is True
        assert rows[0]["on_promotion"] is False
        assert rows[1]["is_active"] is True
        assert rows[1]["on_promotion"] is False
        assert rows[2]["is_active"] is True
        assert rows[2]["on_promotion"] is False

    def test_parse_csv_windows_line_endings(self):
        """Test parsing CSV with Windows line endings."""
        csv_content = "sku,name\r\nSKU-001,Product 1\r\nSKU-002,Product 2"

        rows = parse_csv(csv_content)

        assert len(rows) == 2

    def test_parse_csv_strips_whitespace(self):
        """Test that column names and values are stripped."""
        csv_content = """ sku , name
 SKU-001 , Product 1 """

        rows = parse_csv(csv_content)

        assert "sku" in rows[0]
        assert rows[0]["sku"] == "SKU-001"
        assert rows[0]["name"] == "Product 1"

    def test_parse_csv_invalid_format(self):
        """Test that invalid CSV raises error."""
        # This is valid CSV, but let's test with truly malformed content
        # Actually, csv module is quite forgiving, so test encoding error
        with pytest.raises(FileParseError):
            parse_csv(b"\xff\xfe", encoding="utf-8")


class TestParseJSON:
    """Tests for JSON parsing."""

    def test_parse_json_array(self):
        """Test parsing JSON array."""
        json_content = '[{"sku": "SKU-001", "name": "Product 1"}]'

        rows = parse_json(json_content)

        assert len(rows) == 1
        assert rows[0]["sku"] == "SKU-001"

    def test_parse_json_object_with_data_key(self):
        """Test parsing JSON object with 'data' key."""
        json_content = '{"data": [{"sku": "SKU-001"}]}'

        rows = parse_json(json_content)

        assert len(rows) == 1
        assert rows[0]["sku"] == "SKU-001"

    def test_parse_json_object_with_products_key(self):
        """Test parsing JSON object with 'products' key."""
        json_content = '{"products": [{"sku": "SKU-001"}]}'

        rows = parse_json(json_content)

        assert len(rows) == 1

    def test_parse_json_object_with_stores_key(self):
        """Test parsing JSON object with 'stores' key."""
        json_content = '{"stores": [{"store_code": "S001"}]}'

        rows = parse_json(json_content)

        assert len(rows) == 1

    def test_parse_json_bytes(self):
        """Test parsing JSON from bytes."""
        json_content = b'[{"sku": "SKU-001"}]'

        rows = parse_json(json_content)

        assert len(rows) == 1

    def test_parse_json_invalid_format(self):
        """Test that invalid JSON raises error."""
        with pytest.raises(FileParseError):
            parse_json("{invalid json}")

    def test_parse_json_missing_required_key(self):
        """Test that JSON object without data key raises error."""
        with pytest.raises(FileParseError):
            parse_json('{"foo": "bar"}')


class TestDetectFileType:
    """Tests for file type detection."""

    def test_detect_csv(self):
        """Test CSV detection."""
        assert detect_file_type("products.csv") == "csv"
        assert detect_file_type("data.CSV") == "csv"

    def test_detect_json(self):
        """Test JSON detection."""
        assert detect_file_type("products.json") == "json"
        assert detect_file_type("data.JSON") == "json"

    def test_detect_unsupported(self):
        """Test unsupported file type raises error."""
        with pytest.raises(FileParseError):
            detect_file_type("data.xlsx")


class TestValidateProductSchema:
    """Tests for product schema validation."""

    def test_validate_valid_product(self):
        """Test validation of valid product data."""
        rows = [
            {
                "sku": "SKU-001",
                "name": "Test Product",
                "brand": "TestBrand",
                "brand_tier": "National A",
                "subcategory": "Soft Drinks",
                "size": "12oz",
                "pack_type": "Single",
                "price": 2.99,
                "cost": 1.50,
                "width_inches": 2.5,
                "space_elasticity": 0.15,
            }
        ]

        valid, errors = validate_product_schema(rows)

        assert len(valid) == 1
        assert len(errors) == 0
        assert valid[0]["brand_tier"] == BrandTier.NATIONAL_A

    def test_validate_product_tier_variations(self):
        """Test that brand tier variations are handled."""
        rows = [
            {
                "sku": "SKU-001",
                "name": "Test",
                "brand": "Brand",
                "brand_tier": "store brand",
                "subcategory": "Soft Drinks",
                "size": "12oz",
                "pack_type": "Single",
                "price": 2.99,
                "cost": 1.50,
                "width_inches": 2.5,
            },
            {
                "sku": "SKU-002",
                "name": "Test",
                "brand": "Brand",
                "brand_tier": "PREMIUM",
                "subcategory": "Soft Drinks",
                "size": "12oz",
                "pack_type": "Single",
                "price": 2.99,
                "cost": 1.50,
                "width_inches": 2.5,
            },
        ]

        valid, errors = validate_product_schema(rows)

        assert len(valid) == 2
        assert valid[0]["brand_tier"] == BrandTier.STORE_BRAND
        assert valid[1]["brand_tier"] == BrandTier.PREMIUM

    def test_validate_product_missing_required(self):
        """Test that missing required fields produce errors."""
        rows = [
            {
                "sku": "SKU-001",
                "name": "Test",
                # Missing brand, brand_tier, etc.
            }
        ]

        valid, errors = validate_product_schema(rows)

        assert len(valid) == 0
        assert len(errors) == 1

    def test_validate_product_invalid_brand_tier(self):
        """Test that invalid brand tier produces error."""
        rows = [
            {
                "sku": "SKU-001",
                "name": "Test",
                "brand": "Brand",
                "brand_tier": "Invalid Tier",
                "subcategory": "Soft Drinks",
                "size": "12oz",
                "pack_type": "Single",
                "price": 2.99,
                "cost": 1.50,
                "width_inches": 2.5,
            }
        ]

        valid, errors = validate_product_schema(rows)

        assert len(valid) == 0
        assert len(errors) == 1


class TestValidateStoreSchema:
    """Tests for store schema validation."""

    def test_validate_valid_store(self):
        """Test validation of valid store data."""
        rows = [
            {
                "store_code": "STORE-001",
                "name": "Test Store",
                "format": "Standard",
                "location_type": "Urban",
                "income_index": "Medium",
                "total_facings": 120,
                "weekly_traffic": 8000,
            }
        ]

        valid, errors = validate_store_schema(rows)

        assert len(valid) == 1
        assert len(errors) == 0
        assert valid[0]["format"] == StoreFormat.STANDARD
        assert valid[0]["location_type"] == LocationType.URBAN
        assert valid[0]["income_index"] == IncomeIndex.MEDIUM

    def test_validate_store_format_variations(self):
        """Test that format variations are handled."""
        rows = [
            {
                "store_code": "S1",
                "name": "Store 1",
                "format": "express",
                "location_type": "suburban",
                "income_index": "low",
                "total_facings": 60,
                "weekly_traffic": 3000,
            },
            {
                "store_code": "S2",
                "name": "Store 2",
                "format": "SUPERSTORE",
                "location_type": "RURAL",
                "income_index": "HIGH",
                "total_facings": 180,
                "weekly_traffic": 15000,
            },
        ]

        valid, errors = validate_store_schema(rows)

        assert len(valid) == 2
        assert valid[0]["format"] == StoreFormat.EXPRESS
        assert valid[1]["format"] == StoreFormat.SUPERSTORE

    def test_validate_store_missing_required(self):
        """Test that missing required fields produce errors."""
        rows = [
            {
                "store_code": "S1",
                "name": "Store",
                # Missing format, location_type, etc.
            }
        ]

        valid, errors = validate_store_schema(rows)

        assert len(valid) == 0
        assert len(errors) == 1


class TestValidateSaleSchema:
    """Tests for sale schema validation."""

    def test_validate_valid_sale(self):
        """Test validation of valid sale data."""
        rows = [
            {
                "sku": "SKU-001",
                "store_code": "STORE-001",
                "week_number": 1,
                "year": 2024,
                "units_sold": 100,
                "revenue": 299.00,
            }
        ]

        valid, errors = validate_sale_schema(rows)

        assert len(valid) == 1
        assert len(errors) == 0
        assert valid[0]["sku"] == "SKU-001"
        assert valid[0]["store_code"] == "STORE-001"

    def test_validate_sale_with_optionals(self):
        """Test validation with optional fields."""
        rows = [
            {
                "sku": "SKU-001",
                "store_code": "STORE-001",
                "week_number": 1,
                "year": 2024,
                "units_sold": 100,
                "revenue": 299.00,
                "facings": 3,
                "on_promotion": True,
            }
        ]

        valid, errors = validate_sale_schema(rows)

        assert len(valid) == 1
        assert valid[0]["facings"] == 3
        assert valid[0]["on_promotion"] is True

    def test_validate_sale_missing_required(self):
        """Test that missing required fields produce errors."""
        rows = [
            {
                "sku": "SKU-001",
                # Missing store_code, week_number, etc.
            }
        ]

        valid, errors = validate_sale_schema(rows)

        assert len(valid) == 0
        assert len(errors) == 1
