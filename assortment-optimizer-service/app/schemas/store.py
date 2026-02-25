"""Pydantic schemas for Store entity."""

from datetime import datetime
from uuid import UUID

from pydantic import Field

from app.db.models import IncomeIndex, LocationType, StoreFormat
from app.schemas.common import BaseSchema, TimestampSchema


class StoreBase(BaseSchema):
    """Base store schema with common fields."""

    store_code: str = Field(..., min_length=1, max_length=50, description="Unique store code")
    name: str = Field(..., min_length=1, max_length=255, description="Store name")
    format: StoreFormat = Field(..., description="Store format")
    location_type: LocationType = Field(..., description="Location type")
    income_index: IncomeIndex = Field(..., description="Area income index")
    total_facings: int = Field(..., ge=10, le=500, description="Total shelf facings")
    num_shelves: int = Field(default=4, ge=1, le=10, description="Number of shelves")
    shelf_width_inches: float = Field(default=48.0, ge=24, le=120, description="Shelf width in inches")
    weekly_traffic: int = Field(..., ge=100, description="Average weekly customer traffic")


class StoreCreate(StoreBase):
    """Schema for creating a new store."""

    region: str | None = Field(None, max_length=100, description="Geographic region")
    is_active: bool = Field(default=True, description="Whether store is active")


class StoreUpdate(BaseSchema):
    """Schema for updating a store (all fields optional)."""

    store_code: str | None = Field(None, min_length=1, max_length=50)
    name: str | None = Field(None, min_length=1, max_length=255)
    format: StoreFormat | None = None
    location_type: LocationType | None = None
    income_index: IncomeIndex | None = None
    total_facings: int | None = Field(None, ge=10, le=500)
    num_shelves: int | None = Field(None, ge=1, le=10)
    shelf_width_inches: float | None = Field(None, ge=24, le=120)
    weekly_traffic: int | None = Field(None, ge=100)
    region: str | None = Field(None, max_length=100)
    is_active: bool | None = None


class StoreResponse(StoreBase, TimestampSchema):
    """Schema for store response."""

    id: UUID
    region: str | None = None
    is_active: bool

    # Computed field
    total_linear_feet: float = Field(..., description="Total linear shelf feet")


class StoreSummary(BaseSchema):
    """Lightweight store summary for lists."""

    id: UUID
    store_code: str
    name: str
    format: StoreFormat
    location_type: LocationType
    total_facings: int
    is_active: bool


class StoreFilter(BaseSchema):
    """Filter parameters for store queries."""

    format: StoreFormat | None = None
    location_type: LocationType | None = None
    income_index: IncomeIndex | None = None
    region: str | None = None
    is_active: bool | None = True
    min_traffic: int | None = None
    max_traffic: int | None = None


class BulkStoreCreate(BaseSchema):
    """Schema for bulk store creation."""

    stores: list[StoreCreate] = Field(..., min_length=1, max_length=500)


class BulkStoreResponse(BaseSchema):
    """Response for bulk store operations."""

    created: int
    failed: int
    errors: list[dict] | None = None
