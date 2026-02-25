"""Prometheus metrics for performance monitoring.

This module provides Prometheus-compatible metrics for:
- HTTP request duration and counts
- Cache hit/miss rates
- Database connection pool stats
- Optimization and simulation execution times
"""

import time
from collections.abc import Callable
from functools import wraps
from typing import Any, ParamSpec, TypeVar

from prometheus_client import Counter, Gauge, Histogram, Info, generate_latest

from app.core.logging import get_logger

logger = get_logger(__name__)

P = ParamSpec("P")
T = TypeVar("T")

# =============================================================================
# Application Info
# =============================================================================

APP_INFO = Info(
    "assortment_optimizer",
    "Assortment Optimizer application information",
)

# =============================================================================
# HTTP Request Metrics
# =============================================================================

HTTP_REQUESTS_TOTAL = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status_code"],
)

HTTP_REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

HTTP_REQUESTS_IN_PROGRESS = Gauge(
    "http_requests_in_progress",
    "Number of HTTP requests currently being processed",
    ["method", "endpoint"],
)

# =============================================================================
# Cache Metrics
# =============================================================================

CACHE_HITS_TOTAL = Counter(
    "cache_hits_total",
    "Total number of cache hits",
    ["cache_type"],
)

CACHE_MISSES_TOTAL = Counter(
    "cache_misses_total",
    "Total number of cache misses",
    ["cache_type"],
)

CACHE_ERRORS_TOTAL = Counter(
    "cache_errors_total",
    "Total number of cache errors",
    ["cache_type", "error_type"],
)

CACHE_SIZE_BYTES = Gauge(
    "cache_size_bytes",
    "Current size of cache in bytes",
    ["cache_type"],
)

# =============================================================================
# Database Metrics
# =============================================================================

DB_POOL_SIZE = Gauge(
    "db_pool_size",
    "Database connection pool size",
)

DB_POOL_CHECKED_IN = Gauge(
    "db_pool_checked_in",
    "Database connections checked into pool",
)

DB_POOL_CHECKED_OUT = Gauge(
    "db_pool_checked_out",
    "Database connections checked out of pool",
)

DB_POOL_OVERFLOW = Gauge(
    "db_pool_overflow",
    "Database connection pool overflow count",
)

DB_QUERY_DURATION = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["query_type"],
    buckets=[0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5],
)

# =============================================================================
# Optimization Metrics
# =============================================================================

OPTIMIZATION_RUNS_TOTAL = Counter(
    "optimization_runs_total",
    "Total number of optimization runs",
    ["status"],
)

OPTIMIZATION_DURATION = Histogram(
    "optimization_duration_seconds",
    "Optimization execution time in seconds",
    ["product_count_bucket"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0],
)

OPTIMIZATION_PRODUCTS = Histogram(
    "optimization_products",
    "Number of products in optimization",
    buckets=[10, 25, 50, 80, 100, 150, 200, 300, 500],
)

OPTIMIZATION_PROFIT_LIFT = Histogram(
    "optimization_profit_lift_pct",
    "Profit lift percentage from optimization",
    buckets=[-10, -5, 0, 2, 5, 10, 15, 20, 30, 50],
)

# =============================================================================
# Simulation Metrics
# =============================================================================

SIMULATION_RUNS_TOTAL = Counter(
    "simulation_runs_total",
    "Total number of simulation runs",
    ["scenario_type", "status"],
)

SIMULATION_DURATION = Histogram(
    "simulation_duration_seconds",
    "Simulation execution time in seconds",
    ["scenario_type"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0],
)

SIMULATION_TRIALS = Histogram(
    "simulation_trials",
    "Number of trials in simulation",
    buckets=[100, 500, 1000, 2000, 5000, 10000, 20000],
)

# =============================================================================
# Clustering Metrics
# =============================================================================

CLUSTERING_RUNS_TOTAL = Counter(
    "clustering_runs_total",
    "Total number of clustering runs",
    ["method", "status"],
)

CLUSTERING_DURATION = Histogram(
    "clustering_duration_seconds",
    "Clustering execution time in seconds",
    ["method"],
    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0],
)

