"""Pytest configuration and fixtures for integration testing."""

import asyncio
import os
import uuid
from collections.abc import AsyncGenerator, Generator
from datetime import datetime, timezone
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Force override environment variables for testing BEFORE importing app modules
os.environ["ENVIRONMENT"] = "test"
os.environ["DEBUG"] = "false"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["REDIS_URL"] = "redis://localhost:6379/1"
os.environ["CLERK_SECRET_KEY"] = "test_secret_key_for_testing"
os.environ["CLERK_PUBLISHABLE_KEY"] = "pk_test_key"
os.environ["CLERK_JWKS_URL"] = "https://test.clerk.com/.well-known/jwks.json"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"

# Now import app modules
from app.config import get_settings
from app.db.database import Base, get_db_session
from app.db.models import (
    AssortmentProduct,
    AssortmentSale,
    AssortmentStore,
    BrandTier,
    ClusteringRun,
    IncomeIndex,
    LocationType,
    OptimizationRun,
    OptimizationStatus,
    ScenarioType,
    SimulationRun,
    StoreFormat,
)
from app.main import app


# =============================================================================
# Event Loop Configuration
# =============================================================================


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# =============================================================================
# Database Fixtures
# =============================================================================


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    """Create a test database engine with SQLite."""
    # Clear settings cache to use test env vars
    get_settings.cache_clear()

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
        future=True,
    )

    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    session_factory = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with session_factory() as session:
        yield session
        await session.rollback()
        await session.close()


# =============================================================================
# HTTP Client Fixtures
# =============================================================================


