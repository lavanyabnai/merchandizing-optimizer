"""Dependency injection setup for FastAPI."""

from typing import Annotated, AsyncGenerator

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.core.logging import get_logger
from app.db.database import get_db_session as db_session_generator
from app.db.repository import (
    ClusteringRunRepository,
    OptimizationRunRepository,
    ProductRepository,
    SaleRepository,
    SimulationRunRepository,
    StoreRepository,
    SwitchingMatrixRepository,
)

logger = get_logger(__name__)

# Type aliases for dependency injection
SettingsDep = Annotated[Settings, Depends(get_settings)]


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> dict:
    """Extract and validate the current user from request headers.

    This is a placeholder that will be replaced with actual Clerk JWT
    validation in Session 3.

    Args:
        authorization: Bearer token from Authorization header.
        x_user_id: User ID forwarded from API gateway.

    Returns:
        User information dictionary.

    Raises:
        HTTPException: If authentication fails.
    """
    # For development, allow requests without auth if X-User-Id is provided
    if x_user_id:
        return {"user_id": x_user_id, "authenticated": True}

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check for Bearer token format
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.replace("Bearer ", "")

    # TODO: Implement actual Clerk JWT validation in Session 3
    # For now, just check that a token exists
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Placeholder user - will be replaced with decoded JWT claims
    return {
        "user_id": "dev-user",
        "email": "dev@example.com",
        "authenticated": True,
    }


# Type alias for authenticated user dependency
CurrentUser = Annotated[dict, Depends(get_current_user)]


async def get_optional_user(
    authorization: Annotated[str | None, Header()] = None,
    x_user_id: Annotated[str | None, Header(alias="X-User-Id")] = None,
) -> dict | None:
    """Optionally extract user from request headers.

    Same as get_current_user but returns None instead of raising
    an exception when no auth is provided.

    Args:
        authorization: Bearer token from Authorization header.
        x_user_id: User ID forwarded from API gateway.

    Returns:
        User information dictionary or None.
    """
    if not authorization and not x_user_id:
        return None

    try:
        return await get_current_user(authorization, x_user_id)
    except HTTPException:
        return None


# Type alias for optional user dependency
OptionalUser = Annotated[dict | None, Depends(get_optional_user)]


# Database session dependency
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session.

    Yields an async SQLAlchemy session that is automatically
    committed on success and rolled back on error.
    """
    async for session in db_session_generator():
        yield session


# Type alias for database session dependency
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


# Repository dependencies
async def get_product_repository(
    db: DbSession,
) -> ProductRepository:
    """Get product repository."""
    return ProductRepository(db)


async def get_store_repository(
    db: DbSession,
) -> StoreRepository:
    """Get store repository."""
    return StoreRepository(db)


async def get_sale_repository(
    db: DbSession,
) -> SaleRepository:
    """Get sale repository."""
    return SaleRepository(db)


async def get_switching_matrix_repository(
    db: DbSession,
) -> SwitchingMatrixRepository:
    """Get switching matrix repository."""
    return SwitchingMatrixRepository(db)


async def get_optimization_run_repository(
    db: DbSession,
) -> OptimizationRunRepository:
    """Get optimization run repository."""
    return OptimizationRunRepository(db)


async def get_simulation_run_repository(
    db: DbSession,
) -> SimulationRunRepository:
    """Get simulation run repository."""
    return SimulationRunRepository(db)


async def get_clustering_run_repository(
    db: DbSession,
) -> ClusteringRunRepository:
    """Get clustering run repository."""
    return ClusteringRunRepository(db)


# Type aliases for repository dependencies
ProductRepo = Annotated[ProductRepository, Depends(get_product_repository)]
StoreRepo = Annotated[StoreRepository, Depends(get_store_repository)]
SaleRepo = Annotated[SaleRepository, Depends(get_sale_repository)]
SwitchingMatrixRepo = Annotated[SwitchingMatrixRepository, Depends(get_switching_matrix_repository)]
OptimizationRunRepo = Annotated[OptimizationRunRepository, Depends(get_optimization_run_repository)]
SimulationRunRepo = Annotated[SimulationRunRepository, Depends(get_simulation_run_repository)]
ClusteringRunRepo = Annotated[ClusteringRunRepository, Depends(get_clustering_run_repository)]


# Redis client dependency placeholder
# Will be implemented with caching
async def get_redis_client() -> AsyncGenerator[None, None]:
    """Get Redis client.

    Placeholder that will yield actual Redis client.
    """
    # TODO: Implement actual Redis client management
    yield None
