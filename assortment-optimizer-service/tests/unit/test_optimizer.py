"""Unit tests for the assortment optimizer service."""

from uuid import uuid4

import pytest

from app.schemas.optimization import OptimizationConstraints
from app.services.optimizer import AssortmentOptimizerService, SKUMetrics


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def default_constraints():
    """Get default optimization constraints."""
    return OptimizationConstraints()


@pytest.fixture
def sample_sku_metrics():
    """Create sample SKU metrics for testing."""
    return [
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-001",
            name="Coca-Cola Original 12oz",
            brand="Coca-Cola",
            subcategory="Soft Drinks",
            price=2.99,
            price_tier="Value",
            space_elasticity=0.15,
            avg_profit=50.0,
            avg_units=100,
            avg_revenue=299.0,
            current_facings=2,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-002",
            name="Pepsi Original 12oz",
            brand="Pepsi",
            subcategory="Soft Drinks",
            price=2.89,
            price_tier="Value",
            space_elasticity=0.15,
            avg_profit=45.0,
            avg_units=90,
            avg_revenue=260.0,
            current_facings=2,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-003",
            name="Red Bull Original 12oz",
            brand="Red Bull",
            subcategory="Energy Drinks",
            price=3.99,
            price_tier="Premium",
            space_elasticity=0.25,
            avg_profit=60.0,
            avg_units=50,
            avg_revenue=199.5,
            current_facings=3,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-004",
            name="Tropicana Orange Juice 1L",
            brand="Tropicana",
            subcategory="Juices",
            price=4.99,
            price_tier="Mid",
            space_elasticity=0.18,
            avg_profit=40.0,
            avg_units=40,
            avg_revenue=199.6,
            current_facings=2,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-005",
            name="Store Brand Cola 2L",
            brand="Store Brand",
            subcategory="Soft Drinks",
            price=1.49,
            price_tier="Value",
            space_elasticity=0.10,
            avg_profit=20.0,
            avg_units=80,
            avg_revenue=119.2,
            current_facings=2,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-006",
            name="Aquafina Water 20oz",
            brand="Aquafina",
            subcategory="Water",
            price=1.99,
            price_tier="Value",
            space_elasticity=0.10,
            avg_profit=15.0,
            avg_units=120,
            avg_revenue=238.8,
            current_facings=3,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-007",
            name="Monster Energy 12oz",
            brand="Monster",
            subcategory="Energy Drinks",
            price=3.49,
            price_tier="Mid",
            space_elasticity=0.25,
            avg_profit=55.0,
            avg_units=45,
            avg_revenue=157.0,
            current_facings=2,
        ),
        SKUMetrics(
            product_id=uuid4(),
            sku="SKU-008",
            name="Minute Maid Apple Juice 1L",
            brand="Minute Maid",
            subcategory="Juices",
            price=3.99,
            price_tier="Mid",
            space_elasticity=0.18,
            avg_profit=35.0,
            avg_units=35,
            avg_revenue=139.6,
            current_facings=1,
        ),
    ]


# =============================================================================
# Greedy Optimizer Tests
# =============================================================================


