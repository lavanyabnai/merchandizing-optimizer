"""Unit tests for the data generator service."""

import pytest

from app.db.models import BrandTier, IncomeIndex, LocationType, StoreFormat
from app.services.data_generator import DataGeneratorService


class TestDataGeneratorProducts:
    """Tests for product generation."""

    def test_generate_products_count(self):
        """Test that correct number of products is generated."""
        # Create generator without database session for unit testing
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products(count=80)

        # 4 subcategories * 4 brands * 5 SKUs = 80 products
        assert len(products) == 80

    def test_generate_products_subcategories(self):
        """Test that products span all subcategories."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        subcategories = set(p["subcategory"] for p in products)
        expected = {"Soft Drinks", "Juices", "Water", "Energy Drinks"}

        assert subcategories == expected

    def test_generate_products_subcategory_distribution(self):
        """Test equal distribution across subcategories (20 per subcategory)."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        counts = {}
        for p in products:
            counts[p["subcategory"]] = counts.get(p["subcategory"], 0) + 1

        for subcat, count in counts.items():
            assert count == 20, f"{subcat} has {count} products, expected 20"

    def test_generate_products_brands(self):
        """Test that expected brands are present."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        brands = set(p["brand"] for p in products)

        # Check some expected brands
        assert "Coca-Cola" in brands
        assert "Pepsi" in brands
        assert "Tropicana" in brands
        assert "Red Bull" in brands
        assert "Monster" in brands
        assert "Aquafina" in brands

    def test_generate_products_brand_tiers(self):
        """Test that all brand tiers are present."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        tiers = set(p["brand_tier"] for p in products)

        assert BrandTier.PREMIUM in tiers
        assert BrandTier.NATIONAL_A in tiers
        assert BrandTier.NATIONAL_B in tiers
        assert BrandTier.STORE_BRAND in tiers

    def test_generate_products_price_tier_distribution(self):
        """Test that price tiers follow expected distribution."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        tiers = {}
        for p in products:
            tier = p["price_tier"]
            tiers[tier] = tiers.get(tier, 0) + 1

        # All three price tiers should be present
        assert "Value" in tiers
        assert "Mid" in tiers
        assert "Premium" in tiers

    def test_generate_products_price_greater_than_cost(self):
        """Test that price is always greater than cost."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        for p in products:
            assert p["price"] > p["cost"], f"Product {p['sku']} has price <= cost"

    def test_generate_products_unique_skus(self):
        """Test that all SKUs are unique."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        skus = [p["sku"] for p in products]
        assert len(skus) == len(set(skus)), "Duplicate SKUs found"

    def test_generate_products_valid_sizes(self):
        """Test that all sizes are valid."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        valid_sizes = {"12oz", "20oz", "1L", "2L"}
        for p in products:
            assert p["size"] in valid_sizes, f"Invalid size: {p['size']}"

    def test_generate_products_valid_pack_types(self):
        """Test that all pack types are valid."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        valid_packs = {"Single", "6-pack", "12-pack", "24-pack"}
        for p in products:
            assert p["pack_type"] in valid_packs, f"Invalid pack: {p['pack_type']}"

    def test_generate_products_space_elasticity(self):
        """Test that space elasticity is within expected range."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        products = generator.generate_products()

        for p in products:
            assert 0.10 <= p["space_elasticity"] <= 0.25

    def test_generate_products_reproducibility(self):
        """Test that same seed produces same results."""
        generator1 = DataGeneratorService.__new__(DataGeneratorService)
        generator1.seed = 42
        generator1._rng = __import__("numpy").random.default_rng(42)

        generator2 = DataGeneratorService.__new__(DataGeneratorService)
        generator2.seed = 42
        generator2._rng = __import__("numpy").random.default_rng(42)

        products1 = generator1.generate_products()
        products2 = generator2.generate_products()

        for p1, p2 in zip(products1, products2):
            assert p1["sku"] == p2["sku"]
            assert p1["name"] == p2["name"]
            assert p1["price"] == p2["price"]


