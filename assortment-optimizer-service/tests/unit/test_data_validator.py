"""Unit tests for data validation utilities."""

import pytest

from app.utils.data_validator import DataValidator, ValidationResult


class TestValidationResult:
    """Tests for ValidationResult class."""

    def test_initial_state(self):
        """Test that validation result starts valid."""
        result = ValidationResult(is_valid=True)
        assert result.is_valid is True
        assert len(result.errors) == 0
        assert len(result.warnings) == 0
        assert len(result.stats) == 0

    def test_add_error(self):
        """Test adding an error invalidates result."""
        result = ValidationResult(is_valid=True)
        result.add_error("Test error", row=1, field="sku", value="BAD")

        assert result.is_valid is False
        assert len(result.errors) == 1
        assert result.errors[0]["message"] == "Test error"
        assert result.errors[0]["row"] == 1
        assert result.errors[0]["field"] == "sku"
        assert result.errors[0]["value"] == "BAD"

    def test_add_warning(self):
        """Test that warnings don't invalidate result."""
        result = ValidationResult(is_valid=True)
        result.add_warning("Test warning", row=1)

        assert result.is_valid is True
        assert len(result.warnings) == 1

    def test_merge_results(self):
        """Test merging validation results."""
        result1 = ValidationResult(is_valid=True)
        result1.add_warning("Warning 1")
        result1.stats["count1"] = 10

        result2 = ValidationResult(is_valid=True)
        result2.add_error("Error 1")
        result2.stats["count2"] = 20

        result1.merge(result2)

        assert result1.is_valid is False  # Because result2 has error
        assert len(result1.errors) == 1
        assert len(result1.warnings) == 1
        assert result1.stats["count1"] == 10
        assert result1.stats["count2"] == 20


class TestDataValidatorProducts:
    """Tests for product validation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = DataValidator()
        self.valid_product = {
            "sku": "SKU-001",
            "name": "Test Product",
            "brand": "TestBrand",
            "brand_tier": "premium",
            "subcategory": "CSD",
            "size": "12oz",
            "pack_type": "12-pack",
            "price": 5.99,
            "cost": 3.50,
            "width_inches": 10.5,
        }

    def test_validate_valid_product(self):
        """Test validation passes for valid product."""
        result = self.validator.validate_products([self.valid_product])

        assert result.is_valid is True
        assert len(result.errors) == 0
        assert result.stats["total_products"] == 1
        assert result.stats["valid_products"] == 1

    def test_validate_missing_required_fields(self):
        """Test validation fails for missing required fields."""
        product = {"sku": "SKU-001", "name": "Test"}  # Missing most fields
        result = self.validator.validate_products([product])

        assert result.is_valid is False
        assert len(result.errors) > 0
        # Check that missing fields are reported
        error_fields = {e.get("field") for e in result.errors}
        assert "brand" in error_fields or "brand_tier" in error_fields

    def test_validate_duplicate_skus(self):
        """Test validation catches duplicate SKUs."""
        product1 = self.valid_product.copy()
        product2 = self.valid_product.copy()  # Same SKU

        result = self.validator.validate_products([product1, product2])

        assert result.is_valid is False
        # Should have error for duplicate
        error_messages = [e["message"] for e in result.errors]
        assert any("Duplicate SKU" in msg for msg in error_messages)

    def test_validate_brand_tier_aliases(self):
        """Test that brand tier aliases are accepted."""
        for alias in ["National A", "national_a", "nationala", "National B"]:
            product = self.valid_product.copy()
            product["sku"] = f"SKU-{alias}"
            product["brand_tier"] = alias

            result = self.validator.validate_products([product])
            # Should pass without brand_tier errors
            tier_errors = [
                e for e in result.errors if e.get("field") == "brand_tier"
            ]
            assert len(tier_errors) == 0, f"Failed for alias: {alias}"

    def test_validate_invalid_brand_tier(self):
        """Test validation fails for invalid brand tier."""
        product = self.valid_product.copy()
        product["brand_tier"] = "invalid_tier"

        result = self.validator.validate_products([product])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "brand_tier" in error_fields

    def test_validate_negative_price(self):
        """Test validation fails for negative price."""
        product = self.valid_product.copy()
        product["price"] = -1.00

        result = self.validator.validate_products([product])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "price" in error_fields

    def test_validate_price_less_than_cost_warning(self):
        """Test validation warns when price <= cost."""
        product = self.valid_product.copy()
        product["price"] = 3.00
        product["cost"] = 3.50  # Cost higher than price

        result = self.validator.validate_products([product])

        # Should produce warning, not error
        assert len(result.warnings) > 0
        warning_messages = [w["message"] for w in result.warnings]
        assert any("margin" in msg.lower() for msg in warning_messages)

    def test_validate_invalid_width(self):
        """Test validation fails for invalid width."""
        product = self.valid_product.copy()
        product["width_inches"] = 0

        result = self.validator.validate_products([product])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "width_inches" in error_fields

    def test_validate_space_elasticity_warning(self):
        """Test validation warns for unusual space elasticity."""
        product = self.valid_product.copy()
        product["space_elasticity"] = 2.5  # Unusual value

        result = self.validator.validate_products([product])

        # Should produce warning
        assert len(result.warnings) > 0


class TestDataValidatorStores:
    """Tests for store validation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = DataValidator()
        self.valid_store = {
            "store_code": "STR-001",
            "name": "Test Store",
            "format": "standard",
            "location_type": "urban",
            "income_index": "medium",
            "total_facings": 80,
            "weekly_traffic": 8000,
        }

    def test_validate_valid_store(self):
        """Test validation passes for valid store."""
        result = self.validator.validate_stores([self.valid_store])

        assert result.is_valid is True
        assert len(result.errors) == 0
        assert result.stats["total_stores"] == 1

    def test_validate_missing_required_fields(self):
        """Test validation fails for missing required fields."""
        store = {"store_code": "STR-001", "name": "Test"}
        result = self.validator.validate_stores([store])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "format" in error_fields or "location_type" in error_fields

    def test_validate_duplicate_store_codes(self):
        """Test validation catches duplicate store codes."""
        store1 = self.valid_store.copy()
        store2 = self.valid_store.copy()

        result = self.validator.validate_stores([store1, store2])

        assert result.is_valid is False
        error_messages = [e["message"] for e in result.errors]
        assert any("Duplicate" in msg for msg in error_messages)

    def test_validate_format_aliases(self):
        """Test that format aliases are accepted."""
        for alias in ["superstore", "super store", "SUPERSTORE", "express", "standard"]:
            store = self.valid_store.copy()
            store["store_code"] = f"STR-{alias}"
            store["format"] = alias

            result = self.validator.validate_stores([store])
            format_errors = [e for e in result.errors if e.get("field") == "format"]
            assert len(format_errors) == 0, f"Failed for alias: {alias}"

    def test_validate_invalid_format(self):
        """Test validation fails for invalid format."""
        store = self.valid_store.copy()
        store["format"] = "invalid_format"

        result = self.validator.validate_stores([store])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "format" in error_fields

    def test_validate_invalid_location_type(self):
        """Test validation fails for invalid location type."""
        store = self.valid_store.copy()
        store["location_type"] = "invalid"

        result = self.validator.validate_stores([store])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "location_type" in error_fields

    def test_validate_invalid_income_index(self):
        """Test validation fails for invalid income index."""
        store = self.valid_store.copy()
        store["income_index"] = "invalid"

        result = self.validator.validate_stores([store])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "income_index" in error_fields

    def test_validate_negative_facings(self):
        """Test validation fails for negative facings."""
        store = self.valid_store.copy()
        store["total_facings"] = -10

        result = self.validator.validate_stores([store])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "total_facings" in error_fields


