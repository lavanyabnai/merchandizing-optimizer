"""
Retail metrics calculations for assortment analysis.
Includes GMROI, sales per linear foot, inventory turns, and productivity metrics.
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional, Tuple


def calculate_gmroi(gross_margin: float, average_inventory_cost: float) -> float:
    """
    Calculate Gross Margin Return on Inventory Investment (GMROI).

    GMROI = Gross Margin / Average Inventory Cost

    Args:
        gross_margin: Total gross margin in dollars
        average_inventory_cost: Average inventory cost in dollars

    Returns:
        GMROI ratio (e.g., 2.5 means $2.50 margin per $1 inventory)
    """
    if average_inventory_cost <= 0:
        return 0.0
    return round(gross_margin / average_inventory_cost, 2)


def calculate_sales_per_linear_foot(
    total_sales: float,
    linear_feet: float
) -> float:
    """
    Calculate sales productivity per linear foot of shelf space.

    Args:
        total_sales: Total sales in dollars
        linear_feet: Total linear feet of shelf space

    Returns:
        Sales per linear foot
    """
    if linear_feet <= 0:
        return 0.0
    return round(total_sales / linear_feet, 2)


def calculate_inventory_turns(
    cost_of_goods_sold: float,
    average_inventory: float
) -> float:
    """
    Calculate inventory turnover ratio.

    Turns = Cost of Goods Sold / Average Inventory

    Args:
        cost_of_goods_sold: Total COGS for the period
        average_inventory: Average inventory value

    Returns:
        Inventory turns (higher is generally better for FMCG)
    """
    if average_inventory <= 0:
        return 0.0
    return round(cost_of_goods_sold / average_inventory, 2)


def calculate_productivity_metrics(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    store_id: Optional[int] = None,
    weeks: int = 52
) -> Dict[str, float]:
    """
    Calculate comprehensive productivity metrics for a store or all stores.

    Args:
        sales_df: Sales data with columns [store_id, sku_id, week, units_sold, revenue, profit]
        products_df: Product data with columns [sku_id, cost, price, width_inches]
        assortment_df: Assortment data with columns [store_id, sku_id, current_facings, is_listed]
        store_id: Optional store filter (None for all stores)
        weeks: Number of weeks in the data

    Returns:
        Dictionary with metrics: total_revenue, total_profit, margin_pct,
        gmroi, sales_per_linear_foot, inventory_turns, sku_count
    """
    # Filter by store if specified
    if store_id is not None:
        sales_df = sales_df[sales_df['store_id'] == store_id]
        assortment_df = assortment_df[assortment_df['store_id'] == store_id]

    # Aggregate sales
    total_revenue = sales_df['revenue'].sum()
    total_profit = sales_df['profit'].sum()

    # Calculate margin percentage
    margin_pct = (total_profit / total_revenue * 100) if total_revenue > 0 else 0

    # Calculate COGS
    total_cogs = total_revenue - total_profit

    # Estimate average inventory (assume 2-week supply)
    avg_weekly_cogs = total_cogs / weeks
    avg_inventory = avg_weekly_cogs * 2

    # Calculate GMROI
    gmroi = calculate_gmroi(total_profit, avg_inventory)

    # Calculate linear feet
    listed_assortment = assortment_df[assortment_df['is_listed']]
    if len(listed_assortment) > 0:
        # Merge with products to get widths
        merged = listed_assortment.merge(products_df[['sku_id', 'width_inches']], on='sku_id')
        total_width_inches = (merged['current_facings'] * merged['width_inches']).sum()
        linear_feet = total_width_inches / 12  # Convert to feet
    else:
        linear_feet = 0

    sales_per_lf = calculate_sales_per_linear_foot(total_revenue, linear_feet)

    # Calculate inventory turns
    turns = calculate_inventory_turns(total_cogs, avg_inventory)

    # Count active SKUs
    sku_count = listed_assortment['sku_id'].nunique()

    return {
        'total_revenue': round(total_revenue, 2),
        'total_profit': round(total_profit, 2),
        'margin_pct': round(margin_pct, 2),
        'gmroi': gmroi,
        'sales_per_linear_foot': sales_per_lf,
        'inventory_turns': turns,
        'sku_count': sku_count,
        'linear_feet': round(linear_feet, 1)
    }


def calculate_category_metrics(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    group_by: str = 'subcategory'
) -> pd.DataFrame:
    """
    Calculate metrics grouped by category attribute.

    Args:
        sales_df: Sales data
        products_df: Product data
        group_by: Column to group by (subcategory, brand, brand_tier, price_tier)

    Returns:
        DataFrame with metrics per group
    """
    # Merge sales with products
    merged = sales_df.merge(products_df[['sku_id', group_by, 'cost', 'margin']], on='sku_id')

    # Aggregate by group
    grouped = merged.groupby(group_by).agg({
        'revenue': 'sum',
        'profit': 'sum',
        'units_sold': 'sum',
        'sku_id': 'nunique'
    }).reset_index()

    grouped.columns = [group_by, 'revenue', 'profit', 'units_sold', 'sku_count']

    # Calculate derived metrics
    grouped['margin_pct'] = (grouped['profit'] / grouped['revenue'] * 100).round(2)
    grouped['revenue_share'] = (grouped['revenue'] / grouped['revenue'].sum() * 100).round(2)

    return grouped.sort_values('revenue', ascending=False)


def calculate_sku_performance(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    store_id: Optional[int] = None
) -> pd.DataFrame:
    """
    Calculate performance metrics for each SKU.

    Args:
        sales_df: Sales data
        products_df: Product data
        assortment_df: Assortment data
        store_id: Optional store filter

    Returns:
        DataFrame with SKU-level performance metrics
    """
    # Filter by store if specified
    if store_id is not None:
        sales_df = sales_df[sales_df['store_id'] == store_id]
        assortment_df = assortment_df[assortment_df['store_id'] == store_id]

    # Aggregate sales by SKU
    sku_sales = sales_df.groupby('sku_id').agg({
        'units_sold': 'sum',
        'revenue': 'sum',
        'profit': 'sum'
    }).reset_index()

    # Merge with product info
    result = sku_sales.merge(products_df, on='sku_id')

    # Get current facings
    facings = assortment_df[assortment_df['is_listed']][['sku_id', 'current_facings']]
    if store_id is None:
        # Average facings across stores
        facings = facings.groupby('sku_id')['current_facings'].mean().reset_index()

    result = result.merge(facings, on='sku_id', how='left')
    result['current_facings'] = result['current_facings'].fillna(0)

    # Calculate productivity metrics
    result['revenue_per_facing'] = np.where(
        result['current_facings'] > 0,
        result['revenue'] / result['current_facings'],
        0
    ).round(2)

    result['profit_per_facing'] = np.where(
        result['current_facings'] > 0,
        result['profit'] / result['current_facings'],
        0
    ).round(2)

    return result.sort_values('revenue', ascending=False)


def calculate_week_over_week_change(
    sales_df: pd.DataFrame,
    metric: str = 'revenue'
) -> pd.DataFrame:
    """
    Calculate week-over-week changes in sales metrics.

    Args:
        sales_df: Sales data
        metric: Metric to analyze ('revenue', 'units_sold', 'profit')

    Returns:
        DataFrame with weekly totals and WoW change
    """
    weekly = sales_df.groupby('week')[metric].sum().reset_index()
    weekly['wow_change'] = weekly[metric].pct_change() * 100
    weekly['wow_change'] = weekly['wow_change'].round(2)

    return weekly
