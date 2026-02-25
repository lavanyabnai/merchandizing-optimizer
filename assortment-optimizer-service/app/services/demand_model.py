"""
Multinomial Logit (MNL) based transferable demand model.

Implements choice probability calculation and demand substitution logic.
This is a port of the original Streamlit app's demand model to work with
the FastAPI microservice and SQLAlchemy models.
"""

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any
from uuid import UUID

import numpy as np
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import get_logger
from app.db.models import AssortmentProduct, AssortmentSale, BrandTier

logger = get_logger(__name__)


class DemandModelConfig(BaseModel):
    """Configuration for the MNL demand model."""

    # Utility coefficients
    beta_intercept: float = Field(default=1.0, description="Base utility intercept")
    beta_price: float = Field(default=-0.5, description="Price coefficient (negative)")
    beta_promo: float = Field(default=0.8, description="Promotion boost coefficient")

    # Brand tier utilities
    brand_utilities: dict[str, float] = Field(
        default={
            "Premium": 0.8,
            "National A": 0.6,
            "National B": 0.3,
            "Store Brand": 0.0,
        },
        description="Utility by brand tier",
    )

    # Size utilities
    size_utilities: dict[str, float] = Field(
        default={
            "12oz": 0.3,
            "20oz": 0.5,
            "1L": 0.4,
            "2L": 0.2,
        },
        description="Utility by product size",
    )

    # Walk-away rate when preferred item unavailable
    walk_rate: float = Field(
        default=0.09, ge=0, le=1, description="Walk-away rate (9% based on research)"
    )

    # Elasticity parameters
    price_elasticity: float = Field(
        default=-1.8, le=0, description="Price elasticity (typically -1.5 to -2.5)"
    )
    space_elasticity: float = Field(
        default=0.15, ge=0, le=1, description="Space elasticity (typically 0.10-0.25)"
    )

    # Similarity weights for substitution
    brand_similarity_weight: float = Field(default=0.30, description="Brand match weight")
    size_similarity_weight: float = Field(default=0.20, description="Size match weight")
    price_tier_similarity_weight: float = Field(
        default=0.20, description="Price tier match weight"
    )
    subcategory_similarity_weight: float = Field(
        default=0.20, description="Subcategory match weight"
    )
    flavor_similarity_weight: float = Field(default=0.10, description="Flavor match weight")


@dataclass
class ProductData:
    """Lightweight product data for demand calculations."""

    id: UUID
    sku: str
    brand: str
    brand_tier: str
    subcategory: str
    size: str
    price: float
    price_tier: str | None
    flavor: str | None
    space_elasticity: float = 0.15
    on_promotion: bool = False
    current_facings: int = 1

    @classmethod
    def from_model(
        cls,
        product: AssortmentProduct,
        on_promotion: bool = False,
        current_facings: int = 1,
    ) -> "ProductData":
        """Create from SQLAlchemy model."""
        return cls(
            id=product.id,
            sku=product.sku,
            brand=product.brand,
            brand_tier=product.brand_tier.value,
            subcategory=product.subcategory,
            size=product.size,
            price=float(product.price),
            price_tier=product.price_tier,
            flavor=product.flavor,
            space_elasticity=float(product.space_elasticity),
            on_promotion=on_promotion,
            current_facings=current_facings,
        )


