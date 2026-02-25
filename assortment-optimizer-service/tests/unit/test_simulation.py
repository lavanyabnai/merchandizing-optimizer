"""Unit tests for the Monte Carlo simulation service."""

import time
from uuid import uuid4

import numpy as np
import pytest

from app.schemas.simulation import SimulationConfig
from app.db.models import ScenarioType


# =============================================================================
# Test Fixtures
# =============================================================================


@pytest.fixture
def default_config():
    """Get default simulation configuration."""
    return SimulationConfig()


@pytest.fixture
def seeded_config():
    """Get simulation configuration with fixed seed for reproducibility."""
    return SimulationConfig(random_seed=42)


@pytest.fixture
def fast_config():
    """Get config with fewer trials for fast testing."""
    return SimulationConfig(num_trials=1000, random_seed=42)


@pytest.fixture
def sample_products():
    """Create sample product data for testing."""
    return [
        {
            "product_id": uuid4(),
            "sku": "SKU-001",
            "name": "Coca-Cola Original 12oz",
            "brand": "Coca-Cola",
            "subcategory": "Soft Drinks",
            "size": "12oz",
            "price_tier": "Value",
            "flavor": "Original",
            "price": 2.99,
            "cost": 1.50,
            "margin": 1.49,
            "space_elasticity": 0.15,
        },
        {
            "product_id": uuid4(),
            "sku": "SKU-002",
            "name": "Pepsi Original 12oz",
            "brand": "Pepsi",
            "subcategory": "Soft Drinks",
            "size": "12oz",
            "price_tier": "Value",
            "flavor": "Original",
            "price": 2.89,
            "cost": 1.45,
            "margin": 1.44,
            "space_elasticity": 0.15,
        },
        {
            "product_id": uuid4(),
            "sku": "SKU-003",
            "name": "Red Bull Original 12oz",
            "brand": "Red Bull",
            "subcategory": "Energy Drinks",
            "size": "12oz",
            "price_tier": "Premium",
            "flavor": "Original",
            "price": 3.99,
            "cost": 2.00,
            "margin": 1.99,
            "space_elasticity": 0.25,
        },
        {
            "product_id": uuid4(),
            "sku": "SKU-004",
            "name": "Tropicana Orange Juice 1L",
            "brand": "Tropicana",
            "subcategory": "Juices",
            "size": "1L",
            "price_tier": "Mid",
            "flavor": "Orange",
            "price": 4.99,
            "cost": 2.50,
            "margin": 2.49,
            "space_elasticity": 0.18,
        },
        {
            "product_id": uuid4(),
            "sku": "SKU-005",
            "name": "Store Brand Cola 2L",
            "brand": "Store Brand",
            "subcategory": "Soft Drinks",
            "size": "2L",
            "price_tier": "Value",
            "flavor": "Original",
            "price": 1.49,
            "cost": 0.75,
            "margin": 0.74,
            "space_elasticity": 0.10,
        },
    ]


# =============================================================================
# Similarity Matrix Tests
# =============================================================================


