"""Comprehensive unit tests for the MNL demand model service."""

import math
from uuid import uuid4

import numpy as np
import pytest

from app.services.demand_model import (
    DemandModelConfig,
    DemandModelService,
    ProductData,
)


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def default_config():
    """Get default model configuration."""
    return DemandModelConfig()


@pytest.fixture
def model(default_config):
    """Get model with default config."""
    return DemandModelService(config=default_config)


@pytest.fixture
def sample_products():
    """Create sample products for testing."""
    return [
        ProductData(
            id=uuid4(),
            sku="SKU-001",
            brand="Coca-Cola",
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=2.99,
            price_tier="Value",
            flavor="Original",
            space_elasticity=0.15,
        ),
        ProductData(
            id=uuid4(),
            sku="SKU-002",
            brand="Pepsi",
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=2.89,
            price_tier="Value",
            flavor="Original",
            space_elasticity=0.15,
        ),
        ProductData(
            id=uuid4(),
            sku="SKU-003",
            brand="Red Bull",
            brand_tier="Premium",
            subcategory="Energy Drinks",
            size="12oz",
            price=3.99,
            price_tier="Mid",
            flavor="Original",
            space_elasticity=0.25,
        ),
        ProductData(
            id=uuid4(),
            sku="SKU-004",
            brand="Store Brand",
            brand_tier="Store Brand",
            subcategory="Soft Drinks",
            size="2L",
            price=1.49,
            price_tier="Value",
            flavor="Original",
            space_elasticity=0.10,
        ),
    ]


# =============================================================================
# Utility Calculation Tests
# =============================================================================


class TestUtilityCalculation:
    """Tests for utility calculation."""

    def test_utility_includes_intercept(self, model):
        """Test that utility includes the intercept term."""
        product = ProductData(
            id=uuid4(),
            sku="TEST",
            brand="Test",
            brand_tier="Store Brand",  # 0 utility
            subcategory="Test",
            size="other",  # 0 utility
            price=5.0,  # -0.5 * (5/5) = -0.5
            price_tier="Mid",
            flavor="Test",
        )

        utility = model.calculate_utility(product)

        # beta_intercept (1.0) + brand_tier (0) + price (-0.5) + size (0)
        expected = 1.0 + 0 + (-0.5 * 1.0) + 0
        assert abs(utility - expected) < 0.001

    def test_premium_brand_higher_utility(self, model):
        """Test that premium brands have higher utility."""
        base_product = ProductData(
            id=uuid4(),
            sku="BASE",
            brand="Test",
            brand_tier="Store Brand",
            subcategory="Test",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Test",
        )

        premium_product = ProductData(
            id=uuid4(),
            sku="PREMIUM",
            brand="Test",
            brand_tier="Premium",
            subcategory="Test",
            size="12oz",
            price=3.00,
            price_tier="Premium",
            flavor="Test",
        )

        base_utility = model.calculate_utility(base_product)
        premium_utility = model.calculate_utility(premium_product)

        assert premium_utility > base_utility
        # Premium utility should be 0.8 higher than Store Brand
        assert abs((premium_utility - base_utility) - 0.8) < 0.001

    def test_higher_price_lower_utility(self, model):
        """Test that higher prices reduce utility."""
        cheap_product = ProductData(
            id=uuid4(),
            sku="CHEAP",
            brand="Test",
            brand_tier="National A",
            subcategory="Test",
            size="12oz",
            price=2.00,
            price_tier="Value",
            flavor="Test",
        )

        expensive_product = ProductData(
            id=uuid4(),
            sku="EXPENSIVE",
            brand="Test",
            brand_tier="National A",
            subcategory="Test",
            size="12oz",
            price=10.00,
            price_tier="Premium",
            flavor="Test",
        )

        cheap_utility = model.calculate_utility(cheap_product)
        expensive_utility = model.calculate_utility(expensive_product)

        assert cheap_utility > expensive_utility

    def test_promotion_increases_utility(self, model):
        """Test that promotion increases utility."""
        product = ProductData(
            id=uuid4(),
            sku="TEST",
            brand="Test",
            brand_tier="National A",
            subcategory="Test",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Test",
            on_promotion=False,
        )

        base_utility = model.calculate_utility(product)
        promo_utility = model.calculate_utility(product, on_promotion=True)

        assert promo_utility > base_utility
        # Promotion boost is 0.8
        assert abs((promo_utility - base_utility) - 0.8) < 0.001

    def test_size_utilities_applied(self, model):
        """Test that size utilities are correctly applied."""
        sizes_to_utilities = {
            "12oz": 0.3,
            "20oz": 0.5,
            "1L": 0.4,
            "2L": 0.2,
        }

        for size, expected_util in sizes_to_utilities.items():
            product = ProductData(
                id=uuid4(),
                sku="TEST",
                brand="Test",
                brand_tier="Store Brand",  # 0 utility
                subcategory="Test",
                size=size,
                price=5.0,  # -0.5 utility
                price_tier="Value",
                flavor="Test",
            )

            utility = model.calculate_utility(product)
            expected = 1.0 + 0 + (-0.5) + expected_util
            assert abs(utility - expected) < 0.001, f"Size {size} failed"


