"""Unit tests for data transformation utilities."""

import json
from uuid import UUID, uuid4

import pytest

from app.db.models import BrandTier, IncomeIndex, LocationType, StoreFormat
from app.utils.transformers import (
    DataTransformers,
    export_to_csv,
    export_to_json,
    normalize_enums,
)


class TestEnumNormalization:
    """Tests for enum normalization."""

    def test_normalize_brand_tier_premium(self):
        """Test normalizing premium brand tier."""
        assert DataTransformers.normalize_brand_tier("premium") == BrandTier.PREMIUM
        assert DataTransformers.normalize_brand_tier("PREMIUM") == BrandTier.PREMIUM
        assert DataTransformers.normalize_brand_tier("Premium") == BrandTier.PREMIUM

    def test_normalize_brand_tier_national_a(self):
        """Test normalizing national A brand tier."""
        assert (
            DataTransformers.normalize_brand_tier("national a") == BrandTier.NATIONAL_A
        )
        assert (
            DataTransformers.normalize_brand_tier("national_a") == BrandTier.NATIONAL_A
        )
        assert (
            DataTransformers.normalize_brand_tier("nationala") == BrandTier.NATIONAL_A
        )
        assert (
            DataTransformers.normalize_brand_tier("National A") == BrandTier.NATIONAL_A
        )

    def test_normalize_brand_tier_national_b(self):
        """Test normalizing national B brand tier."""
        assert (
            DataTransformers.normalize_brand_tier("national b") == BrandTier.NATIONAL_B
        )
        assert (
            DataTransformers.normalize_brand_tier("national_b") == BrandTier.NATIONAL_B
        )

    def test_normalize_brand_tier_store_brand(self):
        """Test normalizing store brand tier."""
        assert (
            DataTransformers.normalize_brand_tier("store brand") == BrandTier.STORE_BRAND
        )
        assert (
            DataTransformers.normalize_brand_tier("store_brand") == BrandTier.STORE_BRAND
        )
        assert (
            DataTransformers.normalize_brand_tier("private label")
            == BrandTier.STORE_BRAND
        )

    def test_normalize_brand_tier_invalid(self):
        """Test that invalid brand tier raises error."""
        with pytest.raises(ValueError) as exc_info:
            DataTransformers.normalize_brand_tier("invalid")
        assert "Invalid brand tier" in str(exc_info.value)

    def test_normalize_store_format(self):
        """Test normalizing store format."""
        assert DataTransformers.normalize_store_format("express") == StoreFormat.EXPRESS
        assert (
            DataTransformers.normalize_store_format("standard") == StoreFormat.STANDARD
        )
        assert (
            DataTransformers.normalize_store_format("superstore")
            == StoreFormat.SUPERSTORE
        )
        assert (
            DataTransformers.normalize_store_format("super store")
            == StoreFormat.SUPERSTORE
        )

    def test_normalize_store_format_invalid(self):
        """Test that invalid store format raises error."""
        with pytest.raises(ValueError):
            DataTransformers.normalize_store_format("invalid")

    def test_normalize_location_type(self):
        """Test normalizing location type."""
        assert DataTransformers.normalize_location_type("urban") == LocationType.URBAN
        assert (
            DataTransformers.normalize_location_type("suburban") == LocationType.SUBURBAN
        )
        assert DataTransformers.normalize_location_type("rural") == LocationType.RURAL

    def test_normalize_location_type_invalid(self):
        """Test that invalid location type raises error."""
        with pytest.raises(ValueError):
            DataTransformers.normalize_location_type("invalid")

    def test_normalize_income_index(self):
        """Test normalizing income index."""
        assert DataTransformers.normalize_income_index("low") == IncomeIndex.LOW
        assert DataTransformers.normalize_income_index("medium") == IncomeIndex.MEDIUM
        assert DataTransformers.normalize_income_index("med") == IncomeIndex.MEDIUM
        assert DataTransformers.normalize_income_index("high") == IncomeIndex.HIGH

    def test_normalize_income_index_invalid(self):
        """Test that invalid income index raises error."""
        with pytest.raises(ValueError):
            DataTransformers.normalize_income_index("invalid")


