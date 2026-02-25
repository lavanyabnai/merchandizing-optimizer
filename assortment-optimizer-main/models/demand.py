"""
Multinomial Logit (MNL) based transferable demand model.
Implements choice probability calculation and demand substitution logic.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class DemandModelParams:
    """Parameters for the MNL demand model."""
    # Utility coefficients
    beta_intercept: float = 1.0
    beta_price: float = -0.5  # Negative - higher price reduces utility
    beta_promo: float = 0.8   # Positive - promotion increases utility

    # Brand tier utilities
    brand_utilities: Dict[str, float] = None

    # Size utilities
    size_utilities: Dict[str, float] = None

    # Walk-away rate when preferred item unavailable
    walk_rate: float = 0.09

    def __post_init__(self):
        if self.brand_utilities is None:
            self.brand_utilities = {
                'Premium': 0.8,
                'National A': 0.6,
                'National B': 0.3,
                'Store Brand': 0.0
            }
        if self.size_utilities is None:
            self.size_utilities = {
                '12oz': 0.3,
                '20oz': 0.5,
                '1L': 0.4,
                '2L': 0.2
            }


class TransferableDemandModel:
    """
    MNL-based demand model with substitution logic.

    Utility = beta_0 + beta_brand[brand] + beta_price*price + beta_size[size] + beta_promo*on_promo
    P(choose i) = exp(U_i) / sum(exp(U_j))
    """

    def __init__(self, params: Optional[DemandModelParams] = None):
        self.params = params or DemandModelParams()

    def calculate_utility(
        self,
        product: pd.Series,
        on_promo: bool = False
    ) -> float:
        """
        Calculate utility for a single product.

        Args:
            product: Product row with brand_tier, price, size columns
            on_promo: Whether product is on promotion

        Returns:
            Utility value
        """
        utility = self.params.beta_intercept

        # Brand utility
        brand_tier = product.get('brand_tier', 'National A')
        utility += self.params.brand_utilities.get(brand_tier, 0)

        # Price utility (normalized around $5)
        price = product.get('price', 5.0)
        utility += self.params.beta_price * (price / 5.0)

        # Size utility
        size = product.get('size', '20oz')
        utility += self.params.size_utilities.get(size, 0)

        # Promotion utility
        if on_promo:
            utility += self.params.beta_promo

        return utility

    def calculate_choice_probabilities(
        self,
        products: pd.DataFrame,
        available_mask: Optional[np.ndarray] = None
    ) -> np.ndarray:
        """
        Calculate choice probabilities for available products using MNL.

        Args:
            products: DataFrame with product attributes
            available_mask: Boolean array indicating available products

        Returns:
            Array of choice probabilities
        """
        if available_mask is None:
            available_mask = np.ones(len(products), dtype=bool)

        utilities = np.array([
            self.calculate_utility(row) if available_mask[i] else -np.inf
            for i, (_, row) in enumerate(products.iterrows())
        ])

        # Softmax with numerical stability
        utilities = utilities - np.max(utilities[available_mask])
        exp_utilities = np.exp(utilities)
        exp_utilities[~available_mask] = 0

        total = exp_utilities.sum()
        if total > 0:
            return exp_utilities / total
        else:
            return np.zeros(len(products))

    def calculate_similarity(
        self,
        product1: pd.Series,
        product2: pd.Series
    ) -> float:
        """
        Calculate similarity score between two products.
        Used for demand substitution calculations.

        Similarity scoring:
        - Same brand: 0.30
        - Same size: 0.20
        - Same price tier: 0.20
        - Same subcategory: 0.20
        - Same flavor: 0.10

        Args:
            product1: First product
            product2: Second product

        Returns:
            Similarity score between 0 and 1
        """
        similarity = 0.0

        if product1.get('brand') == product2.get('brand'):
            similarity += 0.30
        if product1.get('size') == product2.get('size'):
            similarity += 0.20
        if product1.get('price_tier') == product2.get('price_tier'):
            similarity += 0.20
        if product1.get('subcategory') == product2.get('subcategory'):
            similarity += 0.20
        if product1.get('flavor') == product2.get('flavor'):
            similarity += 0.10

        return similarity

    def calculate_substitution_matrix(
        self,
        products: pd.DataFrame
    ) -> np.ndarray:
        """
        Build substitution matrix based on product similarity.

        Args:
            products: DataFrame with product attributes

        Returns:
            NxN matrix where element [i,j] is substitution probability from i to j
        """
        n = len(products)
        matrix = np.zeros((n, n))

        for i, (_, prod_i) in enumerate(products.iterrows()):
            similarities = []
            for j, (_, prod_j) in enumerate(products.iterrows()):
                if i != j:
                    sim = self.calculate_similarity(prod_i, prod_j)
                    similarities.append((j, sim))

            # Normalize similarities to get substitution probabilities
            total_sim = sum(s for _, s in similarities)
            if total_sim > 0:
                for j, sim in similarities:
                    matrix[i, j] = sim / total_sim

        return matrix

    def calculate_demand_transfer(
        self,
        products: pd.DataFrame,
        base_demand: np.ndarray,
        removed_sku_ids: List[int],
        walk_rate: Optional[float] = None
    ) -> Tuple[np.ndarray, float]:
        """
        Calculate how demand transfers when SKUs are removed.

        Args:
            products: DataFrame with products
            base_demand: Array of base demand for each product
            removed_sku_ids: List of SKU IDs being removed
            walk_rate: Override walk-away rate (default from params)

        Returns:
            Tuple of (new demand array, total walked-away demand)
        """
        if walk_rate is None:
            walk_rate = self.params.walk_rate

        new_demand = base_demand.copy()
        total_walked = 0.0

        # Get indices of removed SKUs
        sku_to_idx = {row['sku_id']: i for i, (_, row) in enumerate(products.iterrows())}
        removed_indices = [sku_to_idx[sku_id] for sku_id in removed_sku_ids if sku_id in sku_to_idx]

        if not removed_indices:
            return new_demand, total_walked

        # Build substitution matrix
        sub_matrix = self.calculate_substitution_matrix(products)

        # Create mask for remaining products
        remaining_mask = np.ones(len(products), dtype=bool)
        remaining_mask[removed_indices] = False

        for idx in removed_indices:
            removed_demand = new_demand[idx]

            # Calculate walked-away demand
            walked = removed_demand * walk_rate
            total_walked += walked

            # Remaining demand to transfer
            transfer_demand = removed_demand - walked

            # Get substitution probabilities for remaining products
            sub_probs = sub_matrix[idx].copy()
            sub_probs[~remaining_mask] = 0  # Can't substitute to removed products

            # Renormalize
            if sub_probs.sum() > 0:
                sub_probs = sub_probs / sub_probs.sum()

            # Transfer demand
            new_demand += transfer_demand * sub_probs

            # Zero out removed product
            new_demand[idx] = 0

        return new_demand, total_walked

    def calculate_cannibalization(
        self,
        products: pd.DataFrame,
        base_demand: np.ndarray,
        new_product: pd.Series,
        incremental_demand_pct: float = 0.3
    ) -> Tuple[np.ndarray, float]:
        """
        Calculate cannibalization when adding a new product.

        Args:
            products: Existing products DataFrame
            base_demand: Current demand array
            new_product: New product being added
            incremental_demand_pct: Percent of new product demand that's incremental

        Returns:
            Tuple of (adjusted demand array with new product appended, new product demand)
        """
        # Calculate similarity with existing products
        similarities = np.array([
            self.calculate_similarity(new_product, row)
            for _, row in products.iterrows()
        ])

        # Estimate new product demand based on similar products
        weighted_demand = (similarities * base_demand).sum()
        if similarities.sum() > 0:
            new_demand = weighted_demand / similarities.sum()
        else:
            new_demand = base_demand.mean()

        # Calculate cannibalization from existing products
        cannibalized = new_demand * (1 - incremental_demand_pct)

        # Distribute cannibalization proportionally to similarity
        if similarities.sum() > 0:
            cannib_shares = similarities / similarities.sum()
        else:
            cannib_shares = np.ones(len(products)) / len(products)

        adjusted_demand = base_demand - (cannib_shares * cannibalized)
        adjusted_demand = np.maximum(adjusted_demand, 0)  # Floor at zero

        return adjusted_demand, new_demand

    def apply_price_elasticity(
        self,
        base_demand: float,
        base_price: float,
        new_price: float,
        elasticity: float = -1.8
    ) -> float:
        """
        Apply price elasticity to calculate demand change.

        Args:
            base_demand: Base demand at base price
            base_price: Original price
            new_price: New price
            elasticity: Price elasticity (typically -1.5 to -2.5)

        Returns:
            Adjusted demand
        """
        if base_price <= 0:
            return base_demand

        price_change_pct = (new_price - base_price) / base_price
        demand_change_pct = elasticity * price_change_pct
        new_demand = base_demand * (1 + demand_change_pct)

        return max(0, new_demand)

    def apply_space_elasticity(
        self,
        base_demand: float,
        base_facings: int,
        new_facings: int,
        elasticity: float = 0.15
    ) -> float:
        """
        Apply space elasticity using power function.

        Adjusted_Sales = Base_Sales * (Facings/Base_Facings)^elasticity

        Args:
            base_demand: Base demand with base facings
            base_facings: Original number of facings
            new_facings: New number of facings
            elasticity: Space elasticity (typically 0.10-0.25)

        Returns:
            Adjusted demand
        """
        if base_facings <= 0 or new_facings <= 0:
            return 0 if new_facings <= 0 else base_demand

        return base_demand * (new_facings / base_facings) ** elasticity


def estimate_demand_from_sales(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame
) -> pd.DataFrame:
    """
    Estimate weekly demand per SKU from historical sales.

    Args:
        sales_df: Historical sales data
        products_df: Product data

    Returns:
        DataFrame with sku_id and avg_weekly_demand columns
    """
    # Calculate average weekly units sold per SKU
    weekly_demand = sales_df.groupby('sku_id').agg({
        'units_sold': 'mean'
    }).reset_index()

    weekly_demand.columns = ['sku_id', 'avg_weekly_demand']

    return weekly_demand.merge(
        products_df[['sku_id', 'name', 'subcategory', 'brand']],
        on='sku_id'
    )
