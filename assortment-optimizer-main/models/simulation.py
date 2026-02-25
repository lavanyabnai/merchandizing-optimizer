"""
Monte Carlo simulation engine for what-if analysis.
Optimized for performance with pre-computed matrices.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class ScenarioType(Enum):
    ADD_SKU = "add_sku"
    REMOVE_SKU = "remove_sku"
    CHANGE_FACINGS = "change_facings"
    CHANGE_PRICE = "change_price"


@dataclass
class SimulationConfig:
    """Configuration for Monte Carlo simulation."""
    n_trials: int = 5000
    demand_cv: float = 0.15  # Coefficient of variation for demand
    random_seed: Optional[int] = 42

    # Price elasticity range
    price_elasticity_mean: float = -1.8
    price_elasticity_std: float = 0.3

    # Space elasticity variation
    space_elasticity_std: float = 0.03

    # Walk rate variation
    walk_rate_mean: float = 0.09
    walk_rate_std: float = 0.02


@dataclass
class SimulationResult:
    """Results from Monte Carlo simulation."""
    scenario_type: str
    scenario_description: str

    # Revenue statistics
    revenue_mean: float
    revenue_std: float
    revenue_p5: float
    revenue_p50: float
    revenue_p95: float

    # Profit statistics
    profit_mean: float
    profit_std: float
    profit_p5: float
    profit_p50: float
    profit_p95: float

    # Change from baseline
    revenue_change: float
    revenue_change_pct: float
    profit_change: float
    profit_change_pct: float

    # Probability metrics
    prob_positive_change: float
    prob_exceed_target: Optional[float]

    # Raw trial data for histograms
    revenue_trials: np.ndarray
    profit_trials: np.ndarray


class MonteCarloSimulator:
    """
    Optimized Monte Carlo simulation engine for assortment what-if analysis.
    Pre-computes substitution matrices for performance.
    """

    def __init__(self, config: Optional[SimulationConfig] = None):
        self.config = config or SimulationConfig()
        if self.config.random_seed is not None:
            np.random.seed(self.config.random_seed)

    def _compute_similarity_matrix(self, products: pd.DataFrame) -> np.ndarray:
        """
        Pre-compute similarity matrix using vectorized operations.
        Much faster than row-by-row calculation.
        """
        n = len(products)
        similarity = np.zeros((n, n))

        # Convert columns to arrays for fast comparison
        brands = products['brand'].values
        sizes = products['size'].values
        price_tiers = products['price_tier'].values
        subcategories = products['subcategory'].values
        flavors = products['flavor'].values if 'flavor' in products.columns else np.array([''] * n)

        for i in range(n):
            # Vectorized comparison for row i against all products
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

    def _prepare_data(
        self,
        products: pd.DataFrame,
        sales_data: pd.DataFrame,
        store_id: Optional[int] = None
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, float, float, np.ndarray]:
        """
        Prepare all data needed for simulation.
        Returns: (base_demand, prices, margins, base_revenue, base_profit, sub_matrix)
        """
        if store_id is not None:
            sales_data = sales_data[sales_data['store_id'] == store_id]

        # Calculate average weekly demand per SKU
        sku_demand = sales_data.groupby('sku_id').agg({
            'units_sold': 'mean',
            'revenue': 'mean',
            'profit': 'mean'
        }).reset_index()

        # Align with products DataFrame
        merged = products[['sku_id', 'price', 'margin']].merge(
            sku_demand, on='sku_id', how='left'
        ).fillna(0)

        base_demand = merged['units_sold'].values.astype(float)
        prices = merged['price'].values.astype(float)
        margins = merged['margin'].values.astype(float)

        base_revenue = float((base_demand * prices).sum())
        base_profit = float((base_demand * margins).sum())

        # Pre-compute substitution matrix
        sub_matrix = self._compute_similarity_matrix(products)

        return base_demand, prices, margins, base_revenue, base_profit, sub_matrix

    def simulate_remove_sku(
        self,
        products: pd.DataFrame,
        sales_data: pd.DataFrame,
        sku_ids_to_remove: List[int],
        store_id: Optional[int] = None
    ) -> SimulationResult:
        """Simulate removing one or more SKUs."""
        # Prepare data (including pre-computed substitution matrix)
        base_demand, prices, margins, base_revenue, base_profit, sub_matrix = \
            self._prepare_data(products, sales_data, store_id)

        n_trials = self.config.n_trials
        n_products = len(products)

        # Get indices of removed SKUs
        sku_ids = products['sku_id'].values
        removed_mask = np.isin(sku_ids, sku_ids_to_remove)
        removed_indices = np.where(removed_mask)[0]

        if len(removed_indices) == 0:
            # Nothing to remove
            return self._create_result(
                scenario_type=ScenarioType.REMOVE_SKU.value,
                scenario_description="No SKUs removed",
                revenue_trials=np.full(n_trials, base_revenue),
                profit_trials=np.full(n_trials, base_profit),
                base_revenue=base_revenue,
                base_profit=base_profit
            )

        # Pre-sample all random values
        demand_noise = np.random.normal(1.0, self.config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        walk_rates = np.clip(
            np.random.normal(self.config.walk_rate_mean, self.config.walk_rate_std, n_trials),
            0.01, 0.30
        )

        # Vectorized simulation
        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        # Prepare substitution probabilities for removed products
        remaining_mask = ~removed_mask
        sub_probs = sub_matrix[removed_indices][:, remaining_mask]
        # Renormalize
        sub_probs_sum = sub_probs.sum(axis=1, keepdims=True)
        sub_probs_sum[sub_probs_sum == 0] = 1
        sub_probs = sub_probs / sub_probs_sum

        for trial in range(n_trials):
            trial_demand = base_demand * demand_noise[trial]
            walk_rate = walk_rates[trial]

            # Transfer demand from removed SKUs
            for i, idx in enumerate(removed_indices):
                removed_demand = trial_demand[idx]
                walked = removed_demand * walk_rate
                transfer = removed_demand - walked

                # Add transferred demand to remaining products
                trial_demand[remaining_mask] += transfer * sub_probs[i]
                trial_demand[idx] = 0

            revenue_trials[trial] = (trial_demand * prices).sum()
            profit_trials[trial] = (trial_demand * margins).sum()

        # Create description
        removed_names = products[products['sku_id'].isin(sku_ids_to_remove)]['name'].tolist()
        description = f"Remove: {', '.join(str(n)[:20] for n in removed_names[:2])}"
        if len(removed_names) > 2:
            description += f" (+{len(removed_names) - 2} more)"

        return self._create_result(
            scenario_type=ScenarioType.REMOVE_SKU.value,
            scenario_description=description,
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=base_revenue,
            base_profit=base_profit
        )

    def simulate_add_sku(
        self,
        products: pd.DataFrame,
        sales_data: pd.DataFrame,
        new_product: pd.Series,
        incremental_pct: float = 0.3,
        store_id: Optional[int] = None
    ) -> SimulationResult:
        """Simulate adding a new SKU."""
        base_demand, prices, margins, base_revenue, base_profit, _ = \
            self._prepare_data(products, sales_data, store_id)

        n_trials = self.config.n_trials
        n_products = len(products)

        # Calculate similarity with existing products (vectorized)
        new_brand = new_product.get('brand', '')
        new_size = new_product.get('size', '')
        new_price_tier = new_product.get('price_tier', '')
        new_subcat = new_product.get('subcategory', '')

        similarities = (
            (products['brand'].values == new_brand).astype(float) * 0.30 +
            (products['size'].values == new_size).astype(float) * 0.20 +
            (products['price_tier'].values == new_price_tier).astype(float) * 0.20 +
            (products['subcategory'].values == new_subcat).astype(float) * 0.20
        )

        # Estimate new product demand
        if similarities.sum() > 0:
            new_sku_demand = (similarities * base_demand).sum() / similarities.sum()
        else:
            new_sku_demand = base_demand.mean()

        new_price = float(new_product.get('price', 5.0))
        new_margin = float(new_product.get('margin', 1.5))

        # Cannibalization shares
        if similarities.sum() > 0:
            cannib_shares = similarities / similarities.sum()
        else:
            cannib_shares = np.ones(n_products) / n_products

        # Pre-sample random values
        demand_noise = np.random.normal(1.0, self.config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        new_demand_noise = np.random.normal(1.0, self.config.demand_cv, n_trials)
        new_demand_noise = np.maximum(new_demand_noise, 0)
        inc_pcts = np.clip(np.random.normal(incremental_pct, 0.1, n_trials), 0.1, 0.6)

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = base_demand * demand_noise[trial]
            trial_new_demand = new_sku_demand * new_demand_noise[trial]

            # Cannibalization
            cannibalized = trial_new_demand * (1 - inc_pcts[trial])
            trial_demand = np.maximum(trial_demand - cannib_shares * cannibalized, 0)

            existing_revenue = (trial_demand * prices).sum()
            existing_profit = (trial_demand * margins).sum()

            revenue_trials[trial] = existing_revenue + trial_new_demand * new_price
            profit_trials[trial] = existing_profit + trial_new_demand * new_margin

        description = f"Add: {new_product.get('name', 'New Product')}"

        return self._create_result(
            scenario_type=ScenarioType.ADD_SKU.value,
            scenario_description=description,
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=base_revenue,
            base_profit=base_profit
        )

    def simulate_change_facings(
        self,
        products: pd.DataFrame,
        sales_data: pd.DataFrame,
        assortment: pd.DataFrame,
        sku_id: int,
        new_facings: int,
        store_id: Optional[int] = None
    ) -> SimulationResult:
        """Simulate changing facings for a SKU."""
        base_demand, prices, margins, base_revenue, base_profit, _ = \
            self._prepare_data(products, sales_data, store_id)

        if store_id is not None:
            assortment = assortment[assortment['store_id'] == store_id]

        # Find SKU index
        sku_ids = products['sku_id'].values
        sku_mask = sku_ids == sku_id
        if not sku_mask.any():
            raise ValueError(f"SKU {sku_id} not found")

        sku_idx = np.where(sku_mask)[0][0]
        sku_row = products.iloc[sku_idx]

        # Get current facings
        current_facings_data = assortment[assortment['sku_id'] == sku_id]['current_facings'].values
        current_facings = int(current_facings_data[0]) if len(current_facings_data) > 0 else 2
        if current_facings == 0:
            current_facings = 2

        space_elasticity = float(sku_row.get('space_elasticity', 0.15))

        n_trials = self.config.n_trials
        n_products = len(products)

        # Pre-sample random values
        demand_noise = np.random.normal(1.0, self.config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        elasticity_noise = np.clip(
            np.random.normal(space_elasticity, self.config.space_elasticity_std, n_trials),
            0.05, 0.40
        )

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        facing_ratio = new_facings / current_facings

        for trial in range(n_trials):
            trial_demand = base_demand * demand_noise[trial]

            # Apply space elasticity
            trial_demand[sku_idx] *= facing_ratio ** elasticity_noise[trial]

            revenue_trials[trial] = (trial_demand * prices).sum()
            profit_trials[trial] = (trial_demand * margins).sum()

        description = f"Change facings: {current_facings} -> {new_facings}"

        return self._create_result(
            scenario_type=ScenarioType.CHANGE_FACINGS.value,
            scenario_description=description,
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=base_revenue,
            base_profit=base_profit
        )

    def simulate_change_price(
        self,
        products: pd.DataFrame,
        sales_data: pd.DataFrame,
        sku_id: int,
        new_price: float,
        store_id: Optional[int] = None
    ) -> SimulationResult:
        """Simulate changing price for a SKU."""
        base_demand, prices, margins, base_revenue, base_profit, _ = \
            self._prepare_data(products, sales_data, store_id)

        # Find SKU index
        sku_ids = products['sku_id'].values
        sku_mask = sku_ids == sku_id
        if not sku_mask.any():
            raise ValueError(f"SKU {sku_id} not found")

        sku_idx = np.where(sku_mask)[0][0]
        sku_row = products.iloc[sku_idx]

        current_price = float(sku_row['price'])
        cost = float(sku_row['cost'])

        if current_price <= 0:
            current_price = 1.0

        new_margin = new_price - cost
        price_ratio = new_price / current_price

        n_trials = self.config.n_trials
        n_products = len(products)

        # Pre-sample random values
        demand_noise = np.random.normal(1.0, self.config.demand_cv, (n_trials, n_products))
        demand_noise = np.maximum(demand_noise, 0)
        price_elasticities = np.random.normal(
            self.config.price_elasticity_mean,
            self.config.price_elasticity_std,
            n_trials
        )

        # Create modified price and margin arrays
        new_prices = prices.copy()
        new_prices[sku_idx] = new_price
        new_margins = margins.copy()
        new_margins[sku_idx] = new_margin

        revenue_trials = np.zeros(n_trials)
        profit_trials = np.zeros(n_trials)

        for trial in range(n_trials):
            trial_demand = base_demand * demand_noise[trial]

            # Apply price elasticity
            price_change_pct = (new_price - current_price) / current_price
            demand_change = 1 + price_elasticities[trial] * price_change_pct
            trial_demand[sku_idx] *= max(0, demand_change)

            revenue_trials[trial] = (trial_demand * new_prices).sum()
            profit_trials[trial] = (trial_demand * new_margins).sum()

        description = f"Change price: ${current_price:.2f} -> ${new_price:.2f}"

        return self._create_result(
            scenario_type=ScenarioType.CHANGE_PRICE.value,
            scenario_description=description,
            revenue_trials=revenue_trials,
            profit_trials=profit_trials,
            base_revenue=base_revenue,
            base_profit=base_profit
        )

    def _create_result(
        self,
        scenario_type: str,
        scenario_description: str,
        revenue_trials: np.ndarray,
        profit_trials: np.ndarray,
        base_revenue: float,
        base_profit: float,
        target_revenue: Optional[float] = None
    ) -> SimulationResult:
        """Create SimulationResult from trial data."""
        revenue_change = float(revenue_trials.mean() - base_revenue)
        profit_change = float(profit_trials.mean() - base_profit)

        prob_exceed_target = None
        if target_revenue is not None:
            prob_exceed_target = float((revenue_trials >= target_revenue).mean())

        return SimulationResult(
            scenario_type=scenario_type,
            scenario_description=scenario_description,
            revenue_mean=round(float(revenue_trials.mean()), 2),
            revenue_std=round(float(revenue_trials.std()), 2),
            revenue_p5=round(float(np.percentile(revenue_trials, 5)), 2),
            revenue_p50=round(float(np.percentile(revenue_trials, 50)), 2),
            revenue_p95=round(float(np.percentile(revenue_trials, 95)), 2),
            profit_mean=round(float(profit_trials.mean()), 2),
            profit_std=round(float(profit_trials.std()), 2),
            profit_p5=round(float(np.percentile(profit_trials, 5)), 2),
            profit_p50=round(float(np.percentile(profit_trials, 50)), 2),
            profit_p95=round(float(np.percentile(profit_trials, 95)), 2),
            revenue_change=round(revenue_change, 2),
            revenue_change_pct=round(revenue_change / base_revenue * 100, 2) if base_revenue > 0 else 0,
            profit_change=round(profit_change, 2),
            profit_change_pct=round(profit_change / base_profit * 100, 2) if base_profit > 0 else 0,
            prob_positive_change=round(float((profit_trials > base_profit).mean()), 3),
            prob_exceed_target=prob_exceed_target,
            revenue_trials=revenue_trials,
            profit_trials=profit_trials
        )