# =============================================================================
# Choice Probability Tests
# =============================================================================


class TestChoiceProbabilities:
    """Tests for MNL choice probabilities."""

    def test_probabilities_sum_to_one(self, model, sample_products):
        """Test that MNL probabilities sum to 1.0."""
        probabilities = model.predict_choice_probabilities(sample_products)

        total = sum(probabilities.values())
        assert abs(total - 1.0) < 0.001

    def test_higher_utility_higher_probability(self, model):
        """Test that higher utility products have higher probability."""
        # Create two products, one clearly better
        premium_product = ProductData(
            id=uuid4(),
            sku="PREMIUM",
            brand="Premium",
            brand_tier="Premium",
            subcategory="Test",
            size="20oz",  # Best size utility
            price=3.00,
            price_tier="Mid",
            flavor="Test",
        )

        budget_product = ProductData(
            id=uuid4(),
            sku="BUDGET",
            brand="Budget",
            brand_tier="Store Brand",
            subcategory="Test",
            size="2L",  # Lowest size utility
            price=10.00,  # High price
            price_tier="Value",
            flavor="Test",
        )

        products = [premium_product, budget_product]
        probs = model.predict_choice_probabilities(products)

        assert probs["PREMIUM"] > probs["BUDGET"]

    def test_unavailable_products_have_zero_probability(self, model, sample_products):
        """Test that unavailable products get zero probability."""
        # Make first two products unavailable
        available_mask = np.array([False, False, True, True])

        probs = model.predict_choice_probabilities(sample_products, available_mask)

        assert probs[sample_products[0].sku] == 0.0
        assert probs[sample_products[1].sku] == 0.0
        assert probs[sample_products[2].sku] > 0.0
        assert probs[sample_products[3].sku] > 0.0

        # Probabilities of available products should still sum to 1
        available_total = probs[sample_products[2].sku] + probs[sample_products[3].sku]
        assert abs(available_total - 1.0) < 0.001

    def test_single_product_gets_full_probability(self, model):
        """Test that a single product gets probability of 1.0."""
        product = ProductData(
            id=uuid4(),
            sku="ONLY",
            brand="Test",
            brand_tier="National A",
            subcategory="Test",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Test",
        )

        probs = model.predict_choice_probabilities([product])

        assert abs(probs["ONLY"] - 1.0) < 0.001

    def test_empty_products_returns_empty(self, model):
        """Test that empty product list returns empty dict."""
        probs = model.predict_choice_probabilities([])
        assert probs == {}


# =============================================================================
# Similarity Tests
# =============================================================================


class TestSimilarity:
    """Tests for product similarity calculation."""

    def test_identical_products_max_similarity(self, model):
        """Test that identical products have maximum similarity (1.0)."""
        product1 = ProductData(
            id=uuid4(),
            sku="P1",
            brand="Same",
            brand_tier="National A",
            subcategory="Same",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Same",
        )

        product2 = ProductData(
            id=uuid4(),
            sku="P2",
            brand="Same",
            brand_tier="National A",
            subcategory="Same",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Same",
        )

        similarity = model.calculate_similarity(product1, product2)

        # Brand (0.30) + Size (0.20) + Price tier (0.20) + Subcategory (0.20) + Flavor (0.10)
        assert abs(similarity - 1.0) < 0.001

    def test_different_products_partial_similarity(self, model):
        """Test that products with some matching attributes have partial similarity."""
        product1 = ProductData(
            id=uuid4(),
            sku="P1",
            brand="Coca-Cola",
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Original",
        )

        product2 = ProductData(
            id=uuid4(),
            sku="P2",
            brand="Coca-Cola",  # Same brand
            brand_tier="National A",
            subcategory="Soft Drinks",  # Same subcategory
            size="20oz",  # Different size
            price=4.00,
            price_tier="Mid",  # Different price tier
            flavor="Cherry",  # Different flavor
        )

        similarity = model.calculate_similarity(product1, product2)

        # Brand (0.30) + Subcategory (0.20) = 0.50
        assert abs(similarity - 0.50) < 0.001

    def test_completely_different_products_zero_similarity(self, model):
        """Test that completely different products have zero similarity."""
        product1 = ProductData(
            id=uuid4(),
            sku="P1",
            brand="Brand1",
            brand_tier="Premium",
            subcategory="Cat1",
            size="12oz",
            price=3.00,
            price_tier="Premium",
            flavor="Flavor1",
        )

        product2 = ProductData(
            id=uuid4(),
            sku="P2",
            brand="Brand2",
            brand_tier="Store Brand",
            subcategory="Cat2",
            size="2L",
            price=1.00,
            price_tier="Value",
            flavor="Flavor2",
        )

        similarity = model.calculate_similarity(product1, product2)
        assert similarity == 0.0

    def test_similarity_weights_sum_to_one(self, default_config):
        """Test that similarity weights sum to 1.0."""
        total = (
            default_config.brand_similarity_weight
            + default_config.size_similarity_weight
            + default_config.price_tier_similarity_weight
            + default_config.subcategory_similarity_weight
            + default_config.flavor_similarity_weight
        )
        assert abs(total - 1.0) < 0.001


