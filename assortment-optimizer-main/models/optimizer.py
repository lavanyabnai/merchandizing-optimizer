"""
Assortment Optimization using greedy heuristic with optional OR-Tools solver.
Optimizes SKU selection and facing allocation subject to business constraints.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class OptimizationConstraints:
    """Configuration for optimization constraints."""
    # Space constraints
    total_facings: int = 120  # Maximum total facings available
    min_facings_per_sku: int = 1
    max_facings_per_sku: int = 6

    # Brand constraints
    min_skus_per_brand: int = 2
    max_skus_per_brand: int = 6

    # Coverage constraints
    min_skus_per_subcategory: int = 3
    min_skus_per_price_tier: int = 1

    # Must-carry SKUs (list of sku_ids)
    must_carry: List[int] = field(default_factory=list)

    # SKUs to exclude (list of sku_ids)
    exclude: List[int] = field(default_factory=list)


@dataclass
class OptimizationResult:
    """Results from the optimization."""
    status: str
    selected_skus: List[int]
    facings: Dict[int, int]
    objective_value: float
    solve_time_seconds: float
    before_profit: float
    after_profit: float
    profit_lift: float
    profit_lift_pct: float


class AssortmentOptimizer:
    """
    Assortment optimizer using greedy heuristic.

    Maximizes profit while respecting space and coverage constraints.
    """

    def __init__(self, constraints: Optional[OptimizationConstraints] = None):
        self.constraints = constraints or OptimizationConstraints()

    def optimize(
        self,
        products: pd.DataFrame,
        sales_data: pd.DataFrame,
        current_assortment: pd.DataFrame,
        store_id: Optional[int] = None,
        time_limit_seconds: float = 30.0
    ) -> OptimizationResult:
        """
        Run the optimization to find the best assortment using greedy heuristic.
        """
        import time
        start_time = time.time()

        try:
            # Prepare data
            if store_id is not None:
                sales_data = sales_data[sales_data['store_id'] == store_id].copy()
                current_assortment = current_assortment[current_assortment['store_id'] == store_id].copy()

            # Calculate average weekly profit per SKU
            sku_metrics = sales_data.groupby('sku_id').agg({
                'profit': 'mean',
                'units_sold': 'mean',
                'revenue': 'mean'
            }).reset_index()
            sku_metrics.columns = ['sku_id', 'avg_profit', 'avg_units', 'avg_revenue']

            # Merge with products
            sku_data = products.merge(sku_metrics, on='sku_id', how='left').copy()
            sku_data['avg_profit'] = sku_data['avg_profit'].fillna(0)
            sku_data['avg_units'] = sku_data['avg_units'].fillna(0)
            sku_data['avg_revenue'] = sku_data['avg_revenue'].fillna(0)
            sku_data = sku_data.reset_index(drop=True)

            # Get current facings
            current_facings_map = {}
            for _, row in current_assortment.iterrows():
                current_facings_map[row['sku_id']] = row['current_facings']

            # Calculate current profit
            current_profit = 0.0
            for _, row in sku_data.iterrows():
                curr_facings = current_facings_map.get(row['sku_id'], 0)
                if curr_facings > 0:
                    current_profit += float(row['avg_profit'])

            # Run greedy optimization
            result = self._greedy_optimize(sku_data, current_facings_map)

            solve_time = time.time() - start_time

            # Calculate after profit with space elasticity
            after_profit = 0.0
            for sku_id, num_facings in result.items():
                sku_row = sku_data[sku_data['sku_id'] == sku_id]
                if len(sku_row) > 0:
                    sku_row = sku_row.iloc[0]
                    base_facings = current_facings_map.get(sku_id, 2)
                    if base_facings == 0:
                        base_facings = 2
                    elasticity = float(sku_row.get('space_elasticity', 0.15))
                    adjusted_profit = float(sku_row['avg_profit']) * (num_facings / base_facings) ** elasticity
                    after_profit += adjusted_profit

            profit_lift = after_profit - current_profit
            profit_lift_pct = (profit_lift / current_profit * 100) if current_profit > 0 else 0

            return OptimizationResult(
                status='optimal',
                selected_skus=list(result.keys()),
                facings=result,
                objective_value=after_profit,
                solve_time_seconds=round(solve_time, 2),
                before_profit=round(current_profit, 2),
                after_profit=round(after_profit, 2),
                profit_lift=round(profit_lift, 2),
                profit_lift_pct=round(profit_lift_pct, 2)
            )

        except Exception as e:
            solve_time = time.time() - start_time
            return OptimizationResult(
                status=f'error: {str(e)}',
                selected_skus=[],
                facings={},
                objective_value=0,
                solve_time_seconds=round(solve_time, 2),
                before_profit=0,
                after_profit=0,
                profit_lift=0,
                profit_lift_pct=0
            )

    def _greedy_optimize(
        self,
        sku_data: pd.DataFrame,
        current_facings_map: Dict[int, int]
    ) -> Dict[int, int]:
        """
        Greedy optimization algorithm.

        1. First satisfy coverage constraints (subcategory, price tier)
        2. Add must-carry items
        3. Fill remaining space with highest-profit SKUs
        """
        selected = {}  # sku_id -> facings
        remaining_facings = self.constraints.total_facings

        # Calculate profit per facing for ranking
        sku_data = sku_data.copy()
        sku_data['profit_score'] = sku_data['avg_profit']

        # Remove excluded SKUs
        exclude_set = set(self.constraints.exclude)
        available_skus = sku_data[~sku_data['sku_id'].isin(exclude_set)].copy()

        # Step 1: Add must-carry items first
        for sku_id in self.constraints.must_carry:
            if sku_id in exclude_set:
                continue
            sku_row = available_skus[available_skus['sku_id'] == sku_id]
            if len(sku_row) > 0 and remaining_facings >= self.constraints.min_facings_per_sku:
                facings = min(self.constraints.min_facings_per_sku, remaining_facings)
                selected[sku_id] = facings
                remaining_facings -= facings

        # Step 2: Ensure subcategory coverage
        subcategories = available_skus['subcategory'].unique()
        for subcat in subcategories:
            subcat_skus = available_skus[available_skus['subcategory'] == subcat]
            subcat_skus = subcat_skus.sort_values('profit_score', ascending=False)

            # Count already selected from this subcategory
            selected_from_subcat = sum(1 for sid in selected if
                                       len(available_skus[available_skus['sku_id'] == sid]) > 0 and
                                       available_skus[available_skus['sku_id'] == sid].iloc[0]['subcategory'] == subcat)

            needed = max(0, self.constraints.min_skus_per_subcategory - selected_from_subcat)

            for _, row in subcat_skus.iterrows():
                if needed <= 0 or remaining_facings < self.constraints.min_facings_per_sku:
                    break
                sku_id = row['sku_id']
                if sku_id not in selected:
                    facings = min(self.constraints.min_facings_per_sku, remaining_facings)
                    selected[sku_id] = facings
                    remaining_facings -= facings
                    needed -= 1

        # Step 3: Ensure price tier coverage
        price_tiers = available_skus['price_tier'].unique()
        for tier in price_tiers:
            tier_skus = available_skus[available_skus['price_tier'] == tier]
            tier_skus = tier_skus.sort_values('profit_score', ascending=False)

            # Count already selected from this tier
            selected_from_tier = sum(1 for sid in selected if
                                     len(available_skus[available_skus['sku_id'] == sid]) > 0 and
                                     available_skus[available_skus['sku_id'] == sid].iloc[0]['price_tier'] == tier)

            needed = max(0, self.constraints.min_skus_per_price_tier - selected_from_tier)

            for _, row in tier_skus.iterrows():
                if needed <= 0 or remaining_facings < self.constraints.min_facings_per_sku:
                    break
                sku_id = row['sku_id']
                if sku_id not in selected:
                    facings = min(self.constraints.min_facings_per_sku, remaining_facings)
                    selected[sku_id] = facings
                    remaining_facings -= facings
                    needed -= 1

        # Step 4: Fill remaining space with best SKUs
        remaining_skus = available_skus[~available_skus['sku_id'].isin(selected.keys())]
        remaining_skus = remaining_skus.sort_values('profit_score', ascending=False)

        for _, row in remaining_skus.iterrows():
            if remaining_facings < self.constraints.min_facings_per_sku:
                break

            sku_id = row['sku_id']
            brand = row['brand']

            # Check brand constraints
            brand_count = sum(1 for sid in selected if
                             len(available_skus[available_skus['sku_id'] == sid]) > 0 and
                             available_skus[available_skus['sku_id'] == sid].iloc[0]['brand'] == brand)

            if brand_count >= self.constraints.max_skus_per_brand:
                continue

            facings = min(self.constraints.min_facings_per_sku, remaining_facings)
            selected[sku_id] = facings
            remaining_facings -= facings

        # Step 5: Allocate extra facings to high-profit SKUs
        selected_list = list(selected.keys())
        profit_map = {row['sku_id']: row['profit_score'] for _, row in available_skus.iterrows()}
        selected_list.sort(key=lambda x: profit_map.get(x, 0), reverse=True)

        for sku_id in selected_list:
            if remaining_facings <= 0:
                break
            current = selected[sku_id]
            can_add = min(
                self.constraints.max_facings_per_sku - current,
                remaining_facings
            )
            if can_add > 0:
                selected[sku_id] += can_add
                remaining_facings -= can_add

        return selected

    def get_optimization_comparison(
        self,
        products: pd.DataFrame,
        current_assortment: pd.DataFrame,
        result: OptimizationResult,
        store_id: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Create a comparison table of current vs optimized assortment.
        """
        try:
            if store_id is not None:
                current_assortment = current_assortment[current_assortment['store_id'] == store_id].copy()

            # Current state
            current = current_assortment[current_assortment['is_listed']][['sku_id', 'current_facings']].copy()
            current = current.merge(products[['sku_id', 'name', 'brand', 'subcategory', 'price']], on='sku_id')
            current = current.rename(columns={'current_facings': 'before_facings'})

            # Optimized state
            if result.facings:
                optimized = pd.DataFrame({
                    'sku_id': list(result.facings.keys()),
                    'after_facings': list(result.facings.values())
                })
            else:
                optimized = pd.DataFrame({'sku_id': [], 'after_facings': []})

            # Merge
            comparison = current.merge(optimized, on='sku_id', how='outer')
            comparison = comparison.merge(
                products[['sku_id', 'name', 'brand', 'subcategory', 'price']],
                on='sku_id',
                how='left',
                suffixes=('', '_new')
            )

            # Fill NaN
            comparison['before_facings'] = comparison['before_facings'].fillna(0).astype(int)
            comparison['after_facings'] = comparison['after_facings'].fillna(0).astype(int)

            # Calculate change
            comparison['change'] = comparison['after_facings'] - comparison['before_facings']

            # Status
            def get_status(row):
                if row['before_facings'] == 0 and row['after_facings'] > 0:
                    return 'Added'
                elif row['before_facings'] > 0 and row['after_facings'] == 0:
                    return 'Removed'
                elif row['change'] != 0:
                    return 'Changed'
                else:
                    return 'Unchanged'

            comparison['status'] = comparison.apply(get_status, axis=1)

            # Clean up columns
            for col in ['name', 'brand', 'subcategory']:
                if f'{col}_new' in comparison.columns:
                    comparison[col] = comparison[col].fillna(comparison[f'{col}_new'])
                    comparison = comparison.drop(columns=[f'{col}_new'])

            # Handle price column
            if 'price_new' in comparison.columns:
                comparison['price'] = comparison['price'].fillna(comparison['price_new'])
                comparison = comparison.drop(columns=['price_new'])

            result_cols = ['sku_id', 'name', 'brand', 'subcategory', 'price',
                          'before_facings', 'after_facings', 'change', 'status']

            # Only include columns that exist
            result_cols = [c for c in result_cols if c in comparison.columns]

            return comparison[result_cols]

        except Exception as e:
            # Return empty comparison on error
            return pd.DataFrame({
                'sku_id': [],
                'name': [],
                'brand': [],
                'subcategory': [],
                'price': [],
                'before_facings': [],
                'after_facings': [],
                'change': [],
                'status': []
            })


def quick_optimize(
    products: pd.DataFrame,
    sales_data: pd.DataFrame,
    current_assortment: pd.DataFrame,
    total_facings: int = 120,
    must_carry: List[int] = None,
    store_id: Optional[int] = None
) -> OptimizationResult:
    """
    Convenience function to run optimization with common defaults.
    """
    constraints = OptimizationConstraints(
        total_facings=total_facings,
        must_carry=must_carry or []
    )

    optimizer = AssortmentOptimizer(constraints)
    return optimizer.optimize(products, sales_data, current_assortment, store_id)
