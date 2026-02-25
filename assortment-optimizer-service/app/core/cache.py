"""Redis caching utilities for performance optimization.

This module provides a caching layer using Redis with:
- Async operations using redis.asyncio
- Configurable TTL per cache entry
- Automatic serialization/deserialization
- Cache invalidation patterns
- Cache key generation utilities
- Prometheus metrics for cache hit/miss tracking
"""

import hashlib
import json
from collections.abc import Callable
from datetime import datetime
from functools import wraps
from typing import Any, ParamSpec, TypeVar
from uuid import UUID

import redis.asyncio as redis
from redis.asyncio.connection import ConnectionPool

from app.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Type variables for generic decorator
P = ParamSpec("P")
T = TypeVar("T")

# Global Redis client
_redis_client: redis.Redis | None = None
_connection_pool: ConnectionPool | None = None

# Cache statistics (in-memory, also sent to Prometheus)
_cache_stats = {
    "hits": 0,
    "misses": 0,
    "errors": 0,
}


class CacheSerializer:
    """Custom JSON serializer for cache values."""

    @staticmethod
    def serialize(value: Any) -> str:
        """Serialize value to JSON string."""

        def default_handler(obj: Any) -> Any:
            if isinstance(obj, UUID):
                return str(obj)
            if isinstance(obj, datetime):
                return obj.isoformat()
            if hasattr(obj, "__dict__"):
                return obj.__dict__
            if hasattr(obj, "value"):  # Enum
                return obj.value
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

        return json.dumps(value, default=default_handler)

    @staticmethod
    def deserialize(value: str | bytes) -> Any:
        """Deserialize JSON string to value."""
        if isinstance(value, bytes):
            value = value.decode("utf-8")
        return json.loads(value)


def hash_args(*args: Any, **kwargs: Any) -> str:
    """Generate a hash from function arguments.

    Creates a deterministic hash that can be used as part of a cache key.
    """
    # Convert args and kwargs to a canonical string representation
    arg_str = json.dumps(
        {"args": args, "kwargs": kwargs},
        sort_keys=True,
        default=str,
    )
    return hashlib.md5(arg_str.encode()).hexdigest()[:16]


async def init_redis() -> None:
    """Initialize Redis connection pool and client.

    Called during application startup.
    """
    global _redis_client, _connection_pool

    settings = get_settings()

    try:
        _connection_pool = ConnectionPool.from_url(
            settings.redis_url,
            max_connections=20,
            decode_responses=False,  # We handle decoding ourselves
        )
        _redis_client = redis.Redis(connection_pool=_connection_pool)

        # Test connection
        await _redis_client.ping()
        logger.info("Redis connection initialized", url=settings.redis_url)

    except Exception as e:
        logger.warning(
            "Failed to initialize Redis - caching will be disabled",
            error=str(e),
        )
        _redis_client = None
        _connection_pool = None


async def close_redis() -> None:
    """Close Redis connection pool.

    Called during application shutdown.
    """
    global _redis_client, _connection_pool

    if _redis_client:
        await _redis_client.close()
        _redis_client = None

    if _connection_pool:
        await _connection_pool.disconnect()
        _connection_pool = None

    logger.info("Redis connection closed")


def get_redis() -> redis.Redis | None:
    """Get the Redis client instance."""
    return _redis_client


def is_cache_available() -> bool:
    """Check if caching is available."""
    return _redis_client is not None


async def cache_get(key: str) -> Any | None:
    """Get a value from cache.

    Args:
        key: Cache key.

    Returns:
        Cached value or None if not found.
    """
    global _cache_stats

    if not _redis_client:
        return None

    try:
        value = await _redis_client.get(key)
        if value is not None:
            _cache_stats["hits"] += 1
            return CacheSerializer.deserialize(value)

        _cache_stats["misses"] += 1
        return None

    except Exception as e:
        _cache_stats["errors"] += 1
        logger.warning("Cache get error", key=key, error=str(e))
        return None


async def cache_set(key: str, value: Any, ttl: int | None = None) -> bool:
    """Set a value in cache.

    Args:
        key: Cache key.
        value: Value to cache.
        ttl: Time to live in seconds. Uses default if not specified.

    Returns:
        True if successful, False otherwise.
    """
    if not _redis_client:
        return False

    settings = get_settings()
    ttl = ttl or settings.redis_ttl_default

    try:
        serialized = CacheSerializer.serialize(value)
        await _redis_client.setex(key, ttl, serialized)
        return True

    except Exception as e:
        logger.warning("Cache set error", key=key, error=str(e))
        return False