class DemandModelService:
    """
    MNL-based demand model with substitution logic.

    Utility = β₀ + β_brand[tier] + β_price × (price/5) + β_size[size] + β_promo × promo
    P(choose i) = exp(U_i) / Σexp(U_j)
    """

    def __init__(
        self,
        config: DemandModelConfig | None = None,
        cache_client: Any | None = None,
    ):
        """Initialize the demand model service.

        Args:
            config: Model configuration parameters.
            cache_client: Optional Redis client for caching.
        """
        self.config = config or DemandModelConfig()
        self.cache = cache_client
        self._cache_ttl = 3600  # 1 hour

    def calculate_utility(
        self,
        product: ProductData,
        on_promotion: bool | None = None,
    ) -> float:
        """Calculate utility for a single product using MNL formula.

        U_i = β₀ + β_brand[tier] + β_price × (price/5) + β_size[size] + β_promo × promo

        Args:
            product: Product data for utility calculation.
            on_promotion: Override promotion status (uses product default if None).

        Returns:
            Utility value.
        """
        utility = self.config.beta_intercept

        # Brand utility
        brand_tier = product.brand_tier
        utility += self.config.brand_utilities.get(brand_tier, 0)

        # Price utility (normalized around $5)
        utility += self.config.beta_price * (product.price / 5.0)

        # Size utility
        utility += self.config.size_utilities.get(product.size, 0)

        # Promotion utility
        is_on_promo = on_promotion if on_promotion is not None else product.on_promotion
        if is_on_promo:
            utility += self.config.beta_promo

        return utility

    def predict_choice_probabilities(
        self,
        products: list[ProductData],
        available_mask: np.ndarray | None = None,
    ) -> dict[str, float]:
        """Calculate choice probabilities for available products using MNL.

        P(choose i) = exp(U_i) / Σexp(U_j)

        Args:
            products: List of product data.
            available_mask: Boolean array indicating available products.

        Returns:
            Dictionary mapping SKU to choice probability.
        """
        n = len(products)
        if n == 0:
            return {}

        if available_mask is None:
            available_mask = np.ones(n, dtype=bool)

        # Calculate utilities for all products
        utilities = np.array([
            self.calculate_utility(p) if available_mask[i] else -np.inf
            for i, p in enumerate(products)
        ])

        # Softmax with numerical stability
        max_util = np.max(utilities[available_mask]) if any(available_mask) else 0
        utilities = utilities - max_util
        exp_utilities = np.exp(utilities)
        exp_utilities[~available_mask] = 0

        total = exp_utilities.sum()
        if total > 0:
            probabilities = exp_utilities / total
        else:
            probabilities = np.zeros(n)

        return {products[i].sku: float(probabilities[i]) for i in range(n)}

    def calculate_similarity(
        self,
        product1: ProductData,
        product2: ProductData,
    ) -> float:
        """Calculate similarity score between two products.

        Used for demand substitution calculations.

        Similarity scoring:
        - Same brand: 0.30 weight
        - Same size: 0.20 weight
        - Same price tier: 0.20 weight
        - Same subcategory: 0.20 weight
        - Same flavor: 0.10 weight

        Args:
            product1: First product.
            product2: Second product.

        Returns:
            Similarity score between 0 and 1.
        """
        similarity = 0.0

        if product1.brand == product2.brand:
            similarity += self.config.brand_similarity_weight

        if product1.size == product2.size:
            similarity += self.config.size_similarity_weight

        if product1.price_tier == product2.price_tier:
            similarity += self.config.price_tier_similarity_weight

        if product1.subcategory == product2.subcategory:
            similarity += self.config.subcategory_similarity_weight

        if product1.flavor and product2.flavor and product1.flavor == product2.flavor:
            similarity += self.config.flavor_similarity_weight

        return similarity

    def calculate_substitution_matrix(
        self,
        products: list[ProductData],
    ) -> np.ndarray:
        """Build substitution matrix based on product similarity.

        Args:
            products: List of product data.

        Returns:
            NxN matrix where element [i,j] is substitution probability from i to j.
        """
        n = len(products)
        if n == 0:
            return np.array([])

        matrix = np.zeros((n, n))

        for i, prod_i in enumerate(products):
            similarities = []
            for j, prod_j in enumerate(products):
                if i != j:
                    sim = self.calculate_similarity(prod_i, prod_j)
                    similarities.append((j, sim))

            # Normalize similarities to get substitution probabilities
            total_sim = sum(s for _, s in similarities)
            if total_sim > 0:
                for j, sim in similarities:
                    matrix[i, j] = sim / total_sim

        return matrix

    async def calculate_substitution_matrix_cached(
        self,
        products: list[ProductData],
    ) -> np.ndarray:
        """Calculate substitution matrix with Redis caching.

        Args:
            products: List of product data.

        Returns:
            NxN substitution matrix.
        """
        if not self.cache:
            return self.calculate_substitution_matrix(products)

        # Generate cache key from product SKUs
        skus = sorted([p.sku for p in products])
        cache_key = f"subst_matrix:{hashlib.md5(json.dumps(skus).encode()).hexdigest()}"

        try:
            # Try to get from cache
            cached = await self.cache.get(cache_key)
            if cached:
                logger.debug("Substitution matrix cache hit", key=cache_key)
                return np.array(json.loads(cached))
        except Exception as e:
            logger.warning("Cache read failed", error=str(e))

        # Calculate and cache
        matrix = self.calculate_substitution_matrix(products)

        try:
            await self.cache.setex(
                cache_key,
                self._cache_ttl,
                json.dumps(matrix.tolist()),
            )
            logger.debug("Cached substitution matrix", key=cache_key)
        except Exception as e:
            logger.warning("Cache write failed", error=str(e))

        return matrix

    def estimate_demand_transfer(
        self,
        products: list[ProductData],
        base_demand: dict[str, float],
        removed_skus: list[str],
        walk_rate: float | None = None,
    ) -> dict[str, Any]:
        """Calculate how demand transfers when SKUs are removed.

        Args:
            products: List of all products.
            base_demand: Dictionary mapping SKU to base demand.
            removed_skus: List of SKUs being removed.
            walk_rate: Override walk-away rate (default from config).

        Returns:
            Dictionary with:
            - new_demand: Updated demand by SKU
            - walked_away: Total demand that walked away
            - transfers: Detailed transfer breakdown
        """
        if walk_rate is None:
            walk_rate = self.config.walk_rate

        # Build SKU to index mapping
        sku_to_idx = {p.sku: i for i, p in enumerate(products)}

        # Initialize demand array
        n = len(products)
        demand = np.zeros(n)
        for sku, d in base_demand.items():
            if sku in sku_to_idx:
                demand[sku_to_idx[sku]] = d

        # Get indices of removed SKUs
        removed_indices = [
            sku_to_idx[sku] for sku in removed_skus if sku in sku_to_idx
        ]

        if not removed_indices:
            return {
                "new_demand": base_demand.copy(),
                "walked_away": 0.0,
                "transfers": [],
            }

        # Build substitution matrix
        sub_matrix = self.calculate_substitution_matrix(products)

        # Create mask for remaining products
        remaining_mask = np.ones(n, dtype=bool)
        remaining_mask[removed_indices] = False

        total_walked = 0.0
        transfers = []

        for idx in removed_indices:
            removed_demand = demand[idx]
            removed_sku = products[idx].sku

            # Calculate walked-away demand
            walked = removed_demand * walk_rate
            total_walked += walked

            # Remaining demand to transfer
            transfer_demand = removed_demand - walked

            # Get substitution probabilities for remaining products
            sub_probs = sub_matrix[idx].copy()
            sub_probs[~remaining_mask] = 0

            # Renormalize
            if sub_probs.sum() > 0:
                sub_probs = sub_probs / sub_probs.sum()

            # Track transfers
            for j, prob in enumerate(sub_probs):
                if prob > 0:
                    transferred = transfer_demand * prob
                    demand[j] += transferred
                    transfers.append({
                        "from_sku": removed_sku,
                        "to_sku": products[j].sku,
                        "amount": float(transferred),
                        "probability": float(prob),
                    })

            # Zero out removed product
            demand[idx] = 0

        # Convert back to dictionary
        new_demand = {
            products[i].sku: float(demand[i])
            for i in range(n)
            if demand[i] > 0 or products[i].sku not in removed_skus
        }

        return {
            "new_demand": new_demand,
            "walked_away": float(total_walked),
            "transfers": transfers,
        }

    def calculate_price_elasticity(
        self,
        base_demand: float,
        base_price: float,
        new_price: float,
        elasticity: float | None = None,
    ) -> dict[str, float]:
        """Apply price elasticity to calculate demand change.

        Formula: new_demand = base_demand × (1 + elasticity × price_change_pct)

        Args:
            base_demand: Base demand at base price.
            base_price: Original price.
            new_price: New price.
            elasticity: Price elasticity (default from config).

        Returns:
            Dictionary with demand change details.
        """
        if elasticity is None:
            elasticity = self.config.price_elasticity

        if base_price <= 0:
            return {
                "new_demand": base_demand,
                "demand_change": 0.0,
                "demand_change_pct": 0.0,
                "price_change_pct": 0.0,
            }

        price_change_pct = (new_price - base_price) / base_price
        demand_change_pct = elasticity * price_change_pct
        new_demand = max(0, base_demand * (1 + demand_change_pct))

        return {
            "new_demand": new_demand,
            "demand_change": new_demand - base_demand,
            "demand_change_pct": demand_change_pct,
            "price_change_pct": price_change_pct,
        }

    def calculate_space_elasticity(
        self,
        base_demand: float,
        base_facings: int,
        new_facings: int,
        elasticity: float | None = None,
    ) -> dict[str, float]:
        """Apply space elasticity using power function.

        Formula: new_demand = base_demand × (new_facings / base_facings)^elasticity

        Args:
            base_demand: Base demand with base facings.
            base_facings: Original number of facings.
            new_facings: New number of facings.
            elasticity: Space elasticity (default from config).

        Returns:
            Dictionary with demand change details.
        """
        if elasticity is None:
            elasticity = self.config.space_elasticity

        if base_facings <= 0:
            return {
                "new_demand": 0.0 if new_facings <= 0 else base_demand,
                "demand_change": 0.0,
                "demand_change_pct": 0.0,
                "facing_change": new_facings - base_facings,
            }

        if new_facings <= 0:
            return {
                "new_demand": 0.0,
                "demand_change": -base_demand,
                "demand_change_pct": -1.0,
                "facing_change": -base_facings,
            }

        new_demand = base_demand * (new_facings / base_facings) ** elasticity

        return {
            "new_demand": new_demand,
            "demand_change": new_demand - base_demand,
            "demand_change_pct": (new_demand - base_demand) / base_demand if base_demand > 0 else 0,
            "facing_change": new_facings - base_facings,
        }

    def calculate_cannibalization(
        self,
        existing_products: list[ProductData],
        existing_demand: dict[str, float],
        new_product: ProductData,
        incremental_demand_pct: float = 0.3,
    ) -> dict[str, Any]:
        """Calculate cannibalization when adding a new product.

        Args:
            existing_products: List of existing products.
            existing_demand: Current demand by SKU.
            new_product: New product being added.
            incremental_demand_pct: Percent of new product demand that's incremental.

        Returns:
            Dictionary with cannibalization details.
        """
        n = len(existing_products)
        if n == 0:
            return {
                "new_product_demand": 0.0,
                "cannibalized_demand": 0.0,
                "incremental_demand": 0.0,
                "adjusted_demand": existing_demand.copy(),
                "cannibalization_by_sku": {},
            }

        # Calculate similarity with existing products
        similarities = np.array([
            self.calculate_similarity(new_product, p) for p in existing_products
        ])

        # Get demand array
        demand_array = np.array([
            existing_demand.get(p.sku, 0.0) for p in existing_products
        ])

        # Estimate new product demand based on similar products
        weighted_demand = (similarities * demand_array).sum()
        if similarities.sum() > 0:
            new_product_demand = weighted_demand / similarities.sum()
        else:
            new_product_demand = demand_array.mean() if n > 0 else 0.0

        # Calculate cannibalization from existing products
        cannibalized = new_product_demand * (1 - incremental_demand_pct)
        incremental = new_product_demand * incremental_demand_pct

        # Distribute cannibalization proportionally to similarity
        if similarities.sum() > 0:
            cannib_shares = similarities / similarities.sum()
        else:
            cannib_shares = np.ones(n) / n

        # Calculate adjusted demand
        cannib_amounts = cannib_shares * cannibalized
        adjusted_demand_array = np.maximum(demand_array - cannib_amounts, 0)

        # Build result
        adjusted_demand = {
            existing_products[i].sku: float(adjusted_demand_array[i])
            for i in range(n)
        }
        adjusted_demand[new_product.sku] = new_product_demand

        cannibalization_by_sku = {
            existing_products[i].sku: float(cannib_amounts[i])
            for i in range(n)
            if cannib_amounts[i] > 0
        }

        return {
            "new_product_demand": new_product_demand,
            "cannibalized_demand": cannibalized,
            "incremental_demand": incremental,
            "adjusted_demand": adjusted_demand,
            "cannibalization_by_sku": cannibalization_by_sku,
        }

    def get_switching_probabilities(self) -> list[dict[str, Any]]:
        """Get the consumer switching behavior probabilities.

        Based on research:
        - 27% switch variety (same brand, different flavor)
        - 23% switch size
        - 20% switch brand (different brand, same subcategory)
        - 21% switch subcategory
        - 9% walk away

        Returns:
            List of switching behavior entries.
        """
        return [
            {
                "switch_type": "Same Brand, Different Flavor",
                "probability": 0.27,
                "description": "Customer stays with preferred brand but chooses different flavor",
            },
            {
                "switch_type": "Same Brand, Different Size",
                "probability": 0.23,
                "description": "Customer stays with preferred brand but chooses different size",
            },
            {
                "switch_type": "Different Brand, Same Subcategory",
                "probability": 0.20,
                "description": "Customer switches to competitor brand within same subcategory",
            },
            {
                "switch_type": "Different Subcategory",
                "probability": 0.21,
                "description": "Customer switches to different beverage type entirely",
            },
            {
                "switch_type": "Walk Away",
                "probability": self.config.walk_rate,
                "description": "Customer leaves without purchasing from category",
            },
        ]