class TestProductTransformations:
    """Tests for product transformations."""

    def test_transform_product_for_import(self):
        """Test transforming product data for import."""
        data = {
            "sku": "SKU-001",
            "name": "Test Product",
            "brand": "TestBrand",
            "brand_tier": "National A",
            "subcategory": "CSD",
            "price": "5.99",
            "cost": "3.50",
            "width_inches": "10.5",
            "is_active": "true",
        }

        result = DataTransformers.transform_product_for_import(data)

        assert result["brand_tier"] == BrandTier.NATIONAL_A
        assert result["price"] == 5.99
        assert result["cost"] == 3.50
        assert result["width_inches"] == 10.5
        assert result["is_active"] is True

    def test_transform_product_for_import_already_enum(self):
        """Test that already-converted enums are preserved."""
        data = {
            "sku": "SKU-001",
            "brand_tier": BrandTier.PREMIUM,
            "price": 5.99,
        }

        result = DataTransformers.transform_product_for_import(data)

        assert result["brand_tier"] == BrandTier.PREMIUM

    def test_transform_product_for_export(self):
        """Test transforming product for export."""

        class MockProduct:
            sku = "SKU-001"
            name = "Test Product"
            brand = "TestBrand"
            brand_tier = BrandTier.PREMIUM
            subcategory = "CSD"
            size = "12oz"
            pack_type = "12-pack"
            price = 5.99
            cost = 3.50
            width_inches = 10.5
            space_elasticity = 0.15
            flavor = "Original"
            price_tier = "mid"
            is_active = True

        result = DataTransformers.transform_product_for_export(MockProduct())

        assert result["sku"] == "SKU-001"
        assert result["brand_tier"] == "premium"  # Enum converted to string
        assert result["price"] == 5.99
        assert result["is_active"] is True

    def test_transform_product_for_export_dict(self):
        """Test transforming product dict for export."""
        data = {
            "sku": "SKU-001",
            "brand_tier": BrandTier.PREMIUM,
            "price": 5.99,
        }

        result = DataTransformers.transform_product_for_export(data)

        assert result["brand_tier"] == "premium"


class TestStoreTransformations:
    """Tests for store transformations."""

    def test_transform_store_for_import(self):
        """Test transforming store data for import."""
        data = {
            "store_code": "STR-001",
            "name": "Test Store",
            "format": "superstore",
            "location_type": "urban",
            "income_index": "high",
            "total_facings": "120",
            "num_shelves": "5",
            "shelf_width_inches": "48.0",
            "weekly_traffic": "15000",
            "is_active": "yes",
        }

        result = DataTransformers.transform_store_for_import(data)

        assert result["format"] == StoreFormat.SUPERSTORE
        assert result["location_type"] == LocationType.URBAN
        assert result["income_index"] == IncomeIndex.HIGH
        assert result["total_facings"] == 120
        assert result["num_shelves"] == 5
        assert result["shelf_width_inches"] == 48.0
        assert result["weekly_traffic"] == 15000
        assert result["is_active"] is True

    def test_transform_store_for_export(self):
        """Test transforming store for export."""

        class MockStore:
            store_code = "STR-001"
            name = "Test Store"
            format = StoreFormat.STANDARD
            location_type = LocationType.SUBURBAN
            income_index = IncomeIndex.MEDIUM
            total_facings = 80
            num_shelves = 4
            shelf_width_inches = 48.0
            weekly_traffic = 8000
            region = "Northeast"
            is_active = True

        result = DataTransformers.transform_store_for_export(MockStore())

        assert result["store_code"] == "STR-001"
        assert result["format"] == "standard"
        assert result["location_type"] == "suburban"
        assert result["income_index"] == "medium"