# =============================================================================
# Substitution Matrix Tests
# =============================================================================


class TestSubstitutionMatrix:
    """Tests for substitution matrix calculation."""

    def test_matrix_rows_sum_to_one(self, model, sample_products):
        """Test that each row of substitution matrix sums to 1.0."""
        matrix = model.calculate_substitution_matrix(sample_products)

        for i in range(len(sample_products)):
            row_sum = matrix[i].sum()
            # Row should sum to 1.0 (excluding self)
            assert abs(row_sum - 1.0) < 0.001, f"Row {i} sums to {row_sum}"

    def test_diagonal_is_zero(self, model, sample_products):
        """Test that diagonal elements (self-substitution) are zero."""
        matrix = model.calculate_substitution_matrix(sample_products)

        for i in range(len(sample_products)):
            assert matrix[i, i] == 0.0

    def test_similar_products_higher_substitution(self, model):
        """Test that similar products have higher substitution probability."""
        # Create products where 1 and 2 are similar, 3 is different
        products = [
            ProductData(
                id=uuid4(),
                sku="P1",
                brand="Same",
                brand_tier="National A",
                subcategory="Same",
                size="12oz",
                price=3.00,
                price_tier="Value",
                flavor="Same",
            ),
            ProductData(
                id=uuid4(),
                sku="P2",
                brand="Same",  # Same brand
                brand_tier="National A",
                subcategory="Same",  # Same subcategory
                size="12oz",  # Same size
                price=3.00,
                price_tier="Value",  # Same price tier
                flavor="Different",  # Different flavor
            ),
            ProductData(
                id=uuid4(),
                sku="P3",
                brand="Different",
                brand_tier="Premium",
                subcategory="Different",
                size="2L",
                price=10.00,
                price_tier="Premium",
                flavor="Other",
            ),
        ]

        matrix = model.calculate_substitution_matrix(products)

        # P1 should substitute more to P2 than to P3
        assert matrix[0, 1] > matrix[0, 2]

    def test_empty_products_returns_empty_matrix(self, model):
        """Test that empty product list returns empty matrix."""
        matrix = model.calculate_substitution_matrix([])
        assert matrix.size == 0


# =============================================================================
# Demand Transfer Tests
# =============================================================================


class TestDemandTransfer:
    """Tests for demand transfer calculation."""

    def test_transfer_respects_walk_rate(self, model, sample_products):
        """Test that correct percentage walks away."""
        base_demand = {
            sample_products[0].sku: 100.0,
            sample_products[1].sku: 80.0,
            sample_products[2].sku: 60.0,
            sample_products[3].sku: 40.0,
        }

        result = model.estimate_demand_transfer(
            products=sample_products,
            base_demand=base_demand,
            removed_skus=[sample_products[0].sku],
            walk_rate=0.09,
        )

        # 9% of 100 = 9 should walk away
        assert abs(result["walked_away"] - 9.0) < 0.1

    def test_transfers_sum_to_remaining_demand(self, model, sample_products):
        """Test that transfers + walked = removed demand."""
        removed_sku = sample_products[0].sku
        removed_demand = 100.0

        base_demand = {
            removed_sku: removed_demand,
            sample_products[1].sku: 80.0,
            sample_products[2].sku: 60.0,
            sample_products[3].sku: 40.0,
        }

        result = model.estimate_demand_transfer(
            products=sample_products,
            base_demand=base_demand,
            removed_skus=[removed_sku],
        )

        # Sum of transfers + walked should equal removed demand
        transferred = sum(t["amount"] for t in result["transfers"])
        total_accounted = transferred + result["walked_away"]

        assert abs(total_accounted - removed_demand) < 0.1

    def test_removed_sku_has_zero_demand(self, model, sample_products):
        """Test that removed SKU ends up with zero demand."""
        removed_sku = sample_products[0].sku

        base_demand = {p.sku: 100.0 for p in sample_products}

        result = model.estimate_demand_transfer(
            products=sample_products,
            base_demand=base_demand,
            removed_skus=[removed_sku],
        )

        assert result["new_demand"].get(removed_sku, 0) == 0

    def test_invalid_sku_no_change(self, model, sample_products):
        """Test that invalid SKU doesn't change demand."""
        base_demand = {p.sku: 100.0 for p in sample_products}

        result = model.estimate_demand_transfer(
            products=sample_products,
            base_demand=base_demand,
            removed_skus=["INVALID-SKU"],
        )

        assert result["walked_away"] == 0.0
        assert len(result["transfers"]) == 0


