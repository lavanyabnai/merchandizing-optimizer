"""Data management endpoints for seeding and importing data."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.core.exceptions import ValidationError
from app.core.logging import get_logger
from app.db.database import get_db_session
from app.db.repository import ProductRepository, SaleRepository, StoreRepository
from app.schemas.common import BaseSchema
from app.services.data_generator import DataGeneratorService
from app.utils.file_parser import (
    FileParseError,
    parse_file,
    validate_product_schema,
    validate_sale_schema,
    validate_store_schema,
)

logger = get_logger(__name__)
router = APIRouter()


# =============================================================================
# Request/Response Schemas
# =============================================================================


class SeedRequest(BaseSchema):
    """Request schema for data seeding."""

    num_products: int = Field(default=80, ge=1, le=500, description="Number of products to generate")
    num_stores: int = Field(default=25, ge=1, le=100, description="Number of stores to generate")
    weeks: int = Field(default=52, ge=1, le=104, description="Number of weeks of sales data")
    year: int = Field(default=2024, ge=2020, le=2030, description="Year for sales data")
    seed: int = Field(default=42, ge=0, description="Random seed for reproducibility")
    clear_existing: bool = Field(default=False, description="Clear existing data before seeding")


class SeedResponse(BaseSchema):
    """Response schema for data seeding."""

    success: bool
    products_created: int
    stores_created: int
    sales_records_created: int
    switching_entries_created: int
    message: str


class ImportResponse(BaseSchema):
    """Response schema for data import operations."""

    success: bool
    imported: int
    failed: int
    errors: list[dict] | None = None
    message: str


class ExportResponse(BaseSchema):
    """Response schema for data export operations."""

    count: int
    data: list[dict]


class ClearDataResponse(BaseSchema):
    """Response schema for clearing data."""

    success: bool
    deleted: dict[str, int]
    message: str


# =============================================================================
# Seed Endpoints
# =============================================================================


@router.post("/seed", response_model=SeedResponse)
async def seed_data(
    request: SeedRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> SeedResponse:
    """Generate and save synthetic data to the database.

    This endpoint generates realistic beverage category data including:
    - Products across 4 subcategories (Soft Drinks, Juices, Water, Energy Drinks)
    - Stores with varying formats, locations, and income levels
    - Weekly sales data with seasonality patterns
    - Consumer switching behavior matrix

    Requires authentication.
    """
    logger.info(
        "Seeding data",
        user_id=user.user_id,
        num_products=request.num_products,
        num_stores=request.num_stores,
    )

    generator = DataGeneratorService(session, seed=request.seed)

    # Clear existing data if requested
    if request.clear_existing:
        await generator.clear_all_data()
        logger.info("Cleared existing data before seeding")

    try:
        summary = await generator.seed_all_data(
            num_products=request.num_products,
            num_stores=request.num_stores,
            weeks=request.weeks,
            year=request.year,
        )

        return SeedResponse(
            success=True,
            products_created=summary["products_created"],
            stores_created=summary["stores_created"],
            sales_records_created=summary["sales_records_created"],
            switching_entries_created=summary["switching_entries_created"],
            message=f"Successfully seeded {summary['products_created']} products, "
            f"{summary['stores_created']} stores, and {summary['sales_records_created']} sales records.",
        )

    except Exception as e:
        logger.error("Data seeding failed", error=str(e))
        raise ValidationError(f"Failed to seed data: {str(e)}")


@router.delete("/clear", response_model=ClearDataResponse)
async def clear_all_data(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    confirm: bool = Query(False, description="Confirm deletion"),
) -> ClearDataResponse:
    """Clear all data from the database.

    This is a destructive operation that removes all products, stores,
    sales, and switching matrix data.

    Requires authentication and explicit confirmation.
    """
    if not confirm:
        raise ValidationError(
            "Please confirm deletion by setting confirm=true",
            details={"hint": "Add ?confirm=true to the URL"},
        )

    logger.warning("Clearing all data", user_id=user.user_id)

    generator = DataGeneratorService(session)
    deleted = await generator.clear_all_data()

    return ClearDataResponse(
        success=True,
        deleted=deleted,
        message=f"Deleted {sum(deleted.values())} total records.",
    )


# =============================================================================
# Import Endpoints
# =============================================================================


@router.post("/import/products", response_model=ImportResponse)
async def import_products(
    user: CurrentUser,
    file: UploadFile = File(..., description="CSV or JSON file with product data"),
    session: AsyncSession = Depends(get_db_session),
) -> ImportResponse:
    """Import products from a CSV or JSON file.

    Expected columns/fields:
    - sku (required): Unique product identifier
    - name (required): Product name
    - brand (required): Brand name
    - brand_tier (required): Premium, National A, National B, or Store Brand
    - subcategory (required): Product subcategory
    - size (required): Product size (e.g., 12oz, 2L)
    - pack_type (required): Pack type (e.g., Single, 6-pack)
    - price (required): Retail price
    - cost (required): Unit cost
    - width_inches (required): Product width
    - space_elasticity (optional): Space elasticity coefficient
    - flavor (optional): Product flavor
    - price_tier (optional): Value, Mid, or Premium
    - is_active (optional): Whether product is active (default: true)
    """
    logger.info("Importing products", user_id=user.user_id, filename=file.filename)

    try:
        content = await file.read()
        rows = parse_file(content, file.filename or "file.csv")
        valid_data, errors = validate_product_schema(rows)

        if not valid_data:
            return ImportResponse(
                success=False,
                imported=0,
                failed=len(errors),
                errors=errors[:10],  # Limit error details
                message="No valid products found in file.",
            )

        # Insert valid products
        repo = ProductRepository(session)
        created = await repo.create_many(valid_data)
        await session.commit()

        return ImportResponse(
            success=True,
            imported=len(created),
            failed=len(errors),
            errors=errors[:10] if errors else None,
            message=f"Successfully imported {len(created)} products.",
        )

    except FileParseError as e:
        logger.warning("Product import parse error", error=e.message)
        raise ValidationError(e.message, details={"errors": e.errors})


@router.post("/import/stores", response_model=ImportResponse)
async def import_stores(
    user: CurrentUser,
    file: UploadFile = File(..., description="CSV or JSON file with store data"),
    session: AsyncSession = Depends(get_db_session),
) -> ImportResponse:
    """Import stores from a CSV or JSON file.

    Expected columns/fields:
    - store_code (required): Unique store identifier
    - name (required): Store name
    - format (required): Express, Standard, or Superstore
    - location_type (required): Urban, Suburban, or Rural
    - income_index (required): Low, Medium, or High
    - total_facings (required): Total shelf facings
    - weekly_traffic (required): Average weekly customer traffic
    - num_shelves (optional): Number of shelves (default: 4)
    - shelf_width_inches (optional): Shelf width (default: 48.0)
    - region (optional): Geographic region
    - is_active (optional): Whether store is active (default: true)
    """
    logger.info("Importing stores", user_id=user.user_id, filename=file.filename)

    try:
        content = await file.read()
        rows = parse_file(content, file.filename or "file.csv")
        valid_data, errors = validate_store_schema(rows)

        if not valid_data:
            return ImportResponse(
                success=False,
                imported=0,
                failed=len(errors),
                errors=errors[:10],
                message="No valid stores found in file.",
            )

        repo = StoreRepository(session)
        created = await repo.create_many(valid_data)
        await session.commit()

        return ImportResponse(
            success=True,
            imported=len(created),
            failed=len(errors),
            errors=errors[:10] if errors else None,
            message=f"Successfully imported {len(created)} stores.",
        )

    except FileParseError as e:
        logger.warning("Store import parse error", error=e.message)
        raise ValidationError(e.message, details={"errors": e.errors})


@router.post("/import/sales", response_model=ImportResponse)
async def import_sales(
    user: CurrentUser,
    file: UploadFile = File(..., description="CSV or JSON file with sales data"),
    session: AsyncSession = Depends(get_db_session),
) -> ImportResponse:
    """Import sales data from a CSV or JSON file.

    Expected columns/fields:
    - sku (required): Product SKU (must exist in database)
    - store_code (required): Store code (must exist in database)
    - week_number (required): Week number (1-52)
    - year (required): Year
    - units_sold (required): Units sold
    - revenue (required): Revenue amount
    - facings (optional): Number of facings (default: 1)
    - on_promotion (optional): Whether on promotion (default: false)

    Note: Products and stores must be imported first.
    """
    logger.info("Importing sales", user_id=user.user_id, filename=file.filename)

    try:
        content = await file.read()
        rows = parse_file(content, file.filename or "file.csv")
        valid_data, validation_errors = validate_sale_schema(rows)

        if not valid_data:
            return ImportResponse(
                success=False,
                imported=0,
                failed=len(validation_errors),
                errors=validation_errors[:10],
                message="No valid sales records found in file.",
            )

        # Resolve SKUs and store codes to IDs
        product_repo = ProductRepository(session)
        store_repo = StoreRepository(session)
        sale_repo = SaleRepository(session)

        # Get unique SKUs and store codes
        skus = list(set(s["sku"] for s in valid_data))
        store_codes = list(set(s["store_code"] for s in valid_data))

        # Fetch products and stores
        products = await product_repo.get_by_skus(skus)
        stores = await store_repo.get_by_codes(store_codes)

        sku_to_id = {p.sku: p.id for p in products}
        code_to_id = {s.store_code: s.id for s in stores}

        # Convert sales data
        sales_to_insert = []
        resolution_errors = []

        for idx, sale in enumerate(valid_data):
            sku = sale.pop("sku")
            store_code = sale.pop("store_code")

            if sku not in sku_to_id:
                resolution_errors.append({
                    "row": idx + 1,
                    "error": f"Product SKU not found: {sku}",
                })
                continue

            if store_code not in code_to_id:
                resolution_errors.append({
                    "row": idx + 1,
                    "error": f"Store code not found: {store_code}",
                })
                continue

            sale["product_id"] = sku_to_id[sku]
            sale["store_id"] = code_to_id[store_code]
            sales_to_insert.append(sale)

        if not sales_to_insert:
            all_errors = validation_errors + resolution_errors
            return ImportResponse(
                success=False,
                imported=0,
                failed=len(all_errors),
                errors=all_errors[:10],
                message="No sales records could be resolved to existing products/stores.",
            )

        # Insert in batches
        batch_size = 5000
        total_created = 0
        for i in range(0, len(sales_to_insert), batch_size):
            batch = sales_to_insert[i : i + batch_size]
            await sale_repo.create_many(batch)
            total_created += len(batch)

        await session.commit()

        all_errors = validation_errors + resolution_errors
        return ImportResponse(
            success=True,
            imported=total_created,
            failed=len(all_errors),
            errors=all_errors[:10] if all_errors else None,
            message=f"Successfully imported {total_created} sales records.",
        )

    except FileParseError as e:
        logger.warning("Sales import parse error", error=e.message)
        raise ValidationError(e.message, details={"errors": e.errors})


# =============================================================================
# Export Endpoints
# =============================================================================


@router.get("/export/products")
async def export_products(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    subcategory: str | None = None,
    brand: str | None = None,
    is_active: bool | None = True,
) -> JSONResponse:
    """Export products to JSON.

    Returns product data in JSON format suitable for import or analysis.
    """
    repo = ProductRepository(session)
    products, total = await repo.search(
        subcategory=subcategory,
        brand=brand,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )

    data = [
        {
            "sku": p.sku,
            "name": p.name,
            "brand": p.brand,
            "brand_tier": p.brand_tier.value,
            "subcategory": p.subcategory,
            "size": p.size,
            "pack_type": p.pack_type,
            "price": float(p.price),
            "cost": float(p.cost),
            "width_inches": float(p.width_inches),
            "space_elasticity": float(p.space_elasticity),
            "flavor": p.flavor,
            "price_tier": p.price_tier,
            "is_active": p.is_active,
        }
        for p in products
    ]

    return JSONResponse(
        content={
            "count": len(data),
            "total": total,
            "data": data,
        }
    )


@router.get("/export/stores")
async def export_stores(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    skip: int = Query(0, ge=0),
    limit: int = Query(1000, ge=1, le=10000),
    format: str | None = None,
    location_type: str | None = None,
    is_active: bool | None = True,
) -> JSONResponse:
    """Export stores to JSON.

    Returns store data in JSON format suitable for import or analysis.
    """
    repo = StoreRepository(session)
    stores, total = await repo.search(
        format=format,
        location_type=location_type,
        is_active=is_active,
        skip=skip,
        limit=limit,
    )

    data = [
        {
            "store_code": s.store_code,
            "name": s.name,
            "format": s.format.value,
            "location_type": s.location_type.value,
            "income_index": s.income_index.value,
            "total_facings": s.total_facings,
            "num_shelves": s.num_shelves,
            "shelf_width_inches": float(s.shelf_width_inches),
            "weekly_traffic": s.weekly_traffic,
            "region": s.region,
            "is_active": s.is_active,
        }
        for s in stores
    ]

    return JSONResponse(
        content={
            "count": len(data),
            "total": total,
            "data": data,
        }
    )


# =============================================================================
# Data Statistics
# =============================================================================


@router.get("/stats")
async def get_data_statistics(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Get statistics about the current data in the database.

    Returns counts and summaries for all data types.
    """
    product_repo = ProductRepository(session)
    store_repo = StoreRepository(session)
    sale_repo = SaleRepository(session)

    product_count = await product_repo.count()
    store_count = await store_repo.count()
    sale_count = await sale_repo.count()

    subcategories = await product_repo.get_subcategories()
    brands = await product_repo.get_brands()

    return {
        "products": {
            "count": product_count,
            "subcategories": subcategories,
            "brands": brands,
        },
        "stores": {
            "count": store_count,
        },
        "sales": {
            "count": sale_count,
        },
    }