CLUSTERING_SILHOUETTE = Histogram(
    "clustering_silhouette_score",
    "Clustering silhouette score",
    buckets=[-0.5, 0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
)

# =============================================================================
# Helper Functions
# =============================================================================


def set_app_info(version: str, environment: str) -> None:
    """Set application info metric."""
    APP_INFO.info({
        "version": version,
        "environment": environment,
    })


def update_db_pool_metrics(pool_status: dict[str, Any]) -> None:
    """Update database pool metrics from pool status dict."""
    if pool_status.get("status") == "active":
        DB_POOL_SIZE.set(pool_status.get("pool_size", 0))
        DB_POOL_CHECKED_IN.set(pool_status.get("checked_in", 0))
        DB_POOL_CHECKED_OUT.set(pool_status.get("checked_out", 0))
        DB_POOL_OVERFLOW.set(pool_status.get("overflow", 0))


def record_cache_hit(cache_type: str = "redis") -> None:
    """Record a cache hit."""
    CACHE_HITS_TOTAL.labels(cache_type=cache_type).inc()


def record_cache_miss(cache_type: str = "redis") -> None:
    """Record a cache miss."""
    CACHE_MISSES_TOTAL.labels(cache_type=cache_type).inc()


def record_cache_error(error_type: str, cache_type: str = "redis") -> None:
    """Record a cache error."""
    CACHE_ERRORS_TOTAL.labels(cache_type=cache_type, error_type=error_type).inc()


def record_optimization(
    status: str,
    duration_seconds: float,
    product_count: int,
    profit_lift_pct: float | None = None,
) -> None:
    """Record optimization metrics."""
    OPTIMIZATION_RUNS_TOTAL.labels(status=status).inc()

    # Bucket product count for duration metric
    if product_count <= 50:
        bucket = "small"
    elif product_count <= 100:
        bucket = "medium"
    else:
        bucket = "large"

    OPTIMIZATION_DURATION.labels(product_count_bucket=bucket).observe(duration_seconds)
    OPTIMIZATION_PRODUCTS.observe(product_count)

    if profit_lift_pct is not None:
        OPTIMIZATION_PROFIT_LIFT.observe(profit_lift_pct)


def record_simulation(
    scenario_type: str,
    status: str,
    duration_seconds: float,
    num_trials: int,
) -> None:
    """Record simulation metrics."""
    SIMULATION_RUNS_TOTAL.labels(scenario_type=scenario_type, status=status).inc()
    SIMULATION_DURATION.labels(scenario_type=scenario_type).observe(duration_seconds)
    SIMULATION_TRIALS.observe(num_trials)


def record_clustering(
    method: str,
    status: str,
    duration_seconds: float,
    silhouette_score: float | None = None,
) -> None:
    """Record clustering metrics."""
    CLUSTERING_RUNS_TOTAL.labels(method=method, status=status).inc()
    CLUSTERING_DURATION.labels(method=method).observe(duration_seconds)

    if silhouette_score is not None:
        CLUSTERING_SILHOUETTE.observe(silhouette_score)


# =============================================================================
# Decorator for Timing
# =============================================================================


def timed_operation(
    metric: Histogram,
    labels: dict[str, str] | None = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to time function execution and record to histogram.

    Args:
        metric: Histogram metric to record to.
        labels: Optional dict of label values.

    Example:
        @timed_operation(DB_QUERY_DURATION, {"query_type": "select"})
        async def get_products():
            ...
    """

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @wraps(func)
        async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            start = time.perf_counter()
            try:
                return await func(*args, **kwargs)
            finally:
                duration = time.perf_counter() - start
                if labels:
                    metric.labels(**labels).observe(duration)
                else:
                    metric.observe(duration)

        @wraps(func)
        def sync_wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            start = time.perf_counter()
            try:
                return func(*args, **kwargs)
            finally:
                duration = time.perf_counter() - start
                if labels:
                    metric.labels(**labels).observe(duration)
                else:
                    metric.observe(duration)

        # Return appropriate wrapper based on function type
        import asyncio

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# =============================================================================
# Metrics Endpoint
# =============================================================================


def get_metrics() -> bytes:
    """Get Prometheus metrics in exposition format."""
    return generate_latest()