@pytest_asyncio.fixture(scope="function")
async def client(db_engine) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client for the FastAPI application."""
    # Clear settings cache
    get_settings.cache_clear()

    # Override the database session dependency
    session_factory = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db_session] = override_get_db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers() -> dict[str, str]:
    """Create mock authentication headers for testing."""
    return {
        "Authorization": "Bearer test-token-valid",
        "X-User-Id": "test-user-123",
    }


@pytest.fixture
def invalid_auth_headers() -> dict[str, str]:
    """Create invalid authentication headers for testing."""
    return {
        "Authorization": "Bearer invalid-token",
    }


# =============================================================================
# Sample Data Fixtures
# =============================================================================


@pytest_asyncio.fixture
async def sample_products(db_session: AsyncSession) -> list[AssortmentProduct]:
    """Create sample products for testing."""
    products = [
        AssortmentProduct(
            id=uuid.uuid4(),
            sku=f"SKU-{i:04d}",
            name=f"Product {i}",
            brand=["Coca-Cola", "Pepsi", "Store Brand", "Red Bull"][i % 4],
            brand_tier=[BrandTier.PREMIUM, BrandTier.NATIONAL_A, BrandTier.STORE_BRAND, BrandTier.PREMIUM][i % 4],
            subcategory=["Soft Drinks", "Juices", "Water", "Energy Drinks"][i % 4],
            size=["12oz", "20oz", "2L"][i % 3],
            pack_type=["Single", "6-pack", "12-pack"][i % 3],
            price=1.99 + (i * 0.5),
            cost=0.99 + (i * 0.25),
            width_inches=2.5 + (i % 3),
            space_elasticity=0.15,
            flavor=f"Flavor {i % 5}" if i % 2 == 0 else None,
            price_tier=["Value", "Mid", "Premium"][i % 3],
            is_active=True,
        )
        for i in range(20)
    ]

    db_session.add_all(products)
    await db_session.commit()

    # Refresh to get IDs
    for p in products:
        await db_session.refresh(p)

    return products


@pytest_asyncio.fixture
async def sample_stores(db_session: AsyncSession) -> list[AssortmentStore]:
    """Create sample stores for testing."""
    stores = [
        AssortmentStore(
            id=uuid.uuid4(),
            store_code=f"S{i:03d}",
            name=f"Store {i}",
            format=[StoreFormat.EXPRESS, StoreFormat.STANDARD, StoreFormat.SUPERSTORE][i % 3],
            location_type=[LocationType.URBAN, LocationType.SUBURBAN, LocationType.RURAL][i % 3],
            income_index=[IncomeIndex.LOW, IncomeIndex.MEDIUM, IncomeIndex.HIGH][i % 3],
            total_facings=100 + (i * 10),
            num_shelves=4,
            shelf_width_inches=48.0,
            weekly_traffic=1000 + (i * 500),
            region=f"Region {i % 5}",
            is_active=True,
        )
        for i in range(10)
    ]

    db_session.add_all(stores)
    await db_session.commit()

    for s in stores:
        await db_session.refresh(s)

    return stores


@pytest_asyncio.fixture
async def sample_sales(
    db_session: AsyncSession,
    sample_products: list[AssortmentProduct],
    sample_stores: list[AssortmentStore],
) -> list[AssortmentSale]:
    """Create sample sales data for testing."""
    import random

    random.seed(42)
    sales = []

    for product in sample_products[:10]:  # First 10 products
        for store in sample_stores[:5]:  # First 5 stores
            for week in range(1, 13):  # 12 weeks
                sale = AssortmentSale(
                    id=uuid.uuid4(),
                    product_id=product.id,
                    store_id=store.id,
                    week_number=week,
                    year=2024,
                    units_sold=random.randint(10, 100),
                    revenue=random.uniform(50, 500),
                    facings=random.randint(1, 5),
                    on_promotion=random.random() > 0.8,
                )
                sales.append(sale)

    db_session.add_all(sales)
    await db_session.commit()

    return sales


@pytest_asyncio.fixture
async def sample_optimization_run(
    db_session: AsyncSession,
    sample_stores: list[AssortmentStore],
) -> OptimizationRun:
    """Create a sample optimization run for testing."""
    run = OptimizationRun(
        id=uuid.uuid4(),
        store_id=sample_stores[0].id,
        status=OptimizationStatus.COMPLETED,
        constraints={
            "total_facings": 100,
            "min_facings_per_sku": 1,
            "max_facings_per_sku": 6,
            "min_skus_per_subcategory": 2,
            "min_skus_per_price_tier": 1,
            "must_carry": [],
            "exclude": [],
        },
        results={
            "profit_lift_pct": 8.5,
            "profit_lift_absolute": 1250.0,
            "product_allocations": [],
            "space_allocations": [],
        },
        profit_lift_pct=8.5,
        profit_lift_absolute=1250.0,
        execution_time_ms=1234,
        user_id="test-user-123",
    )

    db_session.add(run)
    await db_session.commit()
    await db_session.refresh(run)

    return run


@pytest_asyncio.fixture
async def sample_simulation_run(
    db_session: AsyncSession,
    sample_optimization_run: OptimizationRun,
) -> SimulationRun:
    """Create a sample simulation run for testing."""
    run = SimulationRun(
        id=uuid.uuid4(),
        optimization_run_id=sample_optimization_run.id,
        scenario_type=ScenarioType.REMOVE_SKU,
        parameters={"sku": "SKU-0001"},
        num_trials=1000,
        status=OptimizationStatus.COMPLETED,
        results={
            "revenue_mean": 10000.0,
            "revenue_std": 500.0,
            "profit_mean": 2500.0,
            "profit_std": 125.0,
            "probability_positive": 0.85,
        },
        execution_time_ms=567,
        user_id="test-user-123",
    )

    db_session.add(run)
    await db_session.commit()
    await db_session.refresh(run)

    return run


@pytest_asyncio.fixture
async def sample_clustering_run(db_session: AsyncSession) -> ClusteringRun:
    """Create a sample clustering run for testing."""
    run = ClusteringRun(
        id=uuid.uuid4(),
        method="kmeans",
        n_clusters=4,
        features_used=["revenue", "premium_share", "traffic"],
        silhouette_score=0.45,
        status=OptimizationStatus.COMPLETED,
        cluster_assignments={"S001": 0, "S002": 1, "S003": 0, "S004": 2},
        cluster_profiles=[
            {"cluster_id": 0, "avg_revenue": 5000, "store_count": 3},
            {"cluster_id": 1, "avg_revenue": 8000, "store_count": 2},
            {"cluster_id": 2, "avg_revenue": 3000, "store_count": 5},
        ],
        pca_coordinates=[
            {"store_id": "S001", "pc1": 1.5, "pc2": -0.5},
            {"store_id": "S002", "pc1": -1.0, "pc2": 2.0},
        ],
        execution_time_ms=890,
        user_id="test-user-123",
    )

    db_session.add(run)
    await db_session.commit()
    await db_session.refresh(run)

    return run


# =============================================================================
# Helper Fixtures
# =============================================================================


@pytest.fixture
def mock_jwt_payload() -> dict[str, Any]:
    """Create a mock JWT payload."""
    now = datetime.now(timezone.utc)
    return {
        "sub": "user_test123",
        "iat": int(now.timestamp()),
        "exp": int(now.timestamp()) + 3600,
        "iss": "https://test.clerk.com",
        "azp": "test_client_id",
    }


@pytest.fixture
def expired_jwt_payload(mock_jwt_payload: dict[str, Any]) -> dict[str, Any]:
    """Create an expired JWT payload."""
    expired = mock_jwt_payload.copy()
    expired["exp"] = expired["iat"] - 3600  # Expired 1 hour ago
    return expired


# =============================================================================
# Test Data Helpers
# =============================================================================


def create_test_product_data(count: int = 1) -> list[dict]:
    """Create test product data for import testing."""
    return [
        {
            "sku": f"TEST-SKU-{i:04d}",
            "name": f"Test Product {i}",
            "brand": "Test Brand",
            "brand_tier": "National A",
            "subcategory": "Soft Drinks",
            "size": "12oz",
            "pack_type": "Single",
            "price": 2.99,
            "cost": 1.50,
            "width_inches": 3.0,
            "space_elasticity": 0.15,
        }
        for i in range(count)
    ]


def create_test_store_data(count: int = 1) -> list[dict]:
    """Create test store data for import testing."""
    return [
        {
            "store_code": f"TEST-S{i:03d}",
            "name": f"Test Store {i}",
            "format": "Standard",
            "location_type": "Urban",
            "income_index": "Medium",
            "total_facings": 120,
            "weekly_traffic": 3000,
            "num_shelves": 4,
            "shelf_width_inches": 48.0,
        }
        for i in range(count)
    ]


def create_test_sale_data(skus: list[str], store_codes: list[str]) -> list[dict]:
    """Create test sales data for import testing."""
    sales = []
    for sku in skus:
        for store_code in store_codes:
            sales.append({
                "sku": sku,
                "store_code": store_code,
                "week_number": 1,
                "year": 2024,
                "units_sold": 50,
                "revenue": 150.0,
                "facings": 2,
                "on_promotion": False,
            })
    return sales
