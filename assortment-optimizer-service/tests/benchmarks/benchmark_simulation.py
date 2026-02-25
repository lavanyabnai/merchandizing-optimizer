"""
Performance benchmarks for the simulation service.

Run with: pytest tests/benchmarks/benchmark_simulation.py -v --benchmark-enable

Performance targets:
- Simulation (1000 trials): < 1 second
- Simulation (5000 trials): < 5 seconds
- Simulation (10000 trials): < 10 seconds
"""

import gc
import time
import tracemalloc
from dataclasses import dataclass
from typing import Any

import numpy as np
import pytest


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


def generate_simulation_data(n_products: int) -> dict[str, Any]:
    """Generate mock simulation data."""
    return {
        "base_demand": np.random.uniform(20, 150, n_products),
        "prices": np.random.uniform(2, 12, n_products),
        "margins": np.random.uniform(1, 5, n_products),
        "substitution_matrix": np.random.dirichlet(
            np.ones(n_products), size=n_products
        ),
    }


def run_vectorized_simulation(
    data: dict[str, Any],
    n_trials: int,
    demand_cv: float = 0.15,
    walk_rate_mean: float = 0.15,
    walk_rate_std: float = 0.05,
    removed_indices: list[int] | None = None,
) -> dict[str, Any]:
    """
    Run vectorized Monte Carlo simulation.
    Based on the actual simulation logic but simplified for benchmarking.
    """
    rng = np.random.default_rng(42)
    n_products = len(data["base_demand"])

    # Pre-sample all random values (vectorized)
    demand_noise = rng.normal(1.0, demand_cv, (n_trials, n_products))
    demand_noise = np.maximum(demand_noise, 0)
    walk_rates = np.clip(
        rng.normal(walk_rate_mean, walk_rate_std, n_trials),
        0.01, 0.30
    )

    base_demand = data["base_demand"]
    prices = data["prices"]
    margins = data["margins"]
    sub_matrix = data["substitution_matrix"]

    # Prepare masks for removed products
    if removed_indices:
        removed_mask = np.zeros(n_products, dtype=bool)
        removed_mask[removed_indices] = True
        remaining_mask = ~removed_mask

        # Pre-compute substitution probabilities
        sub_probs = sub_matrix[removed_indices][:, remaining_mask]
        sub_probs_sum = sub_probs.sum(axis=1, keepdims=True)
        sub_probs_sum[sub_probs_sum == 0] = 1
        sub_probs = sub_probs / sub_probs_sum
    else:
        removed_mask = None
        remaining_mask = np.ones(n_products, dtype=bool)

    # Vectorized simulation
    revenue_trials = np.zeros(n_trials)
    profit_trials = np.zeros(n_trials)

    for trial in range(n_trials):
        trial_demand = base_demand * demand_noise[trial]
        walk_rate = walk_rates[trial]

        # Handle removed SKUs
        if removed_mask is not None:
            for i, idx in enumerate(removed_indices):
                removed_demand = trial_demand[idx]
                walked = removed_demand * walk_rate
                transfer = removed_demand - walked
                trial_demand[remaining_mask] += transfer * sub_probs[i]
                trial_demand[idx] = 0

        revenue_trials[trial] = (trial_demand * prices).sum()
        profit_trials[trial] = (trial_demand * margins).sum()

    # Calculate statistics
    return {
        "revenue_mean": float(revenue_trials.mean()),
        "revenue_std": float(revenue_trials.std()),
        "profit_mean": float(profit_trials.mean()),
        "profit_std": float(profit_trials.std()),
        "revenue_p5": float(np.percentile(revenue_trials, 5)),
        "revenue_p95": float(np.percentile(revenue_trials, 95)),
        "profit_p5": float(np.percentile(profit_trials, 5)),
        "profit_p95": float(np.percentile(profit_trials, 95)),
    }


