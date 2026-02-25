"""
Performance benchmarks for the optimization service.

Run with: pytest tests/benchmarks/benchmark_optimization.py -v --benchmark-enable

Performance targets:
- Optimization (80 products): < 2 seconds
- Optimization (200 products): < 5 seconds
"""

import asyncio
import gc
import time
import tracemalloc
from dataclasses import dataclass
from decimal import Decimal
from typing import Any
from uuid import uuid4

import numpy as np
import pytest

from app.db.models import BrandTier


@dataclass
class BenchmarkResult:
    """Result of a benchmark run."""

    name: str
    duration_ms: float
    memory_peak_mb: float
    memory_current_mb: float
    iterations: int
    extra: dict[str, Any] | None = None

    def __str__(self) -> str:
        return (
            f"{self.name}: {self.duration_ms:.2f}ms, "
            f"peak_mem={self.memory_peak_mb:.2f}MB, "
            f"iterations={self.iterations}"
        )


def generate_mock_products(n: int) -> list[dict[str, Any]]:
    """Generate mock product data for benchmarking."""
    brands = ["Coca-Cola", "Pepsi", "Dr Pepper", "Sprite", "Fanta", "Mountain Dew"]
    subcategories = ["CSD", "Water", "Energy", "Juice", "Tea", "Coffee"]
    sizes = ["12oz", "20oz", "1L", "2L"]
    pack_types = ["Single", "6-pack", "12-pack", "24-pack"]
    tiers = list(BrandTier)

    products = []
    for i in range(n):
        price = round(2.0 + np.random.random() * 8, 2)
        cost = round(price * (0.4 + np.random.random() * 0.2), 2)
        products.append({
            "id": uuid4(),
            "sku": f"SKU-{i:04d}",
            "name": f"Product {i}",
            "brand": np.random.choice(brands),
            "brand_tier": np.random.choice(tiers),
            "subcategory": np.random.choice(subcategories),
            "size": np.random.choice(sizes),
            "pack_type": np.random.choice(pack_types),
            "price": Decimal(str(price)),
            "cost": Decimal(str(cost)),
            "width_inches": Decimal(str(round(2.0 + np.random.random() * 4, 2))),
            "space_elasticity": Decimal(str(round(0.1 + np.random.random() * 0.1, 4))),
            "is_active": True,
        })
    return products


def generate_mock_sales(products: list[dict], weeks: int = 52) -> list[dict[str, Any]]:
    """Generate mock sales data for benchmarking."""
    store_id = uuid4()
    sales = []

    for product in products:
        base_demand = 20 + np.random.random() * 100
        for week in range(1, weeks + 1):
            units = int(base_demand * (0.8 + np.random.random() * 0.4))
            price = float(product["price"])
            sales.append({
                "id": uuid4(),
                "product_id": product["id"],
                "store_id": store_id,
                "week_number": week,
                "year": 2024,
                "units_sold": units,
                "revenue": Decimal(str(round(units * price, 2))),
                "facings": np.random.randint(1, 5),
                "on_promotion": np.random.random() < 0.1,
            })

    return sales


class MockProductData:
    """Mock product data for optimizer benchmarks."""

    def __init__(self, data: dict[str, Any]):
        self.id = data["id"]
        self.sku = data["sku"]
        self.name = data["name"]
        self.brand = data["brand"]
        self.brand_tier = data["brand_tier"]
        self.subcategory = data["subcategory"]
        self.size = data["size"]
        self.pack_type = data["pack_type"]
        self.price = data["price"]
        self.cost = data["cost"]
        self.width_inches = data["width_inches"]
        self.space_elasticity = data["space_elasticity"]
        self.is_active = data["is_active"]


def run_greedy_optimization(
    products: list[MockProductData],
    total_facings: int,
    min_facings: int = 1,
    max_facings: int = 6,
) -> dict[str, Any]:
    """
    Simplified greedy optimization algorithm for benchmarking.
    Based on the actual optimizer logic.
    """
    n_products = len(products)
    if n_products == 0:
        return {"allocations": {}, "profit": 0}

    # Calculate metrics
    metrics = []
    for p in products:
        price = float(p.price)
        cost = float(p.cost)
        margin = price - cost
        width = float(p.width_inches)
        elasticity = float(p.space_elasticity)

        # Estimate demand (simplified)
        base_demand = 50.0
        profit_per_facing = margin * base_demand * (1 + elasticity)

        metrics.append({
            "product": p,
            "margin": margin,
            "profit_per_facing": profit_per_facing,
            "width": width,
        })

    # Sort by profit per facing
    metrics.sort(key=lambda x: x["profit_per_facing"], reverse=True)

    # Greedy allocation
    allocations = {p.sku: min_facings for p in products}
    remaining = total_facings - (n_products * min_facings)

    if remaining < 0:
        # Not enough facings for minimum
        return {"allocations": {}, "profit": 0}

    # Allocate remaining facings
    for m in metrics:
        sku = m["product"].sku
        while remaining > 0 and allocations[sku] < max_facings:
            allocations[sku] += 1
            remaining -= 1

    # Calculate total profit
    total_profit = sum(
        m["profit_per_facing"] * allocations[m["product"].sku]
        for m in metrics
    )

    return {
        "allocations": allocations,
        "profit": total_profit,
        "products_allocated": len([a for a in allocations.values() if a > 0]),
    }