# =============================================================================
# Elasticity Tests
# =============================================================================


class TestPriceElasticity:
    """Tests for price elasticity calculation."""

    def test_price_increase_reduces_demand(self, model):
        """Test that price increases reduce demand."""
        result = model.calculate_price_elasticity(
            base_demand=100.0,
            base_price=5.0,
            new_price=6.0,  # 20% increase
            elasticity=-1.8,
        )

        assert result["new_demand"] < 100.0
        assert result["demand_change"] < 0

    def test_price_decrease_increases_demand(self, model):
        """Test that price decreases increase demand."""
        result = model.calculate_price_elasticity(
            base_demand=100.0,
            base_price=5.0,
            new_price=4.0,  # 20% decrease
            elasticity=-1.8,
        )

        assert result["new_demand"] > 100.0
        assert result["demand_change"] > 0

    def test_elasticity_magnitude_correct(self, model):
        """Test that elasticity is correctly applied."""
        result = model.calculate_price_elasticity(
            base_demand=100.0,
            base_price=10.0,
            new_price=11.0,  # 10% increase
            elasticity=-2.0,
        )

        # 10% price increase with -2.0 elasticity = 20% demand decrease
        expected_change_pct = -0.20
        assert abs(result["demand_change_pct"] - expected_change_pct) < 0.001

    def test_demand_floors_at_zero(self, model):
        """Test that demand cannot go negative."""
        result = model.calculate_price_elasticity(
            base_demand=100.0,
            base_price=5.0,
            new_price=50.0,  # 900% increase (extreme)
            elasticity=-1.8,
        )

        assert result["new_demand"] >= 0

    def test_zero_base_price_returns_unchanged(self, model):
        """Test handling of zero base price."""
        result = model.calculate_price_elasticity(
            base_demand=100.0,
            base_price=0.0,
            new_price=5.0,
        )

        assert result["new_demand"] == 100.0


class TestSpaceElasticity:
    """Tests for space elasticity calculation."""

    def test_more_facings_increases_demand(self, model):
        """Test that more facings increase demand."""
        result = model.calculate_space_elasticity(
            base_demand=100.0,
            base_facings=2,
            new_facings=4,  # Double
            elasticity=0.15,
        )

        assert result["new_demand"] > 100.0
        assert result["demand_change"] > 0

    def test_fewer_facings_reduces_demand(self, model):
        """Test that fewer facings reduce demand."""
        result = model.calculate_space_elasticity(
            base_demand=100.0,
            base_facings=4,
            new_facings=2,  # Half
            elasticity=0.15,
        )

        assert result["new_demand"] < 100.0
        assert result["demand_change"] < 0

    def test_space_elasticity_formula(self, model):
        """Test that space elasticity uses power formula."""
        result = model.calculate_space_elasticity(
            base_demand=100.0,
            base_facings=2,
            new_facings=4,
            elasticity=0.15,
        )

        # new_demand = 100 * (4/2)^0.15
        expected = 100.0 * (2.0 ** 0.15)
        assert abs(result["new_demand"] - expected) < 0.001

    def test_zero_facings_returns_zero_demand(self, model):
        """Test that zero new facings gives zero demand."""
        result = model.calculate_space_elasticity(
            base_demand=100.0,
            base_facings=2,
            new_facings=0,
            elasticity=0.15,
        )

        assert result["new_demand"] == 0.0

    def test_zero_base_facings_handled(self, model):
        """Test handling of zero base facings."""
        result = model.calculate_space_elasticity(
            base_demand=100.0,
            base_facings=0,
            new_facings=2,
        )

        # Should return base demand when base facings is 0
        assert result["new_demand"] == 100.0