class TestSaleTransformations:
    """Tests for sale transformations."""

    def test_transform_sale_for_import(self):
        """Test transforming sale data for import."""
        product_id = uuid4()
        store_id = uuid4()
        sku_to_id = {"SKU-001": product_id}
        store_code_to_id = {"STR-001": store_id}

        data = {
            "sku": "SKU-001",
            "store_code": "STR-001",
            "week_number": "1",
            "year": "2024",
            "units_sold": "100",
            "revenue": "599.00",
            "facings": "3",
            "on_promotion": "true",
        }

        result = DataTransformers.transform_sale_for_import(
            data, sku_to_id, store_code_to_id
        )

        assert result["product_id"] == product_id
        assert result["store_id"] == store_id
        assert "sku" not in result
        assert "store_code" not in result
        assert result["week_number"] == 1
        assert result["year"] == 2024
        assert result["units_sold"] == 100
        assert result["revenue"] == 599.00
        assert result["facings"] == 3
        assert result["on_promotion"] is True

    def test_transform_sale_for_import_unknown_sku(self):
        """Test that unknown SKU raises error."""
        with pytest.raises(ValueError) as exc_info:
            DataTransformers.transform_sale_for_import(
                {"sku": "UNKNOWN", "store_code": "STR-001"},
                sku_to_id={},
                store_code_to_id={"STR-001": uuid4()},
            )
        assert "Unknown SKU" in str(exc_info.value)

    def test_transform_sale_for_import_unknown_store(self):
        """Test that unknown store code raises error."""
        with pytest.raises(ValueError) as exc_info:
            DataTransformers.transform_sale_for_import(
                {"sku": "SKU-001", "store_code": "UNKNOWN"},
                sku_to_id={"SKU-001": uuid4()},
                store_code_to_id={},
            )
        assert "Unknown store code" in str(exc_info.value)

    def test_transform_sale_for_export(self):
        """Test transforming sale for export."""
        product_id = uuid4()
        store_id = uuid4()
        id_to_sku = {product_id: "SKU-001"}
        id_to_store_code = {store_id: "STR-001"}

        class MockSale:
            def __init__(self):
                self.product_id = product_id
                self.store_id = store_id
                self.week_number = 1
                self.year = 2024
                self.units_sold = 100
                self.revenue = 599.00
                self.facings = 3
                self.on_promotion = False

        result = DataTransformers.transform_sale_for_export(
            MockSale(), id_to_sku, id_to_store_code
        )

        assert result["sku"] == "SKU-001"
        assert result["store_code"] == "STR-001"
        assert "product_id" not in result
        assert "store_id" not in result
        assert result["week_number"] == 1
        assert result["revenue"] == 599.00


class TestFormatConversions:
    """Tests for format conversion methods."""

    def test_to_csv_simple(self):
        """Test simple CSV conversion."""
        data = [
            {"sku": "SKU-001", "name": "Product 1", "price": 5.99},
            {"sku": "SKU-002", "name": "Product 2", "price": 6.99},
        ]

        result = DataTransformers.to_csv(data)

        assert "sku,name,price" in result
        assert "SKU-001,Product 1,5.99" in result
        assert "SKU-002,Product 2,6.99" in result

    def test_to_csv_with_field_order(self):
        """Test CSV conversion with specific field order."""
        data = [{"a": 1, "b": 2, "c": 3}]

        result = DataTransformers.to_csv(data, fields=["c", "b", "a"])

        lines = result.strip().split("\n")
        assert lines[0] == "c,b,a"
        assert lines[1] == "3,2,1"

    def test_to_csv_empty(self):
        """Test CSV conversion with empty data."""
        result = DataTransformers.to_csv([])
        assert result == ""

    def test_to_json_simple(self):
        """Test simple JSON conversion."""
        data = [{"sku": "SKU-001", "price": 5.99}]

        result = DataTransformers.to_json(data)
        parsed = json.loads(result)

        assert len(parsed) == 1
        assert parsed[0]["sku"] == "SKU-001"

    def test_to_json_with_key(self):
        """Test JSON conversion with wrapper key."""
        data = [{"sku": "SKU-001"}]

        result = DataTransformers.to_json(data, key="products")
        parsed = json.loads(result)

        assert "products" in parsed
        assert len(parsed["products"]) == 1

    def test_to_json_uuid_serialization(self):
        """Test that UUIDs are serialized."""
        test_uuid = uuid4()
        data = [{"id": test_uuid}]

        result = DataTransformers.to_json(data)
        parsed = json.loads(result)

        assert parsed[0]["id"] == str(test_uuid)

    def test_to_json_enum_serialization(self):
        """Test that enums are serialized."""
        data = [{"brand_tier": BrandTier.PREMIUM}]

        result = DataTransformers.to_json(data)
        parsed = json.loads(result)

        assert parsed[0]["brand_tier"] == "premium"

    def test_to_json_compact(self):
        """Test compact JSON output."""
        data = [{"a": 1, "b": 2}]

        result = DataTransformers.to_json(data, pretty=False)

        assert "\n" not in result  # No newlines in compact mode