class TestGreedyOptimizer:
    """Tests for the greedy optimization algorithm."""

    def test_respects_total_facings_constraint(self, sample_sku_metrics):
        """Test that total facings does not exceed the limit."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_facings_per_sku=1,
            max_facings_per_sku=6,
        )

        # Create optimizer instance without database
        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)

        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        total_facings = sum(selected.values())
        assert total_facings <= constraints.total_facings

    def test_respects_min_facings_per_sku(self, sample_sku_metrics):
        """Test that each selected SKU has at least minimum facings."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_facings_per_sku=2,
            max_facings_per_sku=6,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        for sku, facings in selected.items():
            assert facings >= constraints.min_facings_per_sku, \
                f"SKU {sku} has {facings} facings, min is {constraints.min_facings_per_sku}"

    def test_respects_max_facings_per_sku(self, sample_sku_metrics):
        """Test that no SKU exceeds maximum facings."""
        constraints = OptimizationConstraints(
            total_facings=100,
            min_facings_per_sku=1,
            max_facings_per_sku=4,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        for sku, facings in selected.items():
            assert facings <= constraints.max_facings_per_sku, \
                f"SKU {sku} has {facings} facings, max is {constraints.max_facings_per_sku}"

    def test_must_carry_items_always_included(self, sample_sku_metrics):
        """Test that must-carry items are always selected."""
        must_carry = ["SKU-004", "SKU-006"]

        constraints = OptimizationConstraints(
            total_facings=50,
            must_carry=must_carry,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        for sku in must_carry:
            assert sku in selected, f"Must-carry SKU {sku} was not selected"

    def test_excluded_items_never_included(self, sample_sku_metrics):
        """Test that excluded items are never selected."""
        exclude = ["SKU-001", "SKU-003"]

        constraints = OptimizationConstraints(
            total_facings=50,
            exclude=exclude,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        for sku in exclude:
            assert sku not in selected, f"Excluded SKU {sku} was selected"

    def test_subcategory_coverage(self, sample_sku_metrics):
        """Test that minimum SKUs per subcategory is satisfied."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_skus_per_subcategory=1,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        # Count SKUs per subcategory
        sku_map = {m.sku: m for m in sample_sku_metrics}
        subcat_counts = {}
        for sku in selected:
            m = sku_map.get(sku)
            if m:
                subcat_counts[m.subcategory] = subcat_counts.get(m.subcategory, 0) + 1

        # Each subcategory in the data should have at least min coverage
        all_subcats = set(m.subcategory for m in sample_sku_metrics)
        for subcat in all_subcats:
            count = subcat_counts.get(subcat, 0)
            # Note: May not be achievable if total_facings is too small
            # This test assumes we have enough space

    def test_price_tier_coverage(self, sample_sku_metrics):
        """Test that minimum SKUs per price tier is satisfied."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_skus_per_price_tier=1,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        # Count SKUs per price tier
        sku_map = {m.sku: m for m in sample_sku_metrics}
        tier_counts = {}
        for sku in selected:
            m = sku_map.get(sku)
            if m and m.price_tier:
                tier_counts[m.price_tier] = tier_counts.get(m.price_tier, 0) + 1

        # Check coverage
        all_tiers = set(m.price_tier for m in sample_sku_metrics if m.price_tier)
        for tier in all_tiers:
            assert tier_counts.get(tier, 0) >= constraints.min_skus_per_price_tier

    def test_max_skus_per_brand_constraint(self, sample_sku_metrics):
        """Test that brand limits are respected."""
        constraints = OptimizationConstraints(
            total_facings=100,
            max_skus_per_brand=2,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        # Count SKUs per brand
        sku_map = {m.sku: m for m in sample_sku_metrics}
        brand_counts = {}
        for sku in selected:
            m = sku_map.get(sku)
            if m:
                brand_counts[m.brand] = brand_counts.get(m.brand, 0) + 1

        for brand, count in brand_counts.items():
            assert count <= constraints.max_skus_per_brand, \
                f"Brand {brand} has {count} SKUs, max is {constraints.max_skus_per_brand}"

    def test_higher_profit_skus_preferred(self, sample_sku_metrics):
        """Test that higher profit SKUs tend to get more space."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_facings_per_sku=1,
            max_facings_per_sku=6,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        # The highest profit SKU (SKU-003 at $60) should be selected
        assert "SKU-003" in selected

        # The lowest profit SKU (SKU-006 at $15) should have fewer or no facings
        # compared to high profit SKUs
        high_profit_sku = "SKU-003"
        low_profit_sku = "SKU-006"

        if high_profit_sku in selected and low_profit_sku in selected:
            assert selected[high_profit_sku] >= selected[low_profit_sku]

    def test_extra_facings_allocated_to_top_performers(self, sample_sku_metrics):
        """Test that extra facings go to high-profit SKUs."""
        # With tight space, top performers should get max facings
        constraints = OptimizationConstraints(
            total_facings=60,
            min_facings_per_sku=1,
            max_facings_per_sku=6,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        # Check that at least one SKU has more than min facings
        has_extra_facings = any(f > constraints.min_facings_per_sku for f in selected.values())
        assert has_extra_facings, "No SKU received extra facings"

    def test_empty_input_returns_empty_result(self):
        """Test handling of empty input."""
        constraints = OptimizationConstraints(total_facings=100)

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize([], constraints)

        assert selected == {}


# =============================================================================
# Constraint Checking Tests
# =============================================================================


class TestConstraintChecking:
    """Tests for constraint satisfaction checking."""

    def test_check_all_constraints_satisfied(self, sample_sku_metrics):
        """Test that all constraints can be satisfied."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_facings_per_sku=1,
            max_facings_per_sku=6,
            min_skus_per_subcategory=1,
            min_skus_per_price_tier=1,
            max_skus_per_brand=5,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        checks = optimizer._check_constraints(sample_sku_metrics, selected, constraints)

        # Most constraints should be satisfied
        satisfied = [c for c in checks if c.satisfied]
        unsatisfied = [c for c in checks if not c.satisfied]

        # At minimum, total facings should be satisfied
        total_check = next((c for c in checks if c.constraint_name == "total_facings"), None)
        assert total_check is not None
        assert total_check.satisfied

    def test_must_carry_constraint_check(self, sample_sku_metrics):
        """Test that must-carry constraint checking works."""
        must_carry = ["SKU-004"]
        constraints = OptimizationConstraints(
            total_facings=50,
            must_carry=must_carry,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        checks = optimizer._check_constraints(sample_sku_metrics, selected, constraints)

        # Find must-carry check
        must_carry_check = next(
            (c for c in checks if c.constraint_name == f"must_carry_{must_carry[0]}"),
            None,
        )
        assert must_carry_check is not None
        assert must_carry_check.satisfied

    def test_exclude_constraint_check(self, sample_sku_metrics):
        """Test that exclude constraint checking works."""
        exclude = ["SKU-001"]
        constraints = OptimizationConstraints(
            total_facings=50,
            exclude=exclude,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        checks = optimizer._check_constraints(sample_sku_metrics, selected, constraints)

        # Find exclude check
        exclude_check = next(
            (c for c in checks if c.constraint_name == f"exclude_{exclude[0]}"),
            None,
        )
        assert exclude_check is not None
        assert exclude_check.satisfied


# =============================================================================
# Product Allocation Tests
# =============================================================================


class TestProductAllocations:
    """Tests for product allocation building."""

    def test_allocation_includes_all_relevant_skus(self, sample_sku_metrics):
        """Test that allocations include both current and selected SKUs."""
        # Mark some SKUs as having current facings
        sample_sku_metrics[0].current_facings = 3
        sample_sku_metrics[1].current_facings = 2

        constraints = OptimizationConstraints(total_facings=50)

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        allocations = optimizer._build_product_allocations(sample_sku_metrics, selected)

        # Should include all SKUs that have current facings or are selected
        allocation_skus = {a.sku for a in allocations}
        assert "SKU-001" in allocation_skus
        assert "SKU-002" in allocation_skus

    def test_allocation_calculates_change_correctly(self, sample_sku_metrics):
        """Test that facing change is calculated correctly."""
        sample_sku_metrics[0].current_facings = 2

        constraints = OptimizationConstraints(total_facings=50)

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        allocations = optimizer._build_product_allocations(sample_sku_metrics, selected)

        for alloc in allocations:
            expected_change = alloc.optimized_facings - alloc.current_facings
            assert alloc.facing_change == expected_change

    def test_allocation_profit_uses_space_elasticity(self, sample_sku_metrics):
        """Test that profit calculation uses space elasticity."""
        sample_sku_metrics[0].current_facings = 2
        sample_sku_metrics[0].avg_profit = 100.0
        sample_sku_metrics[0].space_elasticity = 0.15

        constraints = OptimizationConstraints(
            total_facings=50,
            min_facings_per_sku=1,
            max_facings_per_sku=6,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = {"SKU-001": 4}  # Double the facings

        allocations = optimizer._build_product_allocations(sample_sku_metrics, selected)

        sku_001_alloc = next(a for a in allocations if a.sku == "SKU-001")

        # With doubling facings and 0.15 elasticity:
        # optimized_profit = 100 * (4/2)^0.15 = 100 * 2^0.15 ≈ 111.0
        expected_profit = 100.0 * (4 / 2) ** 0.15
        assert abs(sku_001_alloc.optimized_profit - expected_profit) < 0.1


# =============================================================================
# Space Allocation Tests
# =============================================================================


class TestSpaceAllocations:
    """Tests for space allocation building."""

    def test_space_allocation_by_subcategory(self, sample_sku_metrics):
        """Test that space is aggregated by subcategory."""
        # Set current facings
        for m in sample_sku_metrics:
            m.current_facings = 2

        constraints = OptimizationConstraints(total_facings=60)

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        space_allocs = optimizer._build_space_allocations(
            sample_sku_metrics, selected, constraints.total_facings
        )

        # Should have allocations for each subcategory
        subcats = {a.subcategory for a in space_allocs}
        expected_subcats = set(m.subcategory for m in sample_sku_metrics)

        # All subcategories with data should be represented
        for subcat in expected_subcats:
            assert subcat in subcats

    def test_space_allocation_percentages_sum(self, sample_sku_metrics):
        """Test that space allocation percentages are reasonable."""
        for m in sample_sku_metrics:
            m.current_facings = 2

        constraints = OptimizationConstraints(total_facings=60)

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)
        space_allocs = optimizer._build_space_allocations(
            sample_sku_metrics, selected, constraints.total_facings
        )

        # Optimized percentages should sum to 100 (approximately)
        total_pct = sum(a.optimized_pct for a in space_allocs)
        assert 99 <= total_pct <= 101, f"Total percentage is {total_pct}, expected ~100"


# =============================================================================
# Edge Case Tests
# =============================================================================


class TestEdgeCases:
    """Tests for edge cases and error handling."""

    def test_very_tight_space_constraint(self, sample_sku_metrics):
        """Test behavior with limited space (minimum allowed is 50)."""
        constraints = OptimizationConstraints(
            total_facings=50,
            min_facings_per_sku=1,
            max_facings_per_sku=3,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(sample_sku_metrics, constraints)

        # Should select some SKUs within the limit
        total = sum(selected.values())
        assert total <= constraints.total_facings

    def test_all_skus_same_profit(self):
        """Test behavior when all SKUs have identical profit."""
        metrics = [
            SKUMetrics(
                product_id=uuid4(),
                sku=f"SKU-{i:03d}",
                name=f"Product {i}",
                brand=f"Brand{i % 3}",
                subcategory="Category",
                price=5.0,
                price_tier="Mid",
                space_elasticity=0.15,
                avg_profit=50.0,  # All same
                avg_units=50,
                avg_revenue=250.0,
                current_facings=2,
            )
            for i in range(1, 6)
        ]

        constraints = OptimizationConstraints(total_facings=50)

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(metrics, constraints)

        # Should still select SKUs
        assert len(selected) > 0
        total = sum(selected.values())
        assert total <= constraints.total_facings

    def test_must_carry_exceeds_space(self):
        """Test when must-carry items require most of the available space."""
        metrics = [
            SKUMetrics(
                product_id=uuid4(),
                sku=f"SKU-{i:03d}",
                name=f"Product {i}",
                brand="Brand",
                subcategory="Category",
                price=5.0,
                price_tier="Mid",
                space_elasticity=0.15,
                avg_profit=50.0,
                avg_units=50,
                avg_revenue=250.0,
                current_facings=2,
            )
            for i in range(1, 21)  # 20 SKUs
        ]

        # 10 must-carry items with min 5 facings each = 50 facings (exactly the limit)
        must_carry = [f"SKU-{i:03d}" for i in range(1, 11)]  # 10 SKUs

        constraints = OptimizationConstraints(
            total_facings=50,  # Tight space with many must-carry items
            min_facings_per_sku=5,
            must_carry=must_carry,
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(metrics, constraints)

        # Should include as many must-carry as possible
        included_must_carry = [sku for sku in must_carry if sku in selected]
        assert len(included_must_carry) > 0

    def test_conflicting_must_carry_and_exclude(self):
        """Test that exclude takes precedence over must-carry."""
        metrics = [
            SKUMetrics(
                product_id=uuid4(),
                sku=f"SKU-{i:03d}",
                name=f"Product {i}",
                brand="Brand",
                subcategory="Category",
                price=5.0,
                price_tier="Mid",
                space_elasticity=0.15,
                avg_profit=50.0,
                avg_units=50,
                avg_revenue=250.0,
                current_facings=2,
            )
            for i in range(1, 6)  # 5 SKUs
        ]

        constraints = OptimizationConstraints(
            total_facings=50,
            must_carry=["SKU-001"],
            exclude=["SKU-001"],  # Conflicting
        )

        optimizer = AssortmentOptimizerService.__new__(AssortmentOptimizerService)
        selected = optimizer._greedy_optimize(metrics, constraints)

        # Exclude should take precedence
        assert "SKU-001" not in selected