def run_fully_vectorized_simulation(
    data: dict[str, Any],
    n_trials: int,
    demand_cv: float = 0.15,
) -> dict[str, Any]:
    """
    Fully vectorized simulation without per-trial loop.
    Even more optimized version.
    """
    rng = np.random.default_rng(42)
    n_products = len(data["base_demand"])

    # Generate all noise at once
    demand_noise = rng.normal(1.0, demand_cv, (n_trials, n_products))
    demand_noise = np.maximum(demand_noise, 0)

    # Broadcast base demand
    base_demand = data["base_demand"]
    prices = data["prices"]
    margins = data["margins"]

    # All trials at once
    trial_demands = base_demand * demand_noise  # (n_trials, n_products)

    # Calculate revenue and profit for all trials
    revenue_trials = (trial_demands * prices).sum(axis=1)
    profit_trials = (trial_demands * margins).sum(axis=1)

    return {
        "revenue_mean": float(revenue_trials.mean()),
        "revenue_std": float(revenue_trials.std()),
        "profit_mean": float(profit_trials.mean()),
        "profit_std": float(profit_trials.std()),
        "revenue_p5": float(np.percentile(revenue_trials, 5)),
        "revenue_p95": float(np.percentile(revenue_trials, 95)),
        "profit_p5": float(np.percentile(profit_trials, 5)),
        "profit_p95": float(np.percentile(profit_trials, 95)),
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


class TestSimulationBenchmarks:
    """Benchmarks for simulation performance."""

    @pytest.fixture
    def simulation_data_80(self):
        """Generate simulation data for 80 products."""
        return generate_simulation_data(80)

    @pytest.fixture
    def simulation_data_150(self):
        """Generate simulation data for 150 products."""
        return generate_simulation_data(150)

    def test_simulation_1000_trials(self, simulation_data_80):
        """Benchmark: 1000 Monte Carlo trials.

        Target: < 1 second
        """
        n_trials = 1000

        result = benchmark_with_memory(
            run_vectorized_simulation,
            data=simulation_data_80,
            n_trials=n_trials,
            removed_indices=[0, 1, 2],  # Remove 3 products
        )

        print(f"\n{result}")

        assert result.duration_ms < 1000, (
            f"Simulation with 1000 trials took {result.duration_ms:.2f}ms, "
            "target is < 1000ms"
        )

    def test_simulation_5000_trials(self, simulation_data_80):
        """Benchmark: 5000 Monte Carlo trials.

        Target: < 5 seconds
        """
        n_trials = 5000

        result = benchmark_with_memory(
            run_vectorized_simulation,
            data=simulation_data_80,
            n_trials=n_trials,
            removed_indices=[0, 1, 2, 3, 4],
        )

        print(f"\n{result}")

        assert result.duration_ms < 5000, (
            f"Simulation with 5000 trials took {result.duration_ms:.2f}ms, "
            "target is < 5000ms"
        )

    def test_simulation_10000_trials(self, simulation_data_80):
        """Benchmark: 10000 Monte Carlo trials.

        Target: < 10 seconds
        """
        n_trials = 10000

        result = benchmark_with_memory(
            run_vectorized_simulation,
            data=simulation_data_80,
            n_trials=n_trials,
            removed_indices=[0, 1, 2],
        )

        print(f"\n{result}")

        assert result.duration_ms < 10000, (
            f"Simulation with 10000 trials took {result.duration_ms:.2f}ms, "
            "target is < 10000ms"
        )

    def test_fully_vectorized_simulation(self, simulation_data_80):
        """Benchmark: Fully vectorized simulation (baseline, no SKU removal)."""
        n_trials = 5000

        result = benchmark_with_memory(
            run_fully_vectorized_simulation,
            data=simulation_data_80,
            n_trials=n_trials,
        )

        print(f"\n{result}")

        # This should be even faster than the loop version
        assert result.duration_ms < 500, (
            f"Fully vectorized simulation took {result.duration_ms:.2f}ms, "
            "expected < 500ms"
        )

    def test_simulation_memory_usage(self, simulation_data_150):
        """Benchmark: Memory usage during simulation."""
        n_trials = 10000

        result = benchmark_with_memory(
            run_vectorized_simulation,
            data=simulation_data_150,
            n_trials=n_trials,
            removed_indices=list(range(10)),  # Remove 10 products
        )

        print(f"\n{result}")

        # Memory should be reasonable (< 500MB for this size)
        assert result.memory_peak_mb < 500, (
            f"Memory usage {result.memory_peak_mb:.2f}MB exceeds 500MB limit"
        )

    def test_simulation_scaling(self, simulation_data_80):
        """Benchmark: Test how simulation scales with trial count."""
        trial_counts = [1000, 2000, 5000, 10000]
        results = []

        for n_trials in trial_counts:
            result = benchmark_with_memory(
                run_vectorized_simulation,
                data=simulation_data_80,
                n_trials=n_trials,
                removed_indices=[0, 1],
            )
            results.append((n_trials, result.duration_ms))

        print("\nScaling results:")
        for trials, duration in results:
            throughput = trials / (duration / 1000)  # trials per second
            print(f"  {trials} trials: {duration:.2f}ms ({throughput:.0f} trials/sec)")

        # Check that scaling is roughly linear (not worse than O(n))
        # Ratio of time for 10000/1000 should be < 15 (allowing some overhead)
        ratio = results[-1][1] / results[0][1]
        expected_ratio = results[-1][0] / results[0][0]

        assert ratio < expected_ratio * 1.5, (
            f"Scaling is worse than expected: {ratio:.1f}x for {expected_ratio}x trials"
        )

    def test_simulation_repeated_runs_consistency(self, simulation_data_80):
        """Benchmark: Verify consistent results across runs."""
        n_trials = 5000
        n_runs = 5

        durations = []
        results_stats = []

        for _ in range(n_runs):
            result = benchmark_with_memory(
                run_vectorized_simulation,
                data=simulation_data_80,
                n_trials=n_trials,
                removed_indices=[0, 1, 2],
            )
            durations.append(result.duration_ms)
            results_stats.append(result.extra["result"]["profit_mean"])

        avg_duration = np.mean(durations)
        std_duration = np.std(durations)
        p95_duration = np.percentile(durations, 95)

        print(f"\nRepeated runs (n={n_runs}):")
        print(f"  Average: {avg_duration:.2f}ms")
        print(f"  Std Dev: {std_duration:.2f}ms")
        print(f"  P95: {p95_duration:.2f}ms")
        print(f"  Result consistency: {np.std(results_stats):.4f}")

        # P95 should still be under target
        assert p95_duration < 5000, (
            f"P95 simulation time {p95_duration:.2f}ms exceeds 5000ms target"
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
