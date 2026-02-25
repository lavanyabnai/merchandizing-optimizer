"""SQLAlchemy ORM models for the Assortment Optimizer."""

import enum
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


# =============================================================================
# Enums
# =============================================================================


class BrandTier(str, enum.Enum):
    """Brand tier classification."""

    PREMIUM = "Premium"
    NATIONAL_A = "National A"
    NATIONAL_B = "National B"
    STORE_BRAND = "Store Brand"


class StoreFormat(str, enum.Enum):
    """Store format classification."""

    EXPRESS = "Express"
    STANDARD = "Standard"
    SUPERSTORE = "Superstore"


class LocationType(str, enum.Enum):
    """Store location type."""

    URBAN = "Urban"
    SUBURBAN = "Suburban"
    RURAL = "Rural"


class IncomeIndex(str, enum.Enum):
    """Store area income index."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class OptimizationStatus(str, enum.Enum):
    """Optimization run status."""

    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScenarioType(str, enum.Enum):
    """Simulation scenario types."""

    REMOVE_SKU = "remove_sku"
    ADD_SKU = "add_sku"
    CHANGE_FACINGS = "change_facings"
    CHANGE_PRICE = "change_price"


# =============================================================================
# Mixin Classes
# =============================================================================


class TimestampMixin:
    """Mixin for created_at and updated_at timestamps."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class UUIDMixin:
    """Mixin for UUID primary key."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )


# =============================================================================
# Models
# =============================================================================


class AssortmentProduct(Base, UUIDMixin, TimestampMixin):
    """Product master data for assortment optimization."""

    __tablename__ = "assortment_products"

    # Basic info
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    brand_tier: Mapped[BrandTier] = mapped_column(
        Enum(BrandTier, name="brand_tier_enum"),
        nullable=False,
        index=True,
    )

    # Category info
    subcategory: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    size: Mapped[str] = mapped_column(String(50), nullable=False)
    pack_type: Mapped[str] = mapped_column(String(50), nullable=False)

    # Pricing
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Physical attributes
    width_inches: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)

    # Elasticity parameters
    space_elasticity: Mapped[float] = mapped_column(
        Numeric(5, 4),
        nullable=False,
        default=0.15,
    )

    # Optional metadata
    flavor: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price_tier: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    sales: Mapped[list["AssortmentSale"]] = relationship(
        "AssortmentSale",
        back_populates="product",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_products_subcategory_brand", "subcategory", "brand"),
        Index("ix_products_brand_tier_subcategory", "brand_tier", "subcategory"),
    )

    def __repr__(self) -> str:
        return f"<AssortmentProduct(sku='{self.sku}', name='{self.name}')>"

    @property
    def margin(self) -> float:
        """Calculate profit margin percentage."""
        if self.price > 0:
            return float((self.price - self.cost) / self.price * 100)
        return 0.0

    @property
    def profit_per_unit(self) -> float:
        """Calculate profit per unit."""
        return float(self.price - self.cost)


class AssortmentStore(Base, UUIDMixin, TimestampMixin):
    """Store master data for assortment optimization."""

    __tablename__ = "assortment_stores"

    # Basic info
    store_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)

    # Store characteristics
    format: Mapped[StoreFormat] = mapped_column(
        Enum(StoreFormat, name="store_format_enum"),
        nullable=False,
        index=True,
    )
    location_type: Mapped[LocationType] = mapped_column(
        Enum(LocationType, name="location_type_enum"),
        nullable=False,
        index=True,
    )
    income_index: Mapped[IncomeIndex] = mapped_column(
        Enum(IncomeIndex, name="income_index_enum"),
        nullable=False,
    )

    # Capacity
    total_facings: Mapped[int] = mapped_column(Integer, nullable=False)
    num_shelves: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    shelf_width_inches: Mapped[float] = mapped_column(
        Numeric(6, 2),
        nullable=False,
        default=48.0,
    )

    # Traffic
    weekly_traffic: Mapped[int] = mapped_column(Integer, nullable=False)

    # Optional metadata
    region: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    sales: Mapped[list["AssortmentSale"]] = relationship(
        "AssortmentSale",
        back_populates="store",
        cascade="all, delete-orphan",
    )
    optimization_runs: Mapped[list["OptimizationRun"]] = relationship(
        "OptimizationRun",
        back_populates="store",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_stores_format_location", "format", "location_type"),
    )

    def __repr__(self) -> str:
        return f"<AssortmentStore(code='{self.store_code}', name='{self.name}')>"

    @property
    def total_linear_feet(self) -> float:
        """Calculate total linear shelf feet."""
        return float(self.num_shelves * self.shelf_width_inches / 12)


class AssortmentSale(Base, UUIDMixin):
    """Sales data for products by store and week."""

    __tablename__ = "assortment_sales"

    # Foreign keys
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assortment_products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    store_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assortment_stores.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Time period
    week_number: Mapped[int] = mapped_column(Integer, nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)

    # Sales metrics
    units_sold: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    revenue: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    # Shelf allocation
    facings: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Promotion flag
    on_promotion: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    product: Mapped["AssortmentProduct"] = relationship(
        "AssortmentProduct",
        back_populates="sales",
    )
    store: Mapped["AssortmentStore"] = relationship(
        "AssortmentStore",
        back_populates="sales",
    )

    __table_args__ = (
        Index("ix_sales_product_store", "product_id", "store_id"),
        Index("ix_sales_week_year", "week_number", "year"),
        Index("ix_sales_store_week", "store_id", "week_number", "year"),
        UniqueConstraint(
            "product_id", "store_id", "week_number", "year",
            name="uq_sales_product_store_week_year",
        ),
    )

    def __repr__(self) -> str:
        return f"<AssortmentSale(product={self.product_id}, store={self.store_id}, week={self.week_number})>"


class SwitchingMatrix(Base, UUIDMixin):
    """Consumer switching behavior probabilities."""

    __tablename__ = "switching_matrix"

    # Switching from/to
    from_brand: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    to_brand: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    # Probability
    switching_probability: Mapped[float] = mapped_column(
        Numeric(5, 4),
        nullable=False,
    )

    # Optional: subcategory level switching
    subcategory: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_switching_from_to", "from_brand", "to_brand"),
        UniqueConstraint(
            "from_brand", "to_brand", "subcategory",
            name="uq_switching_from_to_subcategory",
        ),
    )

    def __repr__(self) -> str:
        return f"<SwitchingMatrix(from='{self.from_brand}', to='{self.to_brand}', prob={self.switching_probability})>"


class OptimizationRun(Base, UUIDMixin, TimestampMixin):
    """Optimization run history and results."""

    __tablename__ = "optimization_runs"

    # Store (optional - null means all stores)
    store_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assortment_stores.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Run metadata
    run_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    status: Mapped[OptimizationStatus] = mapped_column(
        Enum(OptimizationStatus, name="optimization_status_enum"),
        default=OptimizationStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Configuration
    constraints: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    # Results
    results: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    profit_lift_pct: Mapped[float | None] = mapped_column(
        Numeric(8, 4),
        nullable=True,
    )
    profit_lift_absolute: Mapped[float | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )

    # Execution info
    execution_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # User who initiated
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    # Relationships
    store: Mapped["AssortmentStore | None"] = relationship(
        "AssortmentStore",
        back_populates="optimization_runs",
    )
    simulation_runs: Mapped[list["SimulationRun"]] = relationship(
        "SimulationRun",
        back_populates="optimization_run",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_optimization_status_date", "status", "run_date"),
    )

    def __repr__(self) -> str:
        return f"<OptimizationRun(id={self.id}, status='{self.status}')>"


class SimulationRun(Base, UUIDMixin):
    """Simulation run history and results."""

    __tablename__ = "simulation_runs"

    # Parent optimization run (optional)
    optimization_run_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("optimization_runs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Scenario configuration
    scenario_type: Mapped[ScenarioType] = mapped_column(
        Enum(ScenarioType, name="scenario_type_enum"),
        nullable=False,
        index=True,
    )
    parameters: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    # Simulation configuration
    num_trials: Mapped[int] = mapped_column(Integer, nullable=False, default=5000)

    # Results
    results: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Status
    status: Mapped[OptimizationStatus] = mapped_column(
        Enum(OptimizationStatus, name="optimization_status_enum"),
        default=OptimizationStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Execution info
    execution_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # User who initiated
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    # Relationships
    optimization_run: Mapped["OptimizationRun | None"] = relationship(
        "OptimizationRun",
        back_populates="simulation_runs",
    )

    __table_args__ = (
        Index("ix_simulation_scenario_status", "scenario_type", "status"),
    )

    def __repr__(self) -> str:
        return f"<SimulationRun(id={self.id}, type='{self.scenario_type}')>"


class ClusteringRun(Base, UUIDMixin):
    """Store clustering run history and results."""

    __tablename__ = "clustering_runs"

    # Configuration
    method: Mapped[str] = mapped_column(String(50), nullable=False)  # kmeans, gmm
    n_clusters: Mapped[int] = mapped_column(Integer, nullable=False)
    features_used: Mapped[list[str]] = mapped_column(JSONB, nullable=False, default=list)

    # Results
    silhouette_score: Mapped[float | None] = mapped_column(Numeric(6, 4), nullable=True)
    cluster_assignments: Mapped[dict[str, int] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    cluster_profiles: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    pca_coordinates: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    # Status
    status: Mapped[OptimizationStatus] = mapped_column(
        Enum(OptimizationStatus, name="optimization_status_enum"),
        default=OptimizationStatus.PENDING,
        nullable=False,
        index=True,
    )

    # Execution info
    execution_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # User who initiated
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)

    def __repr__(self) -> str:
        return f"<ClusteringRun(id={self.id}, method='{self.method}', k={self.n_clusters})>"
