"""Health check endpoints."""

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from fastapi import APIRouter, Depends, Response, status
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.core.cache import get_cache_stats, get_redis, is_cache_available
from app.core.logging import get_logger
from app.core.metrics import get_metrics, set_app_info, update_db_pool_metrics
from app.db.database import get_pool_status, is_db_connected

logger = get_logger(__name__)
router = APIRouter()


class HealthStatus(str, Enum):
    """Health status enumeration."""

    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"


class DependencyStatus(str, Enum):
    """Dependency connection status."""

    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    DEGRADED = "degraded"


class HealthResponse(BaseModel):
    """Health check response model."""

    status: HealthStatus
    service: str
    version: str
    timestamp: str
    environment: str
    checks: dict[str, Any] | None = None


class DependencyCheck(BaseModel):
    """Individual dependency health check result."""

    status: DependencyStatus
    latency_ms: float | None = None
    message: str | None = None


class DetailedHealthResponse(HealthResponse):
    """Detailed health check response with dependency status."""

    database: DependencyCheck
    redis: DependencyCheck
    uptime_seconds: float | None = None


# Track service start time for uptime
_start_time = datetime.now(timezone.utc)


async def check_database_health() -> DependencyCheck:
    """Check database connectivity and latency."""
    import time

    start = time.perf_counter()

    try:
        if await is_db_connected():
            latency_ms = (time.perf_counter() - start) * 1000
            return DependencyCheck(
                status=DependencyStatus.CONNECTED,
                latency_ms=round(latency_ms, 2),
            )
        return DependencyCheck(
            status=DependencyStatus.DISCONNECTED,
            message="Database connection not available",
        )
    except Exception as e:
        logger.warning("Database health check failed", error=str(e))
        return DependencyCheck(
            status=DependencyStatus.DISCONNECTED,
            message=str(e),
        )


async def check_redis_health() -> DependencyCheck:
    """Check Redis connectivity and latency."""
    import time

    start = time.perf_counter()

    try:
        redis_client = get_redis()
        if redis_client is None:
            return DependencyCheck(
                status=DependencyStatus.DISCONNECTED,
                message="Redis client not initialized",
            )

        await redis_client.ping()
        latency_ms = (time.perf_counter() - start) * 1000

        return DependencyCheck(
            status=DependencyStatus.CONNECTED,
            latency_ms=round(latency_ms, 2),
        )
    except Exception as e:
        logger.warning("Redis health check failed", error=str(e))
        return DependencyCheck(
            status=DependencyStatus.DISCONNECTED,
            message=str(e),
        )


def determine_overall_status(
    db_check: DependencyCheck,
    redis_check: DependencyCheck,
) -> HealthStatus:
    """Determine overall health status based on dependency checks."""
    # Database is critical - if disconnected, service is unhealthy
    if db_check.status == DependencyStatus.DISCONNECTED:
        return HealthStatus.UNHEALTHY

    # Redis is optional - if disconnected, service is degraded
    if redis_check.status == DependencyStatus.DISCONNECTED:
        return HealthStatus.DEGRADED

    return HealthStatus.HEALTHY


@router.get("/health", response_model=HealthResponse)
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Basic health check endpoint.

    Returns the service status, name, and version.
    Used for simple availability checks.
    """
    return HealthResponse(
        status=HealthStatus.HEALTHY,
        service="assortment-optimizer",
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc).isoformat(),
        environment=settings.environment,
    )


@router.get(
    "/health/ready",
    response_model=DetailedHealthResponse,
    responses={
        200: {"description": "Service is ready to accept traffic"},
        503: {"description": "Service is not ready"},
    },
)
async def readiness_check(
    response: Response,
    settings: Settings = Depends(get_settings),
) -> DetailedHealthResponse:
    """Readiness check with dependency health status.

    Checks database and Redis connectivity.
    Used by orchestrators to determine if the service can accept traffic.

    Returns:
        - 200: Service is healthy and ready
        - 503: Service is unhealthy or dependencies are unavailable
    """
    # Check dependencies
    db_check = await check_database_health()
    redis_check = await check_redis_health()

    # Determine overall status
    overall_status = determine_overall_status(db_check, redis_check)

    # Calculate uptime
    uptime = (datetime.now(timezone.utc) - _start_time).total_seconds()

    # Set response status code based on health
    if overall_status == HealthStatus.UNHEALTHY:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return DetailedHealthResponse(
        status=overall_status,
        service="assortment-optimizer",
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc).isoformat(),
        environment=settings.environment,
        database=db_check,
        redis=redis_check,
        uptime_seconds=round(uptime, 2),
    )


@router.get("/health/live")
async def liveness_check() -> dict[str, str]:
    """Liveness check endpoint.

    Simple check to verify the service is running.
    Used by orchestrators to determine if the service needs to be restarted.
    """
    return {"status": "alive"}


@router.get("/metrics")
async def metrics_endpoint(settings: Settings = Depends(get_settings)) -> Response:
    """Prometheus metrics endpoint.

    Returns metrics in Prometheus exposition format for scraping.
    """
    # Update app info
    set_app_info(version=settings.app_version, environment=settings.environment)

    # Update database pool metrics
    pool_status = get_pool_status()
    update_db_pool_metrics(pool_status)

    # Get metrics
    metrics_data = get_metrics()

    return Response(
        content=metrics_data,
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


@router.get("/stats")
async def stats_endpoint(
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    """Internal stats endpoint for debugging.

    Returns cache stats, pool status, and other internal metrics.
    """
    return {
        "service": "assortment-optimizer",
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cache": {
            "available": is_cache_available(),
            "stats": get_cache_stats(),
        },
        "database": {
            "pool": get_pool_status(),
        },
    }
