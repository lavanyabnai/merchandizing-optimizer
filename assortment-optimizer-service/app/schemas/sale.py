"""Pydantic schemas for Sale entity."""

from datetime import datetime
from uuid import UUID

from pydantic import Field, field_validator

from app.schemas.common import BaseSchema


class SaleBase(BaseSchema):
    """Base sale schema with common fields."""

    product_id: UUID = Field(..., description="Product ID")
    store_id: UUID = Field(..., description="Store ID")
    week_number: int = Field(..., ge=1, le=53, description="Week number (1-53)")
    year: int = Field(..., ge=2000, le=2100, description="Year")
    units_sold: int = Field(..., ge=0, description="Units sold")
    revenue: float = Field(..., ge=0, description="Revenue generated")
    facings: int = Field(default=1, ge=1, le=20, description="Number of facings")
    on_promotion: bool = Field(default=False, description="Whether product was on promotion")


class SaleCreate(SaleBase):
    """Schema for creating a new sale record."""

    pass


class SaleResponse(SaleBase):
    """Schema for sale response."""

    id: UUID
    created_at: datetime


class SaleSummary(BaseSchema):
    """Aggregated sales summary."""

    product_id: UUID
    store_id: UUID | None = None
    total_units: int
    total_revenue: float
    avg_facings: float
    weeks_on_promotion: int
    total_weeks: int


class SaleFilter(BaseSchema):
    """Filter parameters for sale queries."""

    product_id: UUID | None = None
    store_id: UUID | None = None
    week_number: int | None = None
    year: int | None = None
    start_week: int | None = None
    end_week: int | None = None
    on_promotion: bool | None = None


class BulkSaleCreate(BaseSchema):
    """Schema for bulk sale creation."""

    sales: list[SaleCreate] = Field(..., min_length=1, max_length=10000)


class BulkSaleResponse(BaseSchema):
    """Response for bulk sale operations."""

    created: int
    failed: int
    errors: list[dict] | None = None


class WeeklySalesSummary(BaseSchema):
    """Weekly sales aggregation."""

    week_number: int
    year: int
    total_units: int
    total_revenue: float
    unique_products: int
    unique_stores: int


class ProductSalesSummary(BaseSchema):
    """Product-level sales summary."""

    product_id: UUID
    sku: str
    name: str
    brand: str
    subcategory: str
    total_units: int
    total_revenue: float
    avg_units_per_week: float
    avg_revenue_per_week: float
    total_weeks: int


class StoreSalesSummary(BaseSchema):
    """Store-level sales summary."""

    store_id: UUID
    store_code: str
    name: str
    total_units: int
    total_revenue: float
    unique_products: int
    avg_revenue_per_week: float