# =============================================================================
# Cannibalization Tests
# =============================================================================


class TestCannibalization:
    """Tests for cannibalization analysis."""

    def test_cannibalization_creates_new_demand(self, model, sample_products):
        """Test that new product gets estimated demand."""
        existing_demand = {p.sku: 100.0 for p in sample_products}

        new_product = ProductData(
            id=uuid4(),
            sku="NEW",
            brand="Coca-Cola",  # Similar to first product
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Lime",
        )

        result = model.calculate_cannibalization(
            existing_products=sample_products,
            existing_demand=existing_demand,
            new_product=new_product,
        )

        assert result["new_product_demand"] > 0

    def test_incremental_demand_respected(self, model, sample_products):
        """Test that incremental demand percentage is respected."""
        existing_demand = {p.sku: 100.0 for p in sample_products}

        new_product = ProductData(
            id=uuid4(),
            sku="NEW",
            brand="Test",
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Test",
        )

        result = model.calculate_cannibalization(
            existing_products=sample_products,
            existing_demand=existing_demand,
            new_product=new_product,
            incremental_demand_pct=0.30,
        )

        # Incremental should be 30% of new product demand
        assert abs(
            result["incremental_demand"] - (result["new_product_demand"] * 0.30)
        ) < 0.1

        # Cannibalized should be 70%
        assert abs(
            result["cannibalized_demand"] - (result["new_product_demand"] * 0.70)
        ) < 0.1

    def test_cannibalization_from_similar_products(self, model, sample_products):
        """Test that similar products are cannibalized more."""
        existing_demand = {p.sku: 100.0 for p in sample_products}

        # New product similar to SKU-001 (Coca-Cola)
        new_product = ProductData(
            id=uuid4(),
            sku="NEW",
            brand="Coca-Cola",
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Original",  # Same as SKU-001
        )

        result = model.calculate_cannibalization(
            existing_products=sample_products,
            existing_demand=existing_demand,
            new_product=new_product,
        )

        # SKU-001 should be cannibalized more than dissimilar products
        if sample_products[0].sku in result["cannibalization_by_sku"]:
            sku_001_cannib = result["cannibalization_by_sku"][sample_products[0].sku]

            # Should be more than at least one other product
            other_cannibs = [
                v for k, v in result["cannibalization_by_sku"].items()
                if k != sample_products[0].sku
            ]

            if other_cannibs:
                assert sku_001_cannib >= min(other_cannibs)

    def test_adjusted_demand_non_negative(self, model, sample_products):
        """Test that adjusted demand is never negative."""
        existing_demand = {p.sku: 50.0 for p in sample_products}

        new_product = ProductData(
            id=uuid4(),
            sku="NEW",
            brand="Coca-Cola",
            brand_tier="National A",
            subcategory="Soft Drinks",
            size="12oz",
            price=3.00,
            price_tier="Value",
            flavor="Original",
        )

        result = model.calculate_cannibalization(
            existing_products=sample_products,
            existing_demand=existing_demand,
            new_product=new_product,
            incremental_demand_pct=0.0,  # 100% cannibalization
        )

        for sku, demand in result["adjusted_demand"].items():
            assert demand >= 0, f"SKU {sku} has negative demand: {demand}"


# =============================================================================
# Switching Matrix Tests
# =============================================================================


class TestSwitchingMatrix:
    """Tests for switching probability matrix."""

    def test_switching_probabilities_sum_to_one(self, model):
        """Test that switching probabilities sum to 1.0."""
        behaviors = model.get_switching_probabilities()

        total = sum(b["probability"] for b in behaviors)
        assert abs(total - 1.0) < 0.01

    def test_walk_rate_in_switching(self, model):
        """Test that walk rate is included in switching."""
        behaviors = model.get_switching_probabilities()

        walk_behaviors = [b for b in behaviors if "Walk" in b["switch_type"]]
        assert len(walk_behaviors) == 1
        assert walk_behaviors[0]["probability"] == model.config.walk_rate

    def test_expected_switching_values(self, model):
        """Test that switching values match research."""
        behaviors = model.get_switching_probabilities()

        probs = {b["switch_type"]: b["probability"] for b in behaviors}

        assert probs["Same Brand, Different Flavor"] == 0.27
        assert probs["Same Brand, Different Size"] == 0.23
        assert probs["Different Brand, Same Subcategory"] == 0.20
        assert probs["Different Subcategory"] == 0.21