class TestDataValidatorSales:
    """Tests for sales validation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = DataValidator()
        self.valid_sale = {
            "sku": "SKU-001",
            "store_code": "STR-001",
            "week_number": 1,
            "year": 2024,
            "units_sold": 100,
            "revenue": 599.00,
        }

    def test_validate_valid_sale(self):
        """Test validation passes for valid sale."""
        result = self.validator.validate_sales([self.valid_sale])

        assert result.is_valid is True
        assert len(result.errors) == 0
        assert result.stats["total_sales"] == 1

    def test_validate_missing_required_fields(self):
        """Test validation fails for missing required fields."""
        sale = {"sku": "SKU-001", "store_code": "STR-001"}
        result = self.validator.validate_sales([sale])

        assert result.is_valid is False

    def test_validate_invalid_week_number(self):
        """Test validation fails for invalid week number."""
        for week in [0, 53, -1, 100]:
            sale = self.valid_sale.copy()
            sale["week_number"] = week

            result = self.validator.validate_sales([sale])

            assert result.is_valid is False, f"Week {week} should be invalid"
            error_fields = {e.get("field") for e in result.errors}
            assert "week_number" in error_fields

    def test_validate_valid_week_numbers(self):
        """Test validation passes for valid week numbers."""
        for week in [1, 26, 52]:
            sale = self.valid_sale.copy()
            sale["week_number"] = week

            result = self.validator.validate_sales([sale])

            week_errors = [
                e for e in result.errors if e.get("field") == "week_number"
            ]
            assert len(week_errors) == 0, f"Week {week} should be valid"

    def test_validate_unusual_year_warning(self):
        """Test validation warns for unusual years."""
        sale = self.valid_sale.copy()
        sale["year"] = 1990  # Unusual year

        result = self.validator.validate_sales([sale])

        assert len(result.warnings) > 0

    def test_validate_negative_units_sold(self):
        """Test validation fails for negative units sold."""
        sale = self.valid_sale.copy()
        sale["units_sold"] = -10

        result = self.validator.validate_sales([sale])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "units_sold" in error_fields

    def test_validate_negative_revenue(self):
        """Test validation fails for negative revenue."""
        sale = self.valid_sale.copy()
        sale["revenue"] = -100.00

        result = self.validator.validate_sales([sale])

        assert result.is_valid is False
        error_fields = {e.get("field") for e in result.errors}
        assert "revenue" in error_fields

    def test_validate_referential_integrity_sku(self):
        """Test validation catches orphan SKUs."""
        valid_skus = {"SKU-001", "SKU-002"}
        sale = self.valid_sale.copy()
        sale["sku"] = "ORPHAN-SKU"

        result = self.validator.validate_sales(
            [sale], valid_skus=valid_skus, valid_store_codes={"STR-001"}
        )

        assert result.is_valid is False
        error_messages = [e["message"] for e in result.errors]
        assert any("ORPHAN-SKU" in msg for msg in error_messages)

    def test_validate_referential_integrity_store(self):
        """Test validation catches orphan store codes."""
        valid_store_codes = {"STR-001", "STR-002"}
        sale = self.valid_sale.copy()
        sale["store_code"] = "ORPHAN-STORE"

        result = self.validator.validate_sales(
            [sale], valid_skus={"SKU-001"}, valid_store_codes=valid_store_codes
        )

        assert result.is_valid is False
        error_messages = [e["message"] for e in result.errors]
        assert any("ORPHAN-STORE" in msg for msg in error_messages)


class TestDataValidatorReferentialIntegrity:
    """Tests for referential integrity validation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = DataValidator()
        self.products = [
            {"sku": "SKU-001", "name": "Product 1"},
            {"sku": "SKU-002", "name": "Product 2"},
        ]
        self.stores = [
            {"store_code": "STR-001", "name": "Store 1"},
            {"store_code": "STR-002", "name": "Store 2"},
        ]
        self.sales = [
            {
                "sku": "SKU-001",
                "store_code": "STR-001",
                "week_number": 1,
                "year": 2024,
                "units_sold": 100,
                "revenue": 500,
            },
        ]

    def test_validate_referential_integrity_valid(self):
        """Test valid referential integrity."""
        result = self.validator.validate_referential_integrity(
            self.products, self.stores, self.sales
        )

        # Should be valid
        assert result.is_valid is True
        assert result.stats["products_with_sales"] == 1
        assert result.stats["stores_with_sales"] == 1

    def test_validate_orphan_sku_in_sales(self):
        """Test detection of orphan SKU in sales."""
        sales = self.sales + [
            {
                "sku": "ORPHAN-SKU",
                "store_code": "STR-001",
                "week_number": 1,
                "year": 2024,
                "units_sold": 50,
                "revenue": 250,
            }
        ]

        result = self.validator.validate_referential_integrity(
            self.products, self.stores, sales
        )

        assert result.is_valid is False
        assert result.stats["orphan_skus_in_sales"] == 1

    def test_validate_orphan_store_in_sales(self):
        """Test detection of orphan store in sales."""
        sales = self.sales + [
            {
                "sku": "SKU-001",
                "store_code": "ORPHAN-STORE",
                "week_number": 1,
                "year": 2024,
                "units_sold": 50,
                "revenue": 250,
            }
        ]

        result = self.validator.validate_referential_integrity(
            self.products, self.stores, sales
        )

        assert result.is_valid is False
        assert result.stats["orphan_stores_in_sales"] == 1

    def test_validate_products_without_sales_warning(self):
        """Test warning for products without sales."""
        result = self.validator.validate_referential_integrity(
            self.products, self.stores, self.sales
        )

        # SKU-002 has no sales
        assert result.stats["products_without_sales"] == 1
        assert len(result.warnings) > 0

    def test_validate_stores_without_sales_warning(self):
        """Test warning for stores without sales."""
        result = self.validator.validate_referential_integrity(
            self.products, self.stores, self.sales
        )

        # STR-002 has no sales
        assert result.stats["stores_without_sales"] == 1


class TestDataValidatorAll:
    """Tests for combined validation."""

    def setup_method(self):
        """Set up test fixtures."""
        self.validator = DataValidator()

    def test_validate_all_empty_data(self):
        """Test validation with empty data."""
        result = self.validator.validate_all()

        assert result.is_valid is True

    def test_validate_all_products_only(self):
        """Test validation with only products."""
        products = [
            {
                "sku": "SKU-001",
                "name": "Test",
                "brand": "Brand",
                "brand_tier": "premium",
                "subcategory": "CSD",
                "size": "12oz",
                "pack_type": "12-pack",
                "price": 5.99,
                "cost": 3.50,
                "width_inches": 10.5,
            }
        ]

        result = self.validator.validate_all(products=products)

        assert result.is_valid is True
        assert "products" in result.stats

    def test_validate_all_with_errors(self):
        """Test validation catches errors across entities."""
        products = [{"sku": "SKU-001"}]  # Invalid - missing fields
        stores = [{"store_code": "STR-001"}]  # Invalid - missing fields
        sales = [{"sku": "SKU-001"}]  # Invalid - missing fields

        result = self.validator.validate_all(
            products=products, stores=stores, sales=sales
        )

        assert result.is_valid is False
        assert len(result.errors) > 0