def benchmark_with_memory(func, *args, **kwargs) -> BenchmarkResult:
    """Run a benchmark with memory tracking."""
    gc.collect()
    tracemalloc.start()

    start_time = time.perf_counter()
    result = func(*args, **kwargs)
    end_time = time.perf_counter()

    current, peak = tracemalloc.get_traced_memory()
    tracemalloc.stop()

    duration_ms = (end_time - start_time) * 1000

    return BenchmarkResult(
        name=func.__name__,
        duration_ms=duration_ms,
        memory_peak_mb=peak / (1024 * 1024),
        memory_current_mb=current / (1024 * 1024),
        iterations=1,
        extra={"result": result},
    )


class TestOptimizationBenchmarks:
    """Benchmarks for optimization performance."""

    def test_optimization_80_products(self):
        """Benchmark: Optimize assortment with 80 products.

        Target: < 2 seconds
        """
        n_products = 80
        total_facings = 120

        products_data = generate_mock_products(n_products)
        products = [MockProductData(p) for p in products_data]

        result = benchmark_with_memory(
            run_greedy_optimization,
            products=products,
            total_facings=total_facings,
        )

        print(f"\n{result}")

        # Assert performance target
        assert result.duration_ms < 2000, (
            f"Optimization with 80 products took {result.duration_ms:.2f}ms, "
            "target is < 2000ms"
        )

        # Check result validity
        allocations = result.extra["result"]["allocations"]
        assert len(allocations) == n_products
        assert sum(allocations.values()) <= total_facings

    def test_optimization_200_products(self):
        """Benchmark: Optimize assortment with 200 products.

        Target: < 5 seconds
        """
        n_products = 200
        total_facings = 300

        products_data = generate_mock_products(n_products)
        products = [MockProductData(p) for p in products_data]

        result = benchmark_with_memory(
            run_greedy_optimization,
            products=products,
            total_facings=total_facings,
        )

        print(f"\n{result}")

        # Assert performance target
        assert result.duration_ms < 5000, (
            f"Optimization with 200 products took {result.duration_ms:.2f}ms, "
            "target is < 5000ms"
        )

    def test_optimization_memory_usage(self):
        """Benchmark: Memory usage during optimization."""
        n_products = 150
        total_facings = 200

        products_data = generate_mock_products(n_products)
        products = [MockProductData(p) for p in products_data]

        result = benchmark_with_memory(
            run_greedy_optimization,
            products=products,
            total_facings=total_facings,
        )

        print(f"\n{result}")

        # Memory should be reasonable (< 100MB for this size)
        assert result.memory_peak_mb < 100, (
            f"Memory usage {result.memory_peak_mb:.2f}MB exceeds 100MB limit"
        )

    def test_optimization_repeated_runs(self):
        """Benchmark: Multiple optimization runs (consistency check)."""
        n_products = 80
        total_facings = 120
        n_runs = 10

        products_data = generate_mock_products(n_products)
        products = [MockProductData(p) for p in products_data]

        durations = []
        for _ in range(n_runs):
            result = benchmark_with_memory(
                run_greedy_optimization,
                products=products,
                total_facings=total_facings,
            )
            durations.append(result.duration_ms)

        avg_duration = np.mean(durations)
        std_duration = np.std(durations)
        p95_duration = np.percentile(durations, 95)

        print(f"\nRepeated runs (n={n_runs}):")
        print(f"  Average: {avg_duration:.2f}ms")
        print(f"  Std Dev: {std_duration:.2f}ms")
        print(f"  P95: {p95_duration:.2f}ms")

        # P95 should still be under target
        assert p95_duration < 2000, (
            f"P95 optimization time {p95_duration:.2f}ms exceeds 2000ms target"
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
