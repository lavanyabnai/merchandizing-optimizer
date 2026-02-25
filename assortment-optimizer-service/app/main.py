"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config import get_settings
from app.core.cache import close_redis, get_cache_stats, init_redis
from app.core.exceptions import AssortmentOptimizerError
from app.core.logging import clear_log_context, get_logger, log_context, setup_logging
from app.core.metrics import (
    HTTP_REQUEST_DURATION,
    HTTP_REQUESTS_IN_PROGRESS,
    HTTP_REQUESTS_TOTAL,
    set_app_info,
)
from app.core.sentry import capture_exception, init_sentry
from app.db.database import close_db, init_db

# Initialize logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager.

    Handles startup and shutdown events.
    """
    settings = get_settings()
    logger.info(
        "Starting application",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )

    # Startup tasks
    try:
        await init_db()
        logger.info("Database connection initialized")
    except Exception as e:
        logger.error("Failed to initialize database", error=str(e))
        # Continue startup - database may not be required for all endpoints

    # Initialize Redis for caching
    try:
        await init_redis()
        logger.info("Redis cache initialized", stats=get_cache_stats())
    except Exception as e:
        logger.warning("Failed to initialize Redis - caching disabled", error=str(e))

    # Set application info for metrics
    set_app_info(version=settings.app_version, environment=settings.environment)

    # Initialize Sentry for error tracking
    init_sentry()

    yield

    # Shutdown tasks
    logger.info("Shutting down application")
    await close_db()
    await close_redis()


def create_application() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Microservice for retail assortment optimization using MNL demand models and Monte Carlo simulation.",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        openapi_url="/openapi.json" if settings.is_development else None,
        lifespan=lifespan,
    )

    # Add middleware
    configure_middleware(app, settings)

    # Add exception handlers
    configure_exception_handlers(app)

    # Include routers
    app.include_router(api_router)

    return app


def configure_middleware(app: FastAPI, settings: Any) -> None:
    """Configure application middleware."""
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Gzip compression for responses > 1KB
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # Request logging and metrics middleware
    @app.middleware("http")
    async def log_requests_and_metrics(request: Request, call_next: Any) -> Any:
        """Log all incoming requests with context and collect Prometheus metrics."""
        import time
        import uuid

        request_id = str(uuid.uuid4())[:8]
        log_context(request_id=request_id)

        # Normalize path for metrics (remove IDs to prevent high cardinality)
        path = request.url.path
        # Replace UUIDs with placeholder
        import re

        normalized_path = re.sub(
            r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
            "{id}",
            path,
            flags=re.IGNORECASE,
        )

        start_time = time.perf_counter()

        # Track in-progress requests
        HTTP_REQUESTS_IN_PROGRESS.labels(
            method=request.method,
            endpoint=normalized_path,
        ).inc()

        logger.info(
            "Request started",
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client else None,
        )

        try:
            response = await call_next(request)
            duration = time.perf_counter() - start_time
            duration_ms = duration * 1000

            # Record metrics
            HTTP_REQUESTS_TOTAL.labels(
                method=request.method,
                endpoint=normalized_path,
                status_code=str(response.status_code),
            ).inc()

            HTTP_REQUEST_DURATION.labels(
                method=request.method,
                endpoint=normalized_path,
            ).observe(duration)

            logger.info(
                "Request completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
            )

            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as e:
            duration = time.perf_counter() - start_time
            duration_ms = duration * 1000

            # Record error metrics
            HTTP_REQUESTS_TOTAL.labels(
                method=request.method,
                endpoint=normalized_path,
                status_code="500",
            ).inc()

            HTTP_REQUEST_DURATION.labels(
                method=request.method,
                endpoint=normalized_path,
            ).observe(duration)

            logger.error(
                "Request failed",
                method=request.method,
                path=request.url.path,
                error=str(e),
                duration_ms=round(duration_ms, 2),
            )
            raise

        finally:
            # Decrement in-progress counter
            HTTP_REQUESTS_IN_PROGRESS.labels(
                method=request.method,
                endpoint=normalized_path,
            ).dec()
            clear_log_context()


def configure_exception_handlers(app: FastAPI) -> None:
    """Configure global exception handlers."""

    @app.exception_handler(AssortmentOptimizerError)
    async def handle_app_error(
        request: Request,
        exc: AssortmentOptimizerError,
    ) -> JSONResponse:
        """Handle application-specific errors."""
        logger.warning(
            "Application error",
            error_code=exc.code,
            message=exc.message,
            details=exc.details,
        )

        status_map = {
            "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
            "NOT_FOUND": status.HTTP_404_NOT_FOUND,
            "AUTHENTICATION_ERROR": status.HTTP_401_UNAUTHORIZED,
            "AUTHORIZATION_ERROR": status.HTTP_403_FORBIDDEN,
            "DATABASE_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "OPTIMIZATION_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "SIMULATION_ERROR": status.HTTP_500_INTERNAL_SERVER_ERROR,
            "EXTERNAL_SERVICE_ERROR": status.HTTP_502_BAD_GATEWAY,
        }

        return JSONResponse(
            status_code=status_map.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR),
            content={
                "error": {
                    "code": exc.code,
                    "message": exc.message,
                    "details": exc.details,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        """Handle request validation errors with detailed messages."""
        errors = []
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            errors.append({
                "field": field,
                "message": error["msg"],
                "type": error["type"],
            })

        logger.warning(
            "Validation error",
            path=request.url.path,
            errors=errors,
        )

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed",
                    "details": {"errors": errors},
                }
            },
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(
        request: Request,
        exc: Exception,
    ) -> JSONResponse:
        """Handle unexpected errors."""
        logger.exception(
            "Unexpected error",
            path=request.url.path,
            error_type=type(exc).__name__,
            error=str(exc),
        )

        # Capture exception in Sentry
        capture_exception(exc)

        settings = get_settings()
        message = str(exc) if settings.is_development else "An unexpected error occurred"

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "code": "INTERNAL_ERROR",
                    "message": message,
                }
            },
        )


# Create application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
        workers=settings.workers if not settings.is_development else 1,
    )
