"""Pydantic schemas for Optimization operations."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field, field_validator

from app.db.models import OptimizationStatus
from app.schemas.common import BaseSchema


class OptimizationConstraints(BaseSchema):
    """Constraints for assortment optimization."""

    total_facings: int = Field(
        default=100,
        ge=50,
        le=500,
        description="Total number of facings to allocate",
    )
    min_facings_per_sku: int = Field(
        default=1,
        ge=1,
        le=10,
        description="Minimum facings per selected SKU",
    )
    max_facings_per_sku: int = Field(
        default=6,
        ge=1,
        le=20,
        description="Maximum facings per selected SKU",
    )
    min_skus_per_subcategory: int = Field(
        default=3,
        ge=0,
        le=20,
        description="Minimum SKUs per subcategory",
    )
    min_skus_per_price_tier: int = Field(
        default=1,
        ge=0,
        le=10,
        description="Minimum SKUs per price tier",
    )
    min_skus_per_brand: int = Field(
        default=0,
        ge=0,
        le=10,
        description="Minimum SKUs per brand",
    )
    max_skus_per_brand: int = Field(
        default=10,
        ge=1,
        le=30,
        description="Maximum SKUs per brand",
    )
    must_carry: list[str] = Field(
        default_factory=list,
        description="List of SKUs that must be included",
    )
    exclude: list[str] = Field(
        default_factory=list,
        description="List of SKUs to exclude",
    )

    @field_validator("max_facings_per_sku")
    @classmethod
    def max_greater_than_min(cls, v: int, info) -> int:
        """Validate max >= min for facings."""
        min_val = info.data.get("min_facings_per_sku", 1)
        if v < min_val:
            raise ValueError("max_facings_per_sku must be >= min_facings_per_sku")
        return v


class OptimizationRequest(BaseSchema):
    """Request to run an optimization."""

    store_id: UUID | None = Field(
        None,
        description="Store ID to optimize for (None = all stores)",
    )
    constraints: OptimizationConstraints = Field(
        default_factory=OptimizationConstraints,
        description="Optimization constraints",
    )
    include_subcategories: list[str] | None = Field(
        None,
        description="Subcategories to include (None = all)",
    )


class ProductAllocation(BaseSchema):
    """Optimized product allocation result."""

    product_id: UUID
    sku: str
    name: str
    brand: str
    subcategory: str
    current_facings: int
    optimized_facings: int
    facing_change: int
    current_profit: float
    optimized_profit: float
    profit_change: float
    profit_change_pct: float


class SpaceAllocation(BaseSchema):
    """Space allocation by category."""

    subcategory: str
    current_facings: int
    optimized_facings: int
    current_pct: float
    optimized_pct: float
    change: int


class ConstraintSatisfaction(BaseSchema):
    """Constraint satisfaction status."""

    constraint_name: str
    satisfied: bool
    current_value: Any
    required_value: Any
    message: str | None = None


class OptimizationResult(BaseSchema):
    """Complete optimization result."""

    run_id: UUID
    store_id: UUID | None
    status: OptimizationStatus

    # Summary metrics
    current_profit: float
    optimized_profit: float
    profit_lift_absolute: float
    profit_lift_pct: float

    # Detailed results
    product_allocations: list[ProductAllocation]
    space_allocations: list[SpaceAllocation]
    constraint_satisfaction: list[ConstraintSatisfaction]

    # Counts
    products_added: int
    products_removed: int
    products_unchanged: int

    # Execution metadata
    execution_time_ms: int
    run_date: datetime


class OptimizationResponse(BaseSchema):
    """Response when starting an optimization."""

    run_id: UUID
    status: OptimizationStatus
    message: str


class OptimizationSummary(BaseSchema):
    """Summary of an optimization run for listing."""

    run_id: UUID
    store_id: UUID | None
    store_name: str | None
    status: OptimizationStatus
    profit_lift_pct: float | None
    run_date: datetime
    execution_time_ms: int | None


class OptimizationCompare(BaseSchema):
    """Comparison between two optimization runs."""

    run_id_1: UUID
    run_id_2: UUID
    profit_lift_diff: float
    products_diff: list[dict]
    space_allocation_diff: list[dict]