class TestSimilarityMatrix:
    """Tests for similarity/substitution matrix calculation."""

    def test_matrix_is_square(self, sample_products):
        """Test that similarity matrix is square."""
        from app.services.simulation import SimulationService, ProductData

        products = [
            ProductData(
                product_id=p["product_id"],
                sku=p["sku"],
                name=p["name"],
                brand=p["brand"],
                subcategory=p["subcategory"],
                size=p["size"],
                price_tier=p["price_tier"],
                flavor=p["flavor"],
                price=p["price"],
                cost=p["cost"],
                margin=p["margin"],
                space_elasticity=p["space_elasticity"],
            )
            for p in sample_products
        ]

        service = SimulationService.__new__(SimulationService)
        matrix = service._compute_similarity_matrix(products)

        assert matrix.shape == (len(products), len(products))

    def test_diagonal_is_zero(self, sample_products):
        """Test that self-similarity (diagonal) is zero."""
        from app.services.simulation import SimulationService, ProductData

        products = [
            ProductData(
                product_id=p["product_id"],
                sku=p["sku"],
                name=p["name"],
                brand=p["brand"],
                subcategory=p["subcategory"],
                size=p["size"],
                price_tier=p["price_tier"],
                flavor=p["flavor"],
                price=p["price"],
                cost=p["cost"],
                margin=p["margin"],
                space_elasticity=p["space_elasticity"],
            )
            for p in sample_products
        ]

        service = SimulationService.__new__(SimulationService)
        matrix = service._compute_similarity_matrix(products)

        diagonal = np.diag(matrix)
        assert np.allclose(diagonal, 0)

    def test_rows_sum_to_one(self, sample_products):
        """Test that substitution matrix rows sum to 1 (normalized probabilities)."""
        from app.services.simulation import SimulationService, ProductData

        products = [
            ProductData(
                product_id=p["product_id"],
                sku=p["sku"],
                name=p["name"],
                brand=p["brand"],
                subcategory=p["subcategory"],
                size=p["size"],
                price_tier=p["price_tier"],
                flavor=p["flavor"],
                price=p["price"],
                cost=p["cost"],
                margin=p["margin"],
                space_elasticity=p["space_elasticity"],
            )
            for p in sample_products
        ]

        service = SimulationService.__new__(SimulationService)
        matrix = service._compute_similarity_matrix(products)

        row_sums = matrix.sum(axis=1)
        # Each row should sum to 1 (or 0 if no similar products)
        for i, row_sum in enumerate(row_sums):
            assert row_sum == pytest.approx(1.0, abs=0.001) or row_sum == pytest.approx(0.0, abs=0.001)

    def test_similar_products_higher_substitution(self, sample_products):
        """Test that similar products have higher substitution probability."""
        from app.services.simulation import SimulationService, ProductData

        products = [
            ProductData(
                product_id=p["product_id"],
                sku=p["sku"],
                name=p["name"],
                brand=p["brand"],
                subcategory=p["subcategory"],
                size=p["size"],
                price_tier=p["price_tier"],
                flavor=p["flavor"],
                price=p["price"],
                cost=p["cost"],
                margin=p["margin"],
                space_elasticity=p["space_elasticity"],
            )
            for p in sample_products
        ]

        service = SimulationService.__new__(SimulationService)
        matrix = service._compute_similarity_matrix(products)

        # Coca-Cola (0) and Pepsi (1) are similar (same subcategory, size, price tier, flavor)
        # Red Bull (2) is in different subcategory
        # Substitution from Coca-Cola to Pepsi should be higher than to Red Bull
        assert matrix[0, 1] > matrix[0, 2], "Similar products should have higher substitution"

    def test_empty_products_returns_empty_matrix(self):
        """Test that empty products list returns empty matrix."""
        from app.services.simulation import SimulationService

        service = SimulationService.__new__(SimulationService)
        matrix = service._compute_similarity_matrix([])

        assert matrix.shape == (0, 0)


# =============================================================================
# Distribution Tests
# =============================================================================


