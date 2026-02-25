"""Database module."""

from app.db.database import (
    Base,
    close_db,
    create_all_tables,
    drop_all_tables,
    get_db_session,
    get_db_session_context,
    get_engine,
    get_session_factory,
    init_db,
)
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
    SwitchingMatrix,
)
from app.db.repository import (
    BaseRepository,
    ClusteringRunRepository,
    OptimizationRunRepository,
    ProductRepository,
    SaleRepository,
    SimulationRunRepository,
    StoreRepository,
    SwitchingMatrixRepository,
    get_repositories,
)

__all__ = [
    # Database
    "Base",
    "get_engine",
    "get_session_factory",
    "get_db_session",
    "get_db_session_context",
    "init_db",
    "close_db",
    "create_all_tables",
    "drop_all_tables",
    # Models
    "AssortmentProduct",
    "AssortmentStore",
    "AssortmentSale",
    "SwitchingMatrix",
    "OptimizationRun",
    "SimulationRun",
    "ClusteringRun",
    # Enums
    "BrandTier",
    "StoreFormat",
    "LocationType",
    "IncomeIndex",
    "OptimizationStatus",
    "ScenarioType",
    # Repositories
    "BaseRepository",
    "ProductRepository",
    "StoreRepository",
    "SaleRepository",
    "SwitchingMatrixRepository",
    "OptimizationRunRepository",
    "SimulationRunRepository",
    "ClusteringRunRepository",
    "get_repositories",
]
