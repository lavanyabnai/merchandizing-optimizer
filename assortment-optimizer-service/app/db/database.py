"""Database connection and session management."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from sqlalchemy import MetaData, event, text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Naming convention for constraints (important for migrations)
NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)

    def to_dict(self) -> dict[str, Any]:
        """Convert model instance to dictionary."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# Global engine and session factory (initialized on startup)
_engine: AsyncEngine | None = None
_async_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Get the database engine, creating it if necessary."""
    global _engine

    if _engine is None:
        settings = get_settings()

        _engine = create_async_engine(
            settings.database_url,
            echo=settings.debug,
            # Connection pool settings
            pool_size=settings.database_pool_size,
            max_overflow=settings.database_max_overflow,
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=3600,  # Recycle connections after 1 hour
            pool_timeout=30,  # Timeout for getting connection from pool
            # Performance optimizations
            connect_args={
                "server_settings": {
                    "jit": "off",  # Disable JIT for predictable performance
                    "statement_timeout": "30000",  # 30 second query timeout
                },
                "prepared_statement_cache_size": 100,  # Cache prepared statements
            },
        )

        # Log connection events in debug mode
        if settings.debug:
            @event.listens_for(_engine.sync_engine, "connect")
            def on_connect(dbapi_conn: Any, connection_record: Any) -> None:
                logger.debug("Database connection established")

            @event.listens_for(_engine.sync_engine, "checkout")
            def on_checkout(
                dbapi_conn: Any, connection_record: Any, connection_proxy: Any
            ) -> None:
                logger.debug("Database connection checked out from pool")

    return _engine


def get_pool_status() -> dict[str, Any]:
    """Get connection pool status for monitoring."""
    if _engine is None:
        return {"status": "not_initialized"}

    pool = _engine.pool
    return {
        "status": "active",
        "pool_size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "invalid": pool.invalidatedcount() if hasattr(pool, "invalidatedcount") else 0,
    }


async def is_db_connected() -> bool:
    """Check if database is connected and responsive.

    Performs a simple query to verify database connectivity.
    Used for health checks.

    Returns:
        True if database is connected and responsive, False otherwise.
    """
    if _engine is None:
        return False

    try:
        async with _engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning("Database connectivity check failed", error=str(e))
        return False


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Get the async session factory, creating it if necessary."""
    global _async_session_factory

    if _async_session_factory is None:
        engine = get_engine()
        _async_session_factory = async_sessionmaker(
            bind=engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )

    return _async_session_factory


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session.

    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db_session)):
            ...
    """
    session_factory = get_session_factory()

    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_db_session_context() -> AsyncGenerator[AsyncSession, None]:
    """Context manager for database sessions.

    Usage:
        async with get_db_session_context() as db:
            ...
    """
    session_factory = get_session_factory()

    async with session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database connection and verify connectivity."""
    engine = get_engine()

    try:
        async with engine.begin() as conn:
            # Test connection
            await conn.execute(text("SELECT 1"))
            logger.info("Database connection verified")
    except Exception as e:
        logger.error("Failed to connect to database", error=str(e))
        raise


async def close_db() -> None:
    """Close database connections."""
    global _engine, _async_session_factory

    if _engine is not None:
        await _engine.dispose()
        _engine = None
        _async_session_factory = None
        logger.info("Database connections closed")


async def create_all_tables() -> None:
    """Create all tables (for development/testing only)."""
    engine = get_engine()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("All database tables created")


async def drop_all_tables() -> None:
    """Drop all tables (for development/testing only)."""
    engine = get_engine()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        logger.info("All database tables dropped")
