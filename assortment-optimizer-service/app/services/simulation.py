"""
Monte Carlo simulation engine for what-if analysis.
Optimized for performance with vectorized NumPy operations and pre-computed matrices.
"""

import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import CachePrefix, CacheTTL, cache_get, cache_set, hash_args
from app.core.logging import get_logger
from app.db.models import ScenarioType
from app.db.repository import ProductRepository, SaleRepository, StoreRepository
from app.schemas.simulation import (
    DistributionStats,
    PercentileStats,
    SimulationConfig,
    SimulationResult,
)
from app.db.models import OptimizationStatus

logger = get_logger(__name__)


@dataclass
class ProductData:
    """Product data for simulation."""

    product_id: UUID
    sku: str
    name: str
    brand: str
    subcategory: str
    size: str
    price_tier: str
    flavor: str | None
    price: float
    cost: float
    margin: float
    space_elasticity: float


@dataclass
class SimulationData:
    """Prepared data for simulation."""

    base_demand: np.ndarray
    prices: np.ndarray
    margins: np.ndarray
    base_revenue: float
    base_profit: float
    substitution_matrix: np.ndarray
    products: list[ProductData]
    sku_to_idx: dict[str, int]


class SimulationService:
    """
    Optimized Monte Carlo simulation engine for assortment what-if analysis.
    Pre-computes substitution matrices for performance.
    Uses vectorized NumPy operations for fast simulation.
    """

    def __init__(self, session: AsyncSession, config: SimulationConfig | None = None):
        """Initialize simulation service.

        Args:
            session: Database session for data access.
            config: Simulation configuration (uses defaults if None).
        """
        self._session = session
        self._config = config or SimulationConfig()
        self._rng = np.random.default_rng(self._config.random_seed)
        self._product_repo = ProductRepository(session)
        self._sale_repo = SaleRepository(session)
        self._store_repo = StoreRepository(session)

    def _set_seed(self) -> None:
        """Reset random state if seed is set."""
        if self._config.random_seed is not None:
            self._rng = np.random.default_rng(self._config.random_seed)

    def _compute_similarity_matrix(self, products: list[ProductData]) -> np.ndarray:
        """
        Pre-compute similarity matrix using vectorized operations.
        Much faster than row-by-row calculation.

        Similarity scoring:
        - Same brand: 0.30
        - Same size: 0.20
        - Same price tier: 0.20
        - Same subcategory: 0.20
        - Same flavor: 0.10

        Returns:
            NxN substitution probability matrix (rows sum to 1).
        """
        n = len(products)
        if n == 0:
            return np.zeros((0, 0))

        similarity = np.zeros((n, n))

        # Extract attributes as arrays
        brands = np.array([p.brand for p in products])
        sizes = np.array([p.size for p in products])
        price_tiers = np.array([p.price_tier for p in products])
        subcategories = np.array([p.subcategory for p in products])
        flavors = np.array([p.flavor or "" for p in products])

        # Vectorized similarity calculation
        for i in range(n):
            same_brand = (brands == brands[i]).astype(float) * 0.30
            same_size = (sizes == sizes[i]).astype(float) * 0.20
            same_price = (price_tiers == price_tiers[i]).astype(float) * 0.20
            same_subcat = (subcategories == subcategories[i]).astype(float) * 0.20
            same_flavor = (flavors == flavors[i]).astype(float) * 0.10

            similarity[i] = same_brand + same_size + same_price + same_subcat + same_flavor
            similarity[i, i] = 0  # No self-similarity

        # Normalize rows to get substitution probabilities
        row_sums = similarity.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1  # Avoid division by zero
        substitution_matrix = similarity / row_sums

        return substitution_matrix

    async def _prepare_data(
        self,
        store_id: UUID | None = None,
        subcategories: list[str] | None = None,
    ) -> SimulationData:
        """
        Prepare all data needed for simulation.

        Args:
            store_id: Optional store to filter data for.
            subcategories: Optional list of subcategories to include.

        Returns:
            SimulationData with all prepared arrays and mappings.
        """
        # Try to get from cache
        cache_key = f"{CachePrefix.SIMULATION}:data:{hash_args(store_id, subcategories)}"
        cached = await cache_get(cache_key)
        if cached:
            logger.debug("Using cached simulation data", store_id=store_id)
            return self._deserialize_simulation_data(cached)

        # Get products
        db_products = await self._product_repo.list(is_active=True)

        if subcategories:
            db_products = [p for p in db_products if p.subcategory in subcategories]

        products = [
            ProductData(
                product_id=p.id,
                sku=p.sku,
                name=p.name,
                brand=p.brand,
                subcategory=p.subcategory,
                size=p.size,
                price_tier=p.price_tier or "Mid",
                flavor=p.flavor,
                price=float(p.price),
                cost=float(p.cost),
                margin=float(p.price - p.cost),
                space_elasticity=float(p.space_elasticity or 0.15),
            )
            for p in db_products
        ]

        sku_to_idx = {p.sku: i for i, p in enumerate(products)}
        n_products = len(products)

        # Get sales data to calculate base demand
        sales = await self._sale_repo.list(
            store_id=store_id,
            limit=100000,  # Get enough data
        )

        # Calculate average weekly demand per SKU
        demand_by_sku: dict[str, list[float]] = {p.sku: [] for p in products}
        revenue_by_sku: dict[str, list[float]] = {p.sku: [] for p in products}
        profit_by_sku: dict[str, list[float]] = {p.sku: [] for p in products}

        for sale in sales:
            sku = sale.product.sku if sale.product else None
            if sku and sku in demand_by_sku:
                demand_by_sku[sku].append(float(sale.units_sold))
                revenue_by_sku[sku].append(float(sale.revenue))
                profit = float(sale.revenue) - float(sale.units_sold) * products[sku_to_idx[sku]].cost
                profit_by_sku[sku].append(profit)

        # Create arrays
        base_demand = np.zeros(n_products)
        prices = np.array([p.price for p in products])
        margins = np.array([p.margin for p in products])

        for i, p in enumerate(products):
            if demand_by_sku[p.sku]:
                base_demand[i] = np.mean(demand_by_sku[p.sku])
            else:
                # Estimate from similar products or use default
                base_demand[i] = 50.0  # Default weekly demand

        base_revenue = float((base_demand * prices).sum())
        base_profit = float((base_demand * margins).sum())

        # Pre-compute substitution matrix
        sub_matrix = self._compute_similarity_matrix(products)

        sim_data = SimulationData(
            base_demand=base_demand,
            prices=prices,
            margins=margins,
            base_revenue=base_revenue,
            base_profit=base_profit,
            substitution_matrix=sub_matrix,
            products=products,
            sku_to_idx=sku_to_idx,
        )

        # Cache the prepared data
        await cache_set(
            cache_key,
            self._serialize_simulation_data(sim_data),
            ttl=CacheTTL.SIMULATION_DATA,
        )

        return sim_data

    def _serialize_simulation_data(self, data: SimulationData) -> dict[str, Any]:
        """Serialize SimulationData for caching."""
        return {
            "base_demand": data.base_demand.tolist(),
            "prices": data.prices.tolist(),
            "margins": data.margins.tolist(),
            "base_revenue": data.base_revenue,
            "base_profit": data.base_profit,
            "substitution_matrix": data.substitution_matrix.tolist(),
            "products": [
                {
                    "product_id": str(p.product_id),
                    "sku": p.sku,
                    "name": p.name,
                    "brand": p.brand,
                    "subcategory": p.subcategory,
                    "size": p.size,
                    "price_tier": p.price_tier,
                    "flavor": p.flavor,
                    "price": p.price,
                    "cost": p.cost,
                    "margin": p.margin,
                    "space_elasticity": p.space_elasticity,
                }
                for p in data.products
            ],
            "sku_to_idx": data.sku_to_idx,
        }

    def _deserialize_simulation_data(self, cached: dict[str, Any]) -> SimulationData:
        """Deserialize cached SimulationData."""
        products = [
            ProductData(
                product_id=UUID(p["product_id"]),
                sku=p["sku"],
                name=p["name"],
                brand=p["brand"],
                subcategory=p["subcategory"],
                size=p["size"],
                price_tier=p["price_tier"],
                flavor=p["flavor"],
                price=p["price"],
                cost=p["cost"],
                margin=p["margin"],
                space_elasticity=p["space_elasticity"],
            )
            for p in cached["products"]
        ]
        return SimulationData(
            base_demand=np.array(cached["base_demand"]),
            prices=np.array(cached["prices"]),
            margins=np.array(cached["margins"]),
            base_revenue=cached["base_revenue"],
            base_profit=cached["base_profit"],
            substitution_matrix=np.array(cached["substitution_matrix"]),
            products=products,
            sku_to_idx=cached["sku_to_idx"],
        )

    async def simulate_remove_sku(
        self,
        sku_ids: list[str],
        store_id: UUID | None = None,
        target_revenue: float | None = None,
    ) -> SimulationResult:
        """Simulate removing one or more SKUs from the assortment.

        Args:
            sku_ids: List of SKU identifiers to remove.
            store_id: Optional store to simulate for.
            target_revenue: Optional target revenue to calculate probability of exceeding.

        Returns:
            SimulationResult with full statistical analysis.
        """
        start_time = time.perf_counter()
        self._set_seed()

        data = await self._prepare_data(store_id=store_id)
        n_trials = self._config.num_trials
        n_products = len(data.products)

        # Get indices of removed SKUs
        removed_indices = [
            data.sku_to_idx[sku] for sku in sku_ids if sku in data.sku_to_idx
        ]

        if not removed_indices:
            # Nothing to remove - return baseline
            return self._create_baseline_result(
                scenario_type=ScenarioType.REMOVE_SKU,
                scenario_description="No SKUs removed (SKUs not found)",
                parameters={"sku_ids": sku_ids},
                data=data,
                n_trials=n_trials,
                start_time=start_time,
            )

        # Pre-sample all random values (vectorized)
        demand_noise = self._rng.normal(1.0, self._config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        walk_rates = np.clip(
            self._rng.normal(self._config.walk_rate_mean, self._config.walk_rate_std, n_trials),
            0.01, 0.30
        )

        # Prepare masks and substitution probabilities
        removed_mask = np.zeros(n_products, dtype=bool)
        removed_mask[removed_indices] = True
        remaining_mask = ~removed_mask

        # Pre-compute substitution probabilities for removed products to remaining products
        sub_probs = data.substitution_matrix[removed_indices][:, remaining_mask]
        sub_probs_sum = sub_probs.sum(axis=1, keepdims=True)
        sub_probs_sum[sub_probs_sum == 0] = 1
        sub_probs = sub_probs / sub_probs_sum

        # Vectorized simulation
        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = data.base_demand * demand_noise[trial]
            walk_rate = walk_rates[trial]

            # Transfer demand from removed SKUs
            for i, idx in enumerate(removed_indices):
                removed_demand = trial_demand[idx]
                walked = removed_demand * walk_rate
                transfer = removed_demand - walked

                # Add transferred demand to remaining products
                trial_demand[remaining_mask] += transfer * sub_probs[i]
                trial_demand[idx] = 0

            revenue_trials[trial] = (trial_demand * data.prices).sum()
            profit_trials[trial] = (trial_demand * data.margins).sum()

        # Create description
        removed_names = [
            data.products[data.sku_to_idx[sku]].name
            for sku in sku_ids if sku in data.sku_to_idx
        ]
        description = f"Remove: {', '.join(str(n)[:20] for n in removed_names[:2])}"
        if len(removed_names) > 2:
            description += f" (+{len(removed_names) - 2} more)"

        execution_time_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            scenario_type=ScenarioType.REMOVE_SKU,
            scenario_description=description,
            parameters={"sku_ids": sku_ids, "store_id": str(store_id) if store_id else None},
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=data.base_revenue,
            base_profit=data.base_profit,
            n_trials=n_trials,
            execution_time_ms=execution_time_ms,
            target_revenue=target_revenue,
        )

    async def simulate_add_sku(
        self,
        new_product: dict[str, Any],
        incremental_pct: float = 0.3,
        store_id: UUID | None = None,
    ) -> SimulationResult:
        """Simulate adding a new SKU to the assortment.

        Args:
            new_product: New product attributes.
            incremental_pct: Percentage of new product demand that is truly incremental.
            store_id: Optional store to simulate for.

        Returns:
            SimulationResult with full statistical analysis.
        """
        start_time = time.perf_counter()
        self._set_seed()

        data = await self._prepare_data(store_id=store_id)
        n_trials = self._config.num_trials
        n_products = len(data.products)

        # Extract new product attributes
        new_brand = new_product.get("brand", "")
        new_size = new_product.get("size", "")
        new_price_tier = new_product.get("price_tier", "")
        new_subcat = new_product.get("subcategory", "")
        new_price = float(new_product.get("price", 5.0))
        new_cost = float(new_product.get("cost", 2.5))
        new_margin = new_price - new_cost

        # Calculate similarity with existing products (vectorized)
        similarities = np.zeros(n_products)
        for i, p in enumerate(data.products):
            sim = 0.0
            if p.brand == new_brand:
                sim += 0.30
            if p.size == new_size:
                sim += 0.20
            if p.price_tier == new_price_tier:
                sim += 0.20
            if p.subcategory == new_subcat:
                sim += 0.20
            similarities[i] = sim

        # Estimate new product demand based on similar products
        if similarities.sum() > 0:
            new_sku_demand = (similarities * data.base_demand).sum() / similarities.sum()
        else:
            new_sku_demand = data.base_demand.mean() if n_products > 0 else 50.0

        # Cannibalization shares
        if similarities.sum() > 0:
            cannib_shares = similarities / similarities.sum()
        else:
            cannib_shares = np.ones(n_products) / n_products if n_products > 0 else np.array([])

        # Pre-sample random values
        demand_noise = self._rng.normal(1.0, self._config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        new_demand_noise = self._rng.normal(1.0, self._config.demand_cv, n_trials)
        new_demand_noise = np.maximum(new_demand_noise, 0)
        inc_pcts = np.clip(self._rng.normal(incremental_pct, 0.1, n_trials), 0.1, 0.6)

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = data.base_demand * demand_noise[trial]
            trial_new_demand = new_sku_demand * new_demand_noise[trial]

            # Cannibalization
            cannibalized = trial_new_demand * (1 - inc_pcts[trial])
            if n_products > 0:
                trial_demand = np.maximum(trial_demand - cannib_shares * cannibalized, 0)

            existing_revenue = (trial_demand * data.prices).sum()
            existing_profit = (trial_demand * data.margins).sum()

            revenue_trials[trial] = existing_revenue + trial_new_demand * new_price
            profit_trials[trial] = existing_profit + trial_new_demand * new_margin

        description = f"Add: {new_product.get('name', 'New Product')}"
        execution_time_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            scenario_type=ScenarioType.ADD_SKU,
            scenario_description=description,
            parameters={"new_product": new_product, "incremental_pct": incremental_pct},
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=data.base_revenue,
            base_profit=data.base_profit,
            n_trials=n_trials,
            execution_time_ms=execution_time_ms,
        )

    async def simulate_change_facings(
        self,
        sku: str,
        new_facings: int,
        current_facings: int | None = None,
        store_id: UUID | None = None,
    ) -> SimulationResult:
        """Simulate changing facings for a SKU.

        Args:
            sku: SKU identifier.
            new_facings: New number of facings.
            current_facings: Current facings (auto-detected if None).
            store_id: Optional store to simulate for.

        Returns:
            SimulationResult with full statistical analysis.
        """
        start_time = time.perf_counter()
        self._set_seed()

        data = await self._prepare_data(store_id=store_id)
        n_trials = self._config.num_trials
        n_products = len(data.products)

        if sku not in data.sku_to_idx:
            raise ValueError(f"SKU {sku} not found")

        sku_idx = data.sku_to_idx[sku]
        product = data.products[sku_idx]

        # Use provided current facings or default
        if current_facings is None or current_facings <= 0:
            current_facings = 2  # Default

        space_elasticity = product.space_elasticity

        # Pre-sample random values
        demand_noise = self._rng.normal(1.0, self._config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        elasticity_noise = np.clip(
            self._rng.normal(space_elasticity, self._config.space_elasticity_std, n_trials),
            0.05, 0.40
        )

        facing_ratio = new_facings / current_facings

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = data.base_demand * demand_noise[trial]

            # Apply space elasticity: demand = base * (new_facings/current_facings)^elasticity
            trial_demand[sku_idx] *= facing_ratio ** elasticity_noise[trial]

            revenue_trials[trial] = (trial_demand * data.prices).sum()
            profit_trials[trial] = (trial_demand * data.margins).sum()

        description = f"Change facings for {product.name}: {current_facings} -> {new_facings}"
        execution_time_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            scenario_type=ScenarioType.CHANGE_FACINGS,
            scenario_description=description,
            parameters={
                "sku": sku,
                "current_facings": current_facings,
                "new_facings": new_facings,
            },
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=data.base_revenue,
            base_profit=data.base_profit,
            n_trials=n_trials,
            execution_time_ms=execution_time_ms,
        )

    async def simulate_change_price(
        self,
        sku: str,
        new_price: float,
        store_id: UUID | None = None,
    ) -> SimulationResult:
        """Simulate changing price for a SKU.

        Args:
            sku: SKU identifier.
            new_price: New price.
            store_id: Optional store to simulate for.

        Returns:
            SimulationResult with full statistical analysis.
        """
        start_time = time.perf_counter()
        self._set_seed()

        data = await self._prepare_data(store_id=store_id)
        n_trials = self._config.num_trials
        n_products = len(data.products)

        if sku not in data.sku_to_idx:
            raise ValueError(f"SKU {sku} not found")

        sku_idx = data.sku_to_idx[sku]
        product = data.products[sku_idx]

        current_price = product.price
        if current_price <= 0:
            current_price = 1.0

        new_margin = new_price - product.cost

        # Pre-sample random values
        demand_noise = self._rng.normal(1.0, self._config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        price_elasticities = self._rng.normal(
            self._config.price_elasticity_mean,
            self._config.price_elasticity_std,
            n_trials
        )

        # Create modified price and margin arrays
        new_prices = data.prices.copy()
        new_prices[sku_idx] = new_price
        new_margins = data.margins.copy()
        new_margins[sku_idx] = new_margin

        price_change_pct = (new_price - current_price) / current_price

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = data.base_demand * demand_noise[trial]

            # Apply price elasticity: demand_change = 1 + elasticity * price_change_pct
            demand_change = 1 + price_elasticities[trial] * price_change_pct
            trial_demand[sku_idx] *= max(0, demand_change)

            revenue_trials[trial] = (trial_demand * new_prices).sum()
            profit_trials[trial] = (trial_demand * new_margins).sum()

        description = f"Change price for {product.name}: ${current_price:.2f} -> ${new_price:.2f}"
        execution_time_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            scenario_type=ScenarioType.CHANGE_PRICE,
            scenario_description=description,
            parameters={
                "sku": sku,
                "current_price": current_price,
                "new_price": new_price,
                "price_change_pct": round(price_change_pct * 100, 2),
            },
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=data.base_revenue,
            base_profit=data.base_profit,
            n_trials=n_trials,
            execution_time_ms=execution_time_ms,
        )

    def _create_baseline_result(
        self,
        scenario_type: ScenarioType,
        scenario_description: str,
        parameters: dict[str, Any],
        data: SimulationData,
        n_trials: int,
        start_time: float,
    ) -> SimulationResult:
        """Create a result for when no change occurs (baseline)."""
        revenue_trials = np.full(n_trials, data.base_revenue)
        profit_trials = np.full(n_trials, data.base_profit)
        execution_time_ms = int((time.perf_counter() - start_time) * 1000)

        return self._create_result(
            scenario_type=scenario_type,
            scenario_description=scenario_description,
            parameters=parameters,
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=data.base_revenue,
            base_profit=data.base_profit,
            n_trials=n_trials,
            execution_time_ms=execution_time_ms,
        )

    def _create_result(
        self,
        scenario_type: ScenarioType,
        scenario_description: str,
        parameters: dict[str, Any],
        revenue_trials: np.ndarray,
        profit_trials: np.ndarray,
        base_revenue: float,
        base_profit: float,
        n_trials: int,
        execution_time_ms: int,
        target_revenue: float | None = None,
    ) -> SimulationResult:
        """Create SimulationResult from trial data."""
        # Revenue statistics
        revenue_stats = DistributionStats(
            mean=round(float(revenue_trials.mean()), 2),
            std=round(float(revenue_trials.std()), 2),
            min=round(float(revenue_trials.min()), 2),
            max=round(float(revenue_trials.max()), 2),
            median=round(float(np.median(revenue_trials)), 2),
        )

        revenue_percentiles = PercentileStats(
            p5=round(float(np.percentile(revenue_trials, 5)), 2),
            p10=round(float(np.percentile(revenue_trials, 10)), 2),
            p25=round(float(np.percentile(revenue_trials, 25)), 2),
            p50=round(float(np.percentile(revenue_trials, 50)), 2),
            p75=round(float(np.percentile(revenue_trials, 75)), 2),
            p90=round(float(np.percentile(revenue_trials, 90)), 2),
            p95=round(float(np.percentile(revenue_trials, 95)), 2),
        )

        # Profit statistics
        profit_stats = DistributionStats(
            mean=round(float(profit_trials.mean()), 2),
            std=round(float(profit_trials.std()), 2),
            min=round(float(profit_trials.min()), 2),
            max=round(float(profit_trials.max()), 2),
            median=round(float(np.median(profit_trials)), 2),
        )

        profit_percentiles = PercentileStats(
            p5=round(float(np.percentile(profit_trials, 5)), 2),
            p10=round(float(np.percentile(profit_trials, 10)), 2),
            p25=round(float(np.percentile(profit_trials, 25)), 2),
            p50=round(float(np.percentile(profit_trials, 50)), 2),
            p75=round(float(np.percentile(profit_trials, 75)), 2),
            p90=round(float(np.percentile(profit_trials, 90)), 2),
            p95=round(float(np.percentile(profit_trials, 95)), 2),
        )

        # Change from baseline
        revenue_change = float(revenue_trials.mean() - base_revenue)
        profit_change = float(profit_trials.mean() - base_profit)

        revenue_change_pct = (
            round(revenue_change / base_revenue * 100, 2) if base_revenue > 0 else 0.0
        )
        profit_change_pct = (
            round(profit_change / base_profit * 100, 2) if base_profit > 0 else 0.0
        )

        # Probability metrics
        prob_positive = float((profit_trials > base_profit).mean())
        prob_negative = float((profit_trials < base_profit).mean())
        prob_breakeven = float((profit_trials >= base_profit).mean())

        prob_exceed_target = None
        if target_revenue is not None:
            prob_exceed_target = float((revenue_trials >= target_revenue).mean())

        # Confidence intervals
        profit_ci_90 = (
            round(float(np.percentile(profit_trials, 5)), 2),
            round(float(np.percentile(profit_trials, 95)), 2),
        )
        profit_ci_95 = (
            round(float(np.percentile(profit_trials, 2.5)), 2),
            round(float(np.percentile(profit_trials, 97.5)), 2),
        )
        revenue_ci_95 = (
            round(float(np.percentile(revenue_trials, 2.5)), 2),
            round(float(np.percentile(revenue_trials, 97.5)), 2),
        )

        return SimulationResult(
            run_id=uuid4(),
            scenario_type=scenario_type,
            scenario_description=scenario_description,
            status=OptimizationStatus.COMPLETED,
            parameters=parameters,
            config=self._config,
            baseline_revenue=round(base_revenue, 2),
            baseline_profit=round(base_profit, 2),
            revenue_stats=revenue_stats,
            revenue_percentiles=revenue_percentiles,
            revenue_change=round(revenue_change, 2),
            revenue_change_pct=revenue_change_pct,
            profit_stats=profit_stats,
            profit_percentiles=profit_percentiles,
            profit_change=round(profit_change, 2),
            profit_change_pct=profit_change_pct,
            probability_positive=round(prob_positive, 4),
            probability_negative=round(prob_negative, 4),
            probability_breakeven=round(prob_breakeven, 4),
            probability_exceed_target=round(prob_exceed_target, 4) if prob_exceed_target else None,
            profit_ci_90=profit_ci_90,
            profit_ci_95=profit_ci_95,
            revenue_ci_95=revenue_ci_95,
            trials_completed=n_trials,
            execution_time_ms=execution_time_ms,
            created_at=datetime.now(timezone.utc),
        )

    async def run_simulation(
        self,
        scenario_type: ScenarioType,
        parameters: dict[str, Any],
        store_id: UUID | None = None,
    ) -> SimulationResult:
        """Run a simulation based on scenario type.

        Args:
            scenario_type: Type of scenario to simulate.
            parameters: Scenario-specific parameters.
            store_id: Optional store to simulate for.

        Returns:
            SimulationResult with full statistical analysis.
        """
        if scenario_type == ScenarioType.REMOVE_SKU:
            sku_ids = parameters.get("sku_ids", [])
            # Convert UUIDs to strings if needed
            sku_ids = [str(s) if not isinstance(s, str) else s for s in sku_ids]
            target_revenue = parameters.get("target_revenue")
            return await self.simulate_remove_sku(
                sku_ids=sku_ids,
                store_id=store_id,
                target_revenue=target_revenue,
            )

        elif scenario_type == ScenarioType.ADD_SKU:
            new_product = parameters.get("new_product", parameters)
            incremental_pct = parameters.get("incremental_pct", 0.3)
            return await self.simulate_add_sku(
                new_product=new_product,
                incremental_pct=incremental_pct,
                store_id=store_id,
            )

        elif scenario_type == ScenarioType.CHANGE_FACINGS:
            sku = parameters.get("sku") or str(parameters.get("sku_id", ""))
            new_facings = parameters.get("new_facings", 2)
            current_facings = parameters.get("current_facings")
            return await self.simulate_change_facings(
                sku=sku,
                new_facings=new_facings,
                current_facings=current_facings,
                store_id=store_id,
            )

        elif scenario_type == ScenarioType.CHANGE_PRICE:
            sku = parameters.get("sku") or str(parameters.get("sku_id", ""))
            new_price = parameters.get("new_price")
            if new_price is None:
                raise ValueError("new_price is required for CHANGE_PRICE scenario")
            return await self.simulate_change_price(
                sku=sku,
                new_price=new_price,
                store_id=store_id,
            )

        else:
            raise ValueError(f"Unknown scenario type: {scenario_type}")