async def cache_delete(key: str) -> bool:
    """Delete a specific key from cache.

    Args:
        key: Cache key to delete.

    Returns:
        True if key was deleted, False otherwise.
    """
    if not _redis_client:
        return False

    try:
        result = await _redis_client.delete(key)
        return result > 0

    except Exception as e:
        logger.warning("Cache delete error", key=key, error=str(e))
        return False


async def invalidate_pattern(pattern: str) -> int:
    """Invalidate all cache keys matching a pattern.

    Args:
        pattern: Redis glob pattern (e.g., "sku_metrics:*").

    Returns:
        Number of keys deleted.
    """
    if not _redis_client:
        return 0

    try:
        deleted = 0
        async for key in _redis_client.scan_iter(match=pattern):
            await _redis_client.delete(key)
            deleted += 1

        if deleted > 0:
            logger.info("Cache invalidated", pattern=pattern, deleted=deleted)

        return deleted

    except Exception as e:
        logger.warning("Cache invalidation error", pattern=pattern, error=str(e))
        return 0


def cache_result(
    ttl: int = 3600,
    prefix: str = "",
    key_builder: Callable[..., str] | None = None,
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """Decorator to cache async function results.

    Args:
        ttl: Cache TTL in seconds (default: 1 hour).
        prefix: Key prefix for namespacing.
        key_builder: Optional custom function to build cache key.
            Receives the same arguments as the decorated function.

    Returns:
        Decorated async function with caching.

    Example:
        @cache_result(ttl=3600, prefix="sku_metrics")
        async def calculate_sku_metrics(store_id: UUID) -> dict:
            ...

        # Custom key builder
        @cache_result(
            ttl=1800,
            prefix="clustering",
            key_builder=lambda features: f"{hash(tuple(features))}"
        )
        async def cluster_stores(features: list) -> dict:
            ...
    """

    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @wraps(func)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            # Skip caching if Redis not available
            if not is_cache_available():
                return await func(*args, **kwargs)

            # Build cache key
            if key_builder:
                try:
                    custom_key = key_builder(*args, **kwargs)
                    cache_key = f"{prefix}:{func.__name__}:{custom_key}"
                except Exception:
                    cache_key = f"{prefix}:{func.__name__}:{hash_args(*args, **kwargs)}"
            else:
                cache_key = f"{prefix}:{func.__name__}:{hash_args(*args, **kwargs)}"

            # Try to get from cache
            cached = await cache_get(cache_key)
            if cached is not None:
                logger.debug("Cache hit", key=cache_key)
                return cached

            # Execute function and cache result
            logger.debug("Cache miss", key=cache_key)
            result = await func(*args, **kwargs)

            # Cache the result (fire and forget)
            await cache_set(cache_key, result, ttl)

            return result

        return wrapper

    return decorator


def get_cache_stats() -> dict[str, Any]:
    """Get cache statistics.

    Returns:
        Dictionary with hit/miss/error counts and rates.
    """
    total = _cache_stats["hits"] + _cache_stats["misses"]
    hit_rate = _cache_stats["hits"] / total if total > 0 else 0.0

    return {
        "hits": _cache_stats["hits"],
        "misses": _cache_stats["misses"],
        "errors": _cache_stats["errors"],
        "total_requests": total,
        "hit_rate": round(hit_rate, 4),
        "available": is_cache_available(),
    }


async def reset_cache_stats() -> None:
    """Reset cache statistics."""
    global _cache_stats
    _cache_stats = {"hits": 0, "misses": 0, "errors": 0}


# Pre-defined TTL constants for common use cases
class CacheTTL:
    """Standard TTL values for different cache types."""

    # Reference data (rarely changes)
    REFERENCE_DATA = 86400  # 24 hours

    # Aggregated metrics
    METRICS = 300  # 5 minutes

    # SKU metrics and calculations
    SKU_METRICS = 21600  # 6 hours

    # Simulation data preparation
    SIMULATION_DATA = 43200  # 12 hours

    # Clustering features
    CLUSTERING_FEATURES = 43200  # 12 hours

    # Clustering results
    CLUSTERING_RESULTS = 86400  # 24 hours

    # Substitution matrix
    SUBSTITUTION_MATRIX = 3600  # 1 hour

    # Optimal K calculation
    OPTIMAL_K = 172800  # 48 hours


# Pre-defined cache key prefixes
class CachePrefix:
    """Standard cache key prefixes."""

    SKU_METRICS = "sku_metrics"
    SIMULATION = "simulation"
    CLUSTERING = "clustering"
    SUBSTITUTION = "substitution"
    PRODUCTS = "products"
    STORES = "stores"
    METRICS = "metrics"