async def estimate_demand_from_sales(
    session: AsyncSession,
    store_id: UUID | None = None,
    year: int | None = None,
) -> dict[str, float]:
    """Estimate weekly demand per SKU from historical sales.

    Args:
        session: Database session.
        store_id: Optional store filter.
        year: Optional year filter.

    Returns:
        Dictionary mapping SKU to average weekly demand.
    """
    from sqlalchemy import func

    query = (
        select(
            AssortmentProduct.sku,
            func.avg(AssortmentSale.units_sold).label("avg_weekly_demand"),
        )
        .join(AssortmentSale, AssortmentSale.product_id == AssortmentProduct.id)
        .group_by(AssortmentProduct.sku)
    )

    if store_id:
        query = query.where(AssortmentSale.store_id == store_id)
    if year:
        query = query.where(AssortmentSale.year == year)

    result = await session.execute(query)
    rows = result.all()

    return {row.sku: float(row.avg_weekly_demand) for row in rows}


async def load_products_for_demand(
    session: AsyncSession,
    store_id: UUID | None = None,
    active_only: bool = True,
) -> list[ProductData]:
    """Load products for demand calculations.

    Args:
        session: Database session.
        store_id: Optional store filter (for promotion/facing data).
        active_only: Only include active products.

    Returns:
        List of ProductData objects.
    """
    query = select(AssortmentProduct)
    if active_only:
        query = query.where(AssortmentProduct.is_active == True)
    query = query.order_by(AssortmentProduct.sku)

    result = await session.execute(query)
    products = result.scalars().all()

    return [ProductData.from_model(p) for p in products]