class TestDistributions:
    """Tests for statistical distribution properties."""

    def test_demand_noise_has_correct_mean(self, seeded_config):
        """Test that demand noise has mean ~1.0."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 10000
        n_products = 10

        demand_noise = rng.normal(1.0, seeded_config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)

        mean = demand_noise.mean()
        # Mean should be close to 1.0 (slightly above due to clipping at 0)
        assert mean == pytest.approx(1.0, abs=0.02)

    def test_demand_noise_has_correct_std(self, seeded_config):
        """Test that demand noise standard deviation is approximately CV."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 10000
        n_products = 10

        demand_noise = rng.normal(1.0, seeded_config.demand_cv, (n_trials, n_products))
        # Don't clip for std test

        std = demand_noise.std()
        # Std should be close to CV (0.15)
        assert std == pytest.approx(seeded_config.demand_cv, abs=0.01)

    def test_walk_rate_is_bounded(self, seeded_config):
        """Test that walk rate is bounded between 0.01 and 0.30."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 10000

        walk_rates = np.clip(
            rng.normal(seeded_config.walk_rate_mean, seeded_config.walk_rate_std, n_trials),
            0.01, 0.30
        )

        assert walk_rates.min() >= 0.01
        assert walk_rates.max() <= 0.30

    def test_walk_rate_has_correct_mean(self, seeded_config):
        """Test that walk rate has mean close to configured value."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 10000

        walk_rates = np.clip(
            rng.normal(seeded_config.walk_rate_mean, seeded_config.walk_rate_std, n_trials),
            0.01, 0.30
        )

        mean = walk_rates.mean()
        # Mean should be close to configured value
        assert mean == pytest.approx(seeded_config.walk_rate_mean, abs=0.01)

    def test_price_elasticity_is_negative(self, seeded_config):
        """Test that price elasticity is typically negative."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 10000

        elasticities = rng.normal(
            seeded_config.price_elasticity_mean,
            seeded_config.price_elasticity_std,
            n_trials
        )

        # Most elasticities should be negative
        pct_negative = (elasticities < 0).mean()
        assert pct_negative > 0.95


# =============================================================================
# Confidence Interval Tests
# =============================================================================


class TestConfidenceIntervals:
    """Tests for confidence interval calculations."""

    def test_95_ci_contains_mean(self, seeded_config):
        """Test that 95% CI contains the mean."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 5000

        # Generate sample profit data
        profits = rng.normal(1000, 150, n_trials)

        ci_lower = np.percentile(profits, 2.5)
        ci_upper = np.percentile(profits, 97.5)
        mean = profits.mean()

        assert ci_lower < mean < ci_upper

    def test_90_ci_narrower_than_95_ci(self, seeded_config):
        """Test that 90% CI is narrower than 95% CI."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 5000

        profits = rng.normal(1000, 150, n_trials)

        ci_90_width = np.percentile(profits, 95) - np.percentile(profits, 5)
        ci_95_width = np.percentile(profits, 97.5) - np.percentile(profits, 2.5)

        assert ci_90_width < ci_95_width

    def test_percentile_ordering(self, seeded_config):
        """Test that percentiles are in correct order."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 5000

        profits = rng.normal(1000, 150, n_trials)

        p5 = np.percentile(profits, 5)
        p25 = np.percentile(profits, 25)
        p50 = np.percentile(profits, 50)
        p75 = np.percentile(profits, 75)
        p95 = np.percentile(profits, 95)

        assert p5 < p25 < p50 < p75 < p95


# =============================================================================
# Result Creation Tests
# =============================================================================


class TestResultCreation:
    """Tests for simulation result creation."""

    def test_result_has_required_fields(self, fast_config):
        """Test that result contains all required fields."""
        from app.services.simulation import SimulationService
        from app.db.models import ScenarioType

        service = SimulationService.__new__(SimulationService)
        service._config = fast_config

        n_trials = 100
        revenue_trials = np.random.normal(10000, 1500, n_trials)
        profit_trials = np.random.normal(3000, 500, n_trials)

        result = service._create_result(
            scenario_type=ScenarioType.REMOVE_SKU,
            scenario_description="Test scenario",
            parameters={"sku_ids": ["SKU-001"]},
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=10000.0,
            base_profit=3000.0,
            n_trials=n_trials,
            execution_time_ms=100,
        )

        assert result.run_id is not None
        assert result.scenario_type == ScenarioType.REMOVE_SKU
        assert result.revenue_stats is not None
        assert result.profit_stats is not None
        assert 0 <= result.probability_positive <= 1
        assert 0 <= result.probability_negative <= 1

    def test_probability_positive_plus_negative_approximately_one(self, fast_config):
        """Test that positive + negative probabilities sum close to 1."""
        from app.services.simulation import SimulationService
        from app.db.models import ScenarioType

        service = SimulationService.__new__(SimulationService)
        service._config = fast_config

        n_trials = 1000
        base_profit = 3000.0
        # Create data with mix of positive and negative changes
        profit_trials = np.random.normal(base_profit, 500, n_trials)

        result = service._create_result(
            scenario_type=ScenarioType.CHANGE_PRICE,
            scenario_description="Test",
            parameters={},
            revenue_trials=np.random.normal(10000, 1000, n_trials),
            profit_trials=profit_trials,
            base_revenue=10000.0,
            base_profit=base_profit,
            n_trials=n_trials,
            execution_time_ms=50,
        )

        # Positive + negative + exact baseline should equal 1
        total = result.probability_positive + result.probability_negative
        # Allow for some trials exactly at baseline
        assert total <= 1.0
        assert total >= 0.95  # Most trials should be above or below baseline

    def test_breakeven_equals_or_better_than_positive(self, fast_config):
        """Test that breakeven probability >= positive probability."""
        from app.services.simulation import SimulationService
        from app.db.models import ScenarioType

        service = SimulationService.__new__(SimulationService)
        service._config = fast_config

        n_trials = 1000
        profit_trials = np.random.normal(3100, 500, n_trials)  # Slightly above baseline

        result = service._create_result(
            scenario_type=ScenarioType.ADD_SKU,
            scenario_description="Test",
            parameters={},
            revenue_trials=np.random.normal(10000, 1000, n_trials),
            profit_trials=profit_trials,
            base_revenue=10000.0,
            base_profit=3000.0,
            n_trials=n_trials,
            execution_time_ms=50,
        )

        # Breakeven includes exact matches, positive doesn't
        assert result.probability_breakeven >= result.probability_positive


