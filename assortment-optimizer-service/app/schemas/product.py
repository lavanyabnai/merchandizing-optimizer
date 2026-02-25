"""Pydantic schemas for Product entity."""

from datetime import datetime
from uuid import UUID

from pydantic import Field, field_validator

from app.db.models import BrandTier
from app.schemas.common import BaseSchema, TimestampSchema


class ProductBase(BaseSchema):
    """Base product schema with common fields."""

    sku: str = Field(..., min_length=1, max_length=50, description="Stock Keeping Unit")
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    brand: str = Field(..., min_length=1, max_length=100, description="Brand name")
    brand_tier: BrandTier = Field(..., description="Brand tier classification")
    subcategory: str = Field(..., min_length=1, max_length=100, description="Product subcategory")
    size: str = Field(..., min_length=1, max_length=50, description="Product size (e.g., 12oz, 2L)")
    pack_type: str = Field(..., min_length=1, max_length=50, description="Pack type (e.g., can, bottle)")
    price: float = Field(..., gt=0, description="Retail price")
    cost: float = Field(..., gt=0, description="Unit cost")
    width_inches: float = Field(..., gt=0, le=24, description="Product width in inches")
    space_elasticity: float = Field(
        default=0.15,
        ge=0,
        le=1,
        description="Space elasticity coefficient",
    )

    @field_validator("price")
    @classmethod
    def price_greater_than_cost(cls, v: float, info) -> float:
        """Validate that price is greater than cost."""
        cost = info.data.get("cost")
        if cost is not None and v <= cost:
            raise ValueError("Price must be greater than cost")
        return v


class ProductCreate(ProductBase):
    """Schema for creating a new product."""

    flavor: str | None = Field(None, max_length=100, description="Product flavor")
    price_tier: str | None = Field(None, max_length=50, description="Price tier (Value/Mid/Premium)")
    is_active: bool = Field(default=True, description="Whether product is active")


class ProductUpdate(BaseSchema):
    """Schema for updating a product (all fields optional)."""

    sku: str | None = Field(None, min_length=1, max_length=50)
    name: str | None = Field(None, min_length=1, max_length=255)
    brand: str | None = Field(None, min_length=1, max_length=100)
    brand_tier: BrandTier | None = None
    subcategory: str | None = Field(None, min_length=1, max_length=100)
    size: str | None = Field(None, min_length=1, max_length=50)
    pack_type: str | None = Field(None, min_length=1, max_length=50)
    price: float | None = Field(None, gt=0)
    cost: float | None = Field(None, gt=0)
    width_inches: float | None = Field(None, gt=0, le=24)
    space_elasticity: float | None = Field(None, ge=0, le=1)
    flavor: str | None = Field(None, max_length=100)
    price_tier: str | None = Field(None, max_length=50)
    is_active: bool | None = None


class ProductResponse(ProductBase, TimestampSchema):
    """Schema for product response."""

    id: UUID
    flavor: str | None = None
    price_tier: str | None = None
    is_active: bool

    # Computed fields
    margin: float = Field(..., description="Profit margin percentage")
    profit_per_unit: float = Field(..., description="Profit per unit sold")


class ProductSummary(BaseSchema):
    """Lightweight product summary for lists."""

    id: UUID
    sku: str
    name: str
    brand: str
    brand_tier: BrandTier
    subcategory: str
    price: float
    is_active: bool


class ProductFilter(BaseSchema):
    """Filter parameters for product queries."""

    subcategory: str | None = None
    brand: str | None = None
    brand_tier: BrandTier | None = None
    price_tier: str | None = None
    is_active: bool | None = True
    min_price: float | None = None
    max_price: float | None = None


class BulkProductCreate(BaseSchema):
    """Schema for bulk product creation."""

    products: list[ProductCreate] = Field(..., min_length=1, max_length=1000)


class BulkProductResponse(BaseSchema):
    """Response for bulk product operations."""

    created: int
    failed: int
    errors: list[dict] | None = None
