"""Demand model endpoints for MNL predictions and elasticity calculations."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger
from app.db.database import get_db_session
from app.db.repository import ProductRepository
from app.schemas.common import BaseSchema
from app.services.demand_model import (
    DemandModelConfig,
    DemandModelService,
    ProductData,
    estimate_demand_from_sales,
    load_products_for_demand,
)

logger = get_logger(__name__)
router = APIRouter()


# =============================================================================
# Request/Response Schemas
# =============================================================================


class PredictRequest(BaseSchema):
    """Request schema for demand prediction."""

    skus: list[str] | None = Field(
        None, description="Specific SKUs to include (all if empty)"
    )
    available_skus: list[str] | None = Field(
        None, description="SKUs that are available (all if empty)"
    )
    config: DemandModelConfig | None = Field(
        None, description="Override model configuration"
    )


class PredictResponse(BaseSchema):
    """Response schema for demand prediction."""

    probabilities: dict[str, float]
    utilities: dict[str, float]
    total_probability: float
    product_count: int


class SubstitutionRequest(BaseSchema):
    """Request schema for substitution matrix."""

    skus: list[str] | None = Field(
        None, description="Specific SKUs to include (all if empty)"
    )
    config: DemandModelConfig | None = Field(
        None, description="Override model configuration"
    )


class SubstitutionResponse(BaseSchema):
    """Response schema for substitution matrix."""

    matrix: list[list[float]]
    skus: list[str]
    size: int


class TransferRequest(BaseSchema):
    """Request schema for demand transfer calculation."""

    removed_skus: list[str] = Field(..., min_length=1, description="SKUs being removed")
    store_id: UUID | None = Field(None, description="Store to calculate for")
    year: int | None = Field(None, description="Year for historical demand")
    walk_rate: float | None = Field(None, ge=0, le=1, description="Override walk rate")
    config: DemandModelConfig | None = Field(None, description="Override model config")


class TransferResponse(BaseSchema):
    """Response schema for demand transfer."""

    new_demand: dict[str, float]
    original_demand: dict[str, float]
    walked_away: float
    transfers: list[dict[str, Any]]
    removed_skus: list[str]


class ElasticityRequest(BaseSchema):
    """Request schema for elasticity calculations."""

    sku: str = Field(..., description="Product SKU")
    elasticity_type: str = Field(
        ..., pattern="^(price|space)$", description="Type of elasticity"
    )
    # For price elasticity
    new_price: float | None = Field(None, gt=0, description="New price for calculation")
    price_elasticity: float | None = Field(
        None, le=0, description="Override price elasticity"
    )
    # For space elasticity
    new_facings: int | None = Field(None, ge=0, description="New facing count")
    base_facings: int | None = Field(None, ge=1, description="Override base facings")
    space_elasticity: float | None = Field(
        None, ge=0, le=1, description="Override space elasticity"
    )
    # Common
    store_id: UUID | None = Field(None, description="Store for historical demand")
    year: int | None = Field(None, description="Year for historical demand")


class ElasticityResponse(BaseSchema):
    """Response schema for elasticity calculation."""

    sku: str
    elasticity_type: str
    base_demand: float
    new_demand: float
    demand_change: float
    demand_change_pct: float
    elasticity_used: float
    # Type-specific details
    price_change_pct: float | None = None
    base_price: float | None = None
    new_price: float | None = None
    facing_change: int | None = None
    base_facings: int | None = None
    new_facings: int | None = None


class CannibalizationRequest(BaseSchema):
    """Request schema for cannibalization analysis."""

    new_product: dict[str, Any] = Field(
        ..., description="New product attributes (sku, brand, brand_tier, etc.)"
    )
    incremental_demand_pct: float = Field(
        default=0.3,
        ge=0,
        le=1,
        description="Percent of new product demand that's incremental",
    )
    store_id: UUID | None = Field(None, description="Store for historical demand")
    year: int | None = Field(None, description="Year for historical demand")
    config: DemandModelConfig | None = Field(None, description="Override model config")


class CannibalizationResponse(BaseSchema):
    """Response schema for cannibalization analysis."""

    new_product_demand: float
    cannibalized_demand: float
    incremental_demand: float
    adjusted_demand: dict[str, float]
    cannibalization_by_sku: dict[str, float]


class SwitchingMatrixResponse(BaseSchema):
    """Response schema for switching probabilities."""

    switching_behaviors: list[dict[str, Any]]
    walk_rate: float
    total_probability: float


# =============================================================================
# Endpoints
# =============================================================================


@router.post("/predict", response_model=PredictResponse)
async def predict_demand(
    request: PredictRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> PredictResponse:
    """Predict choice probabilities using the MNL demand model.

    The Multinomial Logit model calculates the probability that a consumer
    will choose each product based on utility:

    U_i = β₀ + β_brand[tier] + β_price × (price/5) + β_size[size] + β_promo × promo
    P(choose i) = exp(U_i) / Σexp(U_j)

    Returns probabilities that sum to 1.0 across available products.
    """
    logger.info("Predicting demand", user_id=user.user_id)

    # Load products
    products = await load_products_for_demand(session)

    if not products:
        return PredictResponse(
            probabilities={},
            utilities={},
            total_probability=0.0,
            product_count=0,
        )

    # Filter by SKUs if specified
    if request.skus:
        sku_set = set(request.skus)
        products = [p for p in products if p.sku in sku_set]

    if not products:
        return PredictResponse(
            probabilities={},
            utilities={},
            total_probability=0.0,
            product_count=0,
        )

    # Build availability mask
    available_mask = None
    if request.available_skus:
        available_set = set(request.available_skus)
        available_mask = [p.sku in available_set for p in products]
        import numpy as np
        available_mask = np.array(available_mask)

    # Initialize model
    config = request.config or DemandModelConfig()
    model = DemandModelService(config=config)

    # Calculate probabilities
    probabilities = model.predict_choice_probabilities(products, available_mask)

    # Calculate utilities for reference
    utilities = {p.sku: model.calculate_utility(p) for p in products}

    total_prob = sum(probabilities.values())

    return PredictResponse(
        probabilities=probabilities,
        utilities=utilities,
        total_probability=total_prob,
        product_count=len(products),
    )


@router.post("/substitution", response_model=SubstitutionResponse)
async def get_substitution_matrix(
    request: SubstitutionRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> SubstitutionResponse:
    """Calculate the product substitution matrix.

    Returns an NxN matrix where element [i,j] represents the probability
    that demand for product i would transfer to product j if product i
    were removed from the assortment.

    Substitution is based on product similarity:
    - Same brand: 30% weight
    - Same size: 20% weight
    - Same price tier: 20% weight
    - Same subcategory: 20% weight
    - Same flavor: 10% weight
    """
    logger.info("Calculating substitution matrix", user_id=user.user_id)

    products = await load_products_for_demand(session)

    if request.skus:
        sku_set = set(request.skus)
        products = [p for p in products if p.sku in sku_set]

    if not products:
        return SubstitutionResponse(
            matrix=[],
            skus=[],
            size=0,
        )

    config = request.config or DemandModelConfig()
    model = DemandModelService(config=config)

    matrix = model.calculate_substitution_matrix(products)

    return SubstitutionResponse(
        matrix=matrix.tolist(),
        skus=[p.sku for p in products],
        size=len(products),
    )


@router.post("/transfer", response_model=TransferResponse)
async def calculate_demand_transfer(
    request: TransferRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> TransferResponse:
    """Calculate how demand transfers when SKUs are removed.

    When products are removed from the assortment:
    1. A portion of demand (walk_rate, default 9%) leaves the category
    2. The remaining demand transfers to substitute products
    3. Transfer is proportional to product similarity

    Returns the new demand distribution and breakdown of transfers.
    """
    logger.info(
        "Calculating demand transfer",
        user_id=user.user_id,
        removed_skus=request.removed_skus,
    )

    # Load products
    products = await load_products_for_demand(session)

    if not products:
        raise ValidationError("No products found in database")

    # Verify removed SKUs exist
    product_skus = {p.sku for p in products}
    invalid_skus = [sku for sku in request.removed_skus if sku not in product_skus]
    if invalid_skus:
        raise ValidationError(
            f"SKUs not found: {invalid_skus}",
            details={"invalid_skus": invalid_skus},
        )

    # Get historical demand
    base_demand = await estimate_demand_from_sales(
        session,
        store_id=request.store_id,
        year=request.year,
    )

    if not base_demand:
        raise ValidationError(
            "No sales data found. Please seed data first using POST /data/seed"
        )

    # Calculate transfer
    config = request.config or DemandModelConfig()
    model = DemandModelService(config=config)

    result = model.estimate_demand_transfer(
        products=products,
        base_demand=base_demand,
        removed_skus=request.removed_skus,
        walk_rate=request.walk_rate,
    )

    return TransferResponse(
        new_demand=result["new_demand"],
        original_demand=base_demand,
        walked_away=result["walked_away"],
        transfers=result["transfers"],
        removed_skus=request.removed_skus,
    )


@router.post("/elasticity", response_model=ElasticityResponse)
async def calculate_elasticity(
    request: ElasticityRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> ElasticityResponse:
    """Calculate price or space elasticity for a product.

    **Price Elasticity:**
    new_demand = base_demand × (1 + elasticity × price_change_pct)
    Typical elasticity: -1.5 to -2.5 (demand decreases as price increases)

    **Space Elasticity:**
    new_demand = base_demand × (new_facings / base_facings)^elasticity
    Typical elasticity: 0.10 to 0.25 (demand increases with more shelf space)
    """
    logger.info(
        "Calculating elasticity",
        user_id=user.user_id,
        sku=request.sku,
        type=request.elasticity_type,
    )

    # Get product
    repo = ProductRepository(session)
    product = await repo.get_by_sku(request.sku)

    if not product:
        raise NotFoundError("Product", request.sku)

    # Get base demand
    base_demand_dict = await estimate_demand_from_sales(
        session,
        store_id=request.store_id,
        year=request.year,
    )
    base_demand = base_demand_dict.get(request.sku, 0.0)

    if base_demand == 0:
        raise ValidationError(
            f"No sales data found for SKU {request.sku}. Please seed data first."
        )

    model = DemandModelService()

    if request.elasticity_type == "price":
        if request.new_price is None:
            raise ValidationError("new_price is required for price elasticity")

        elasticity = request.price_elasticity or model.config.price_elasticity
        result = model.calculate_price_elasticity(
            base_demand=base_demand,
            base_price=float(product.price),
            new_price=request.new_price,
            elasticity=elasticity,
        )

        return ElasticityResponse(
            sku=request.sku,
            elasticity_type="price",
            base_demand=base_demand,
            new_demand=result["new_demand"],
            demand_change=result["demand_change"],
            demand_change_pct=result["demand_change_pct"],
            elasticity_used=elasticity,
            price_change_pct=result["price_change_pct"],
            base_price=float(product.price),
            new_price=request.new_price,
        )

    else:  # space elasticity
        if request.new_facings is None:
            raise ValidationError("new_facings is required for space elasticity")

        base_facings = request.base_facings or 2  # Default assumption
        elasticity = request.space_elasticity or float(product.space_elasticity)

        result = model.calculate_space_elasticity(
            base_demand=base_demand,
            base_facings=base_facings,
            new_facings=request.new_facings,
            elasticity=elasticity,
        )

        return ElasticityResponse(
            sku=request.sku,
            elasticity_type="space",
            base_demand=base_demand,
            new_demand=result["new_demand"],
            demand_change=result["demand_change"],
            demand_change_pct=result["demand_change_pct"],
            elasticity_used=elasticity,
            facing_change=result["facing_change"],
            base_facings=base_facings,
            new_facings=request.new_facings,
        )


@router.post("/cannibalization", response_model=CannibalizationResponse)
async def analyze_cannibalization(
    request: CannibalizationRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> CannibalizationResponse:
    """Analyze cannibalization when adding a new product.

    When a new product is added:
    1. Its demand is estimated based on similar existing products
    2. A portion (incremental_demand_pct) is truly incremental
    3. The rest is cannibalized from existing products
    4. Cannibalization is distributed based on similarity

    Returns the expected demand for the new product and impact on existing products.
    """
    logger.info("Analyzing cannibalization", user_id=user.user_id)

    # Load existing products
    products = await load_products_for_demand(session)

    if not products:
        raise ValidationError("No existing products found in database")

    # Get existing demand
    existing_demand = await estimate_demand_from_sales(
        session,
        store_id=request.store_id,
        year=request.year,
    )

    if not existing_demand:
        raise ValidationError(
            "No sales data found. Please seed data first using POST /data/seed"
        )

    # Create new product data
    try:
        new_product = ProductData(
            id=UUID("00000000-0000-0000-0000-000000000000"),  # Placeholder
            sku=request.new_product.get("sku", "NEW-SKU"),
            brand=request.new_product["brand"],
            brand_tier=request.new_product["brand_tier"],
            subcategory=request.new_product["subcategory"],
            size=request.new_product["size"],
            price=request.new_product["price"],
            price_tier=request.new_product.get("price_tier"),
            flavor=request.new_product.get("flavor"),
            space_elasticity=request.new_product.get("space_elasticity", 0.15),
        )
    except KeyError as e:
        raise ValidationError(f"Missing required field in new_product: {e}")

    # Calculate cannibalization
    config = request.config or DemandModelConfig()
    model = DemandModelService(config=config)

    result = model.calculate_cannibalization(
        existing_products=products,
        existing_demand=existing_demand,
        new_product=new_product,
        incremental_demand_pct=request.incremental_demand_pct,
    )

    return CannibalizationResponse(
        new_product_demand=result["new_product_demand"],
        cannibalized_demand=result["cannibalized_demand"],
        incremental_demand=result["incremental_demand"],
        adjusted_demand=result["adjusted_demand"],
        cannibalization_by_sku=result["cannibalization_by_sku"],
    )


@router.get("/switching-matrix", response_model=SwitchingMatrixResponse)
async def get_switching_matrix(
    user: CurrentUser,
    config: DemandModelConfig | None = None,
) -> SwitchingMatrixResponse:
    """Get consumer switching behavior probabilities.

    Based on research on consumer behavior when preferred items are unavailable:
    - 27% switch to same brand, different flavor
    - 23% switch to same brand, different size
    - 20% switch to different brand, same subcategory
    - 21% switch to different subcategory
    - 9% walk away (leave category)

    These probabilities inform the demand transfer calculations.
    """
    model = DemandModelService(config=config)
    behaviors = model.get_switching_probabilities()

    total = sum(b["probability"] for b in behaviors)

    return SwitchingMatrixResponse(
        switching_behaviors=behaviors,
        walk_rate=model.config.walk_rate,
        total_probability=total,
    )


@router.get("/config")
async def get_model_config(
    user: CurrentUser,
) -> DemandModelConfig:
    """Get the default demand model configuration.

    Returns the default parameters used for MNL demand modeling:
    - Brand tier utilities
    - Size utilities
    - Price and promotion coefficients
    - Elasticity parameters
    - Similarity weights for substitution
    """
    return DemandModelConfig()