class TestBuildIdMappings:
    """Tests for building ID mappings."""

    def test_build_id_mappings_from_models(self):
        """Test building mappings from model objects."""

        class MockProduct:
            def __init__(self, id, sku):
                self.id = id
                self.sku = sku

        class MockStore:
            def __init__(self, id, store_code):
                self.id = id
                self.store_code = store_code

        product_id = uuid4()
        store_id = uuid4()
        products = [MockProduct(product_id, "SKU-001")]
        stores = [MockStore(store_id, "STR-001")]

        (
            sku_to_id,
            store_code_to_id,
            id_to_sku,
            id_to_store_code,
        ) = DataTransformers.build_id_mappings(products, stores)

        assert sku_to_id["SKU-001"] == product_id
        assert store_code_to_id["STR-001"] == store_id
        assert id_to_sku[product_id] == "SKU-001"
        assert id_to_store_code[store_id] == "STR-001"

    def test_build_id_mappings_from_dicts(self):
        """Test building mappings from dictionaries."""
        product_id = uuid4()
        store_id = uuid4()
        products = [{"id": product_id, "sku": "SKU-001"}]
        stores = [{"id": store_id, "store_code": "STR-001"}]

        (
            sku_to_id,
            store_code_to_id,
            id_to_sku,
            id_to_store_code,
        ) = DataTransformers.build_id_mappings(products, stores)

        assert sku_to_id["SKU-001"] == product_id
        assert store_code_to_id["STR-001"] == store_id


class TestConvenienceFunctions:
    """Tests for convenience functions."""

    def test_normalize_enums_product(self):
        """Test normalize_enums for product."""
        data = {"brand_tier": "National A", "price": "5.99"}

        result = normalize_enums(data, "product")

        assert result["brand_tier"] == BrandTier.NATIONAL_A

    def test_normalize_enums_store(self):
        """Test normalize_enums for store."""
        data = {"format": "superstore", "location_type": "urban"}

        result = normalize_enums(data, "store")

        assert result["format"] == StoreFormat.SUPERSTORE
        assert result["location_type"] == LocationType.URBAN

    def test_export_to_csv_products(self):
        """Test export_to_csv for products."""
        data = [
            {
                "sku": "SKU-001",
                "brand_tier": BrandTier.PREMIUM,
                "price": 5.99,
            }
        ]

        result = export_to_csv(data, "product")

        assert "sku" in result
        assert "SKU-001" in result
        assert "premium" in result

    def test_export_to_json_stores(self):
        """Test export_to_json for stores."""
        data = [
            {
                "store_code": "STR-001",
                "format": StoreFormat.STANDARD,
                "location_type": LocationType.URBAN,
            }
        ]

        result = export_to_json(data, "store")
        parsed = json.loads(result)

        assert "stores" in parsed
        assert parsed["stores"][0]["format"] == "standard"


class TestToBool:
    """Tests for boolean conversion."""

    def test_to_bool_true_values(self):
        """Test true values."""
        assert DataTransformers._to_bool(True) is True
        assert DataTransformers._to_bool("true") is True
        assert DataTransformers._to_bool("True") is True
        assert DataTransformers._to_bool("TRUE") is True
        assert DataTransformers._to_bool("1") is True
        assert DataTransformers._to_bool("yes") is True
        assert DataTransformers._to_bool("y") is True
        assert DataTransformers._to_bool("t") is True
        assert DataTransformers._to_bool(1) is True

    def test_to_bool_false_values(self):
        """Test false values."""
        assert DataTransformers._to_bool(False) is False
        assert DataTransformers._to_bool("false") is False
        assert DataTransformers._to_bool("0") is False
        assert DataTransformers._to_bool("no") is False
        assert DataTransformers._to_bool("") is False
        assert DataTransformers._to_bool(0) is False