class TestDataGeneratorStores:
    """Tests for store generation."""

    def test_generate_stores_count(self):
        """Test that correct number of stores is generated."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=25)

        assert len(stores) == 25

    def test_generate_stores_formats(self):
        """Test that all store formats are present."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=25)

        formats = set(s["format"] for s in stores)

        assert StoreFormat.EXPRESS in formats
        assert StoreFormat.STANDARD in formats
        assert StoreFormat.SUPERSTORE in formats

    def test_generate_stores_format_distribution(self):
        """Test format distribution follows weights (20% Express, 50% Standard, 30% Superstore)."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        # Generate more stores for statistical significance
        stores = generator.generate_stores(count=100)

        counts = {}
        for s in stores:
            counts[s["format"]] = counts.get(s["format"], 0) + 1

        # Allow 15% tolerance
        assert 10 <= counts.get(StoreFormat.EXPRESS, 0) <= 30
        assert 35 <= counts.get(StoreFormat.STANDARD, 0) <= 65
        assert 15 <= counts.get(StoreFormat.SUPERSTORE, 0) <= 45

    def test_generate_stores_locations(self):
        """Test that all location types are present."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=25)

        locations = set(s["location_type"] for s in stores)

        assert LocationType.URBAN in locations
        assert LocationType.SUBURBAN in locations
        assert LocationType.RURAL in locations

    def test_generate_stores_income_levels(self):
        """Test that all income levels are present."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=25)

        incomes = set(s["income_index"] for s in stores)

        assert IncomeIndex.LOW in incomes
        assert IncomeIndex.MEDIUM in incomes
        assert IncomeIndex.HIGH in incomes

    def test_generate_stores_unique_codes(self):
        """Test that all store codes are unique."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=25)

        codes = [s["store_code"] for s in stores]
        assert len(codes) == len(set(codes)), "Duplicate store codes found"

    def test_generate_stores_traffic_by_format(self):
        """Test that traffic varies by format (Express < Standard < Superstore)."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=100)

        # Calculate average traffic by format
        traffic_by_format = {}
        counts = {}
        for s in stores:
            fmt = s["format"]
            traffic_by_format[fmt] = traffic_by_format.get(fmt, 0) + s["weekly_traffic"]
            counts[fmt] = counts.get(fmt, 0) + 1

        avg_traffic = {fmt: traffic_by_format[fmt] / counts[fmt] for fmt in traffic_by_format}

        # Superstore should have highest average traffic
        if StoreFormat.SUPERSTORE in avg_traffic and StoreFormat.EXPRESS in avg_traffic:
            assert avg_traffic[StoreFormat.SUPERSTORE] > avg_traffic[StoreFormat.EXPRESS]

    def test_generate_stores_facings_by_format(self):
        """Test that facings vary by format."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        stores = generator.generate_stores(count=25)

        for s in stores:
            if s["format"] == StoreFormat.EXPRESS:
                assert s["total_facings"] == 60  # 2 sections * 30
            elif s["format"] == StoreFormat.STANDARD:
                assert s["total_facings"] == 120  # 4 sections * 30
            elif s["format"] == StoreFormat.SUPERSTORE:
                assert s["total_facings"] == 180  # 6 sections * 30

    def test_generate_stores_reproducibility(self):
        """Test that same seed produces same results."""
        generator1 = DataGeneratorService.__new__(DataGeneratorService)
        generator1.seed = 42
        generator1._rng = __import__("numpy").random.default_rng(42)

        generator2 = DataGeneratorService.__new__(DataGeneratorService)
        generator2.seed = 42
        generator2._rng = __import__("numpy").random.default_rng(42)

        stores1 = generator1.generate_stores()
        stores2 = generator2.generate_stores()

        for s1, s2 in zip(stores1, stores2):
            assert s1["store_code"] == s2["store_code"]
            assert s1["format"] == s2["format"]
            assert s1["weekly_traffic"] == s2["weekly_traffic"]


class TestDataGeneratorSwitchingMatrix:
    """Tests for switching matrix generation."""

    def test_generate_switching_matrix_entries(self):
        """Test that switching matrix has correct entries."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        matrix = generator.generate_switching_matrix()

        assert len(matrix) == 5  # 5 switching behaviors

    def test_generate_switching_matrix_probabilities_sum_to_one(self):
        """Test that switching probabilities sum to 1.0."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        matrix = generator.generate_switching_matrix()

        total = sum(entry["switching_probability"] for entry in matrix)
        assert abs(total - 1.0) < 0.01, f"Probabilities sum to {total}, expected 1.0"

    def test_generate_switching_matrix_expected_values(self):
        """Test that switching probabilities match research values."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        matrix = generator.generate_switching_matrix()

        probs = {entry["to_brand"]: entry["switching_probability"] for entry in matrix}

        assert probs["SAME_BRAND_DIFF_FLAVOR"] == 0.27
        assert probs["SAME_BRAND_DIFF_SIZE"] == 0.23
        assert probs["DIFF_BRAND_SAME_SUBCAT"] == 0.20
        assert probs["DIFF_SUBCATEGORY"] == 0.21
        assert probs["WALK_AWAY"] == 0.09


class TestDataGeneratorAttributeImportance:
    """Tests for attribute importance generation."""

    def test_generate_attribute_importance_entries(self):
        """Test that attribute importance has correct entries."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        importance = generator.generate_attribute_importance()

        assert len(importance) == 4  # 4 attributes

    def test_generate_attribute_importance_sum_to_one(self):
        """Test that importance values sum to 1.0."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        importance = generator.generate_attribute_importance()

        total = sum(entry["importance"] for entry in importance)
        assert abs(total - 1.0) < 0.01, f"Importance sum to {total}, expected 1.0"

    def test_generate_attribute_importance_order(self):
        """Test that attributes are in correct priority order."""
        generator = DataGeneratorService.__new__(DataGeneratorService)
        generator.seed = 42
        generator._rng = __import__("numpy").random.default_rng(42)

        importance = generator.generate_attribute_importance()

        imp = {entry["attribute"]: entry["importance"] for entry in importance}

        # Subcategory should be most important
        assert imp["Subcategory"] > imp["Brand"]
        assert imp["Brand"] > imp["Size"]
        assert imp["Size"] > imp["Price"]