# =============================================================================
# Performance Tests
# =============================================================================


class TestPerformance:
    """Tests for simulation performance."""

    def test_5000_trials_completes_quickly(self):
        """Test that 5000 trials completes in reasonable time (without DB)."""
        # This tests the core simulation logic performance
        rng = np.random.default_rng(42)
        n_trials = 5000
        n_products = 80

        start = time.perf_counter()

        # Simulate the core computation
        base_demand = rng.uniform(30, 200, n_products)
        prices = rng.uniform(1, 10, n_products)
        margins = prices * rng.uniform(0.2, 0.4, n_products)

        demand_noise = rng.normal(1.0, 0.15, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = base_demand * demand_noise[trial]
            revenue_trials[trial] = (trial_demand * prices).sum()
            profit_trials[trial] = (trial_demand * margins).sum()

        elapsed = time.perf_counter() - start

        # Should complete in under 5 seconds (generous limit)
        assert elapsed < 5.0, f"Simulation took {elapsed:.2f}s, expected < 5s"

    def test_vectorized_matches_sequential(self, seeded_config):
        """Test that vectorized operations match sequential calculation."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 100
        n_products = 10

        base_demand = np.array([100.0] * n_products)
        prices = np.array([5.0] * n_products)
        margins = np.array([2.0] * n_products)

        # Pre-sample noise
        demand_noise = rng.normal(1.0, seeded_config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)

        # Sequential calculation
        revenue_seq = []
        for trial in range(n_trials):
            trial_demand = base_demand * demand_noise[trial]
            revenue_seq.append((trial_demand * prices).sum())

        # Vectorized calculation
        trial_demands = base_demand * demand_noise
        revenue_vec = (trial_demands * prices).sum(axis=1)

        # Results should match
        assert np.allclose(revenue_seq, revenue_vec)


# =============================================================================
# Edge Case Tests
# =============================================================================


class TestEdgeCases:
    """Tests for edge cases and error handling."""

    def test_zero_base_profit_handles_percentage(self, fast_config):
        """Test that zero base profit doesn't cause division error."""
        from app.services.simulation import SimulationService
        from app.db.models import ScenarioType

        service = SimulationService.__new__(SimulationService)
        service._config = fast_config

        n_trials = 100
        profit_trials = np.random.normal(100, 50, n_trials)

        result = service._create_result(
            scenario_type=ScenarioType.ADD_SKU,
            scenario_description="Test",
            parameters={},
            revenue_trials=np.random.normal(10000, 1000, n_trials),
            profit_trials=profit_trials,
            base_revenue=10000.0,
            base_profit=0.0,  # Zero base profit
            n_trials=n_trials,
            execution_time_ms=50,
        )

        # Should not raise, should return 0 for percentage
        assert result.profit_change_pct == 0.0

    def test_negative_demand_clipped_to_zero(self, seeded_config):
        """Test that negative demand noise is clipped to zero."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 10000

        # Use high CV to generate some negative values before clipping
        demand_noise = rng.normal(1.0, 0.5, n_trials)
        demand_noise_clipped = np.maximum(demand_noise, 0)

        # All values should be non-negative after clipping
        assert demand_noise_clipped.min() >= 0

        # Some original values should have been negative
        assert demand_noise.min() < 0

    def test_extreme_price_change_demand_floors_at_zero(self, seeded_config):
        """Test that extreme price increases don't produce negative demand."""
        rng = np.random.default_rng(seeded_config.random_seed)
        n_trials = 1000

        base_demand = 100.0
        price_elasticity = -2.0
        price_change_pct = 1.0  # 100% price increase

        demand_changes = 1 + price_elasticity * price_change_pct
        # Demand change would be -1, so new demand = 0

        new_demands = base_demand * np.maximum(demand_changes, 0)

        # Should floor at zero, not go negative
        assert new_demands >= 0


# =============================================================================
# Schema Validation Tests
# =============================================================================


class TestSchemaValidation:
    """Tests for schema validation."""

    def test_config_num_trials_bounds(self):
        """Test that num_trials is bounded."""
        # Valid values
        config = SimulationConfig(num_trials=100)
        assert config.num_trials == 100

        config = SimulationConfig(num_trials=50000)
        assert config.num_trials == 50000

        # Invalid values should raise
        with pytest.raises(ValueError):
            SimulationConfig(num_trials=50)  # Below minimum

        with pytest.raises(ValueError):
            SimulationConfig(num_trials=100000)  # Above maximum

    def test_config_demand_cv_bounds(self):
        """Test that demand_cv is bounded."""
        config = SimulationConfig(demand_cv=0.15)
        assert config.demand_cv == 0.15

        with pytest.raises(ValueError):
            SimulationConfig(demand_cv=0.0)  # Below minimum

        with pytest.raises(ValueError):
            SimulationConfig(demand_cv=1.0)  # Above maximum

    def test_config_walk_rate_bounds(self):
        """Test that walk_rate_mean is bounded."""
        config = SimulationConfig(walk_rate_mean=0.09)
        assert config.walk_rate_mean == 0.09

        config = SimulationConfig(walk_rate_mean=0.0)
        assert config.walk_rate_mean == 0.0

        config = SimulationConfig(walk_rate_mean=1.0)
        assert config.walk_rate_mean == 1.0

        with pytest.raises(ValueError):
            SimulationConfig(walk_rate_mean=-0.1)  # Negative

        with pytest.raises(ValueError):
            SimulationConfig(walk_rate_mean=1.5)  # Above maximum

    def test_config_price_elasticity_must_be_negative_or_zero(self):
        """Test that price_elasticity_mean must be <= 0."""
        config = SimulationConfig(price_elasticity_mean=-1.8)
        assert config.price_elasticity_mean == -1.8

        config = SimulationConfig(price_elasticity_mean=0.0)
        assert config.price_elasticity_mean == 0.0

        with pytest.raises(ValueError):
            SimulationConfig(price_elasticity_mean=0.5)  # Positive not allowed


# =============================================================================
# Reproducibility Tests
# =============================================================================


class TestReproducibility:
    """Tests for result reproducibility with fixed seed."""

    def test_same_seed_produces_same_results(self):
        """Test that same seed produces identical results."""
        from app.services.simulation import SimulationService

        config = SimulationConfig(num_trials=100, random_seed=12345)

        # First run
        service1 = SimulationService.__new__(SimulationService)
        service1._config = config
        service1._set_seed()
        rng1 = service1._rng

        values1 = rng1.normal(1.0, 0.15, 100)

        # Second run with same seed
        service2 = SimulationService.__new__(SimulationService)
        service2._config = config
        service2._set_seed()
        rng2 = service2._rng

        values2 = rng2.normal(1.0, 0.15, 100)

        assert np.allclose(values1, values2)

    def test_different_seeds_produce_different_results(self):
        """Test that different seeds produce different results."""
        from app.services.simulation import SimulationService

        config1 = SimulationConfig(num_trials=100, random_seed=12345)
        config2 = SimulationConfig(num_trials=100, random_seed=54321)

        service1 = SimulationService.__new__(SimulationService)
        service1._config = config1
        service1._set_seed()
        values1 = service1._rng.normal(1.0, 0.15, 100)

        service2 = SimulationService.__new__(SimulationService)
        service2._config = config2
        service2._set_seed()
        values2 = service2._rng.normal(1.0, 0.15, 100)

        assert not np.allclose(values1, values2)
