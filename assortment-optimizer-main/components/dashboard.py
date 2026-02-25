"""
KPI Dashboard component for Streamlit app.
Displays key metrics, trends, and top performers with explanatory tooltips.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional, Dict

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.metrics import (
    calculate_productivity_metrics,
    calculate_category_metrics,
    calculate_sku_performance,
    calculate_week_over_week_change
)


# Tooltip definitions for KPIs
KPI_TOOLTIPS = {
    'revenue': "Total sales revenue across all products. Higher is better - indicates strong category performance.",
    'profit': "Gross profit after cost of goods. The margin percentage shows profitability efficiency.",
    'gmroi': "Gross Margin Return on Inventory Investment. Values >2.0 are good; >3.0 is excellent. Shows how efficiently inventory generates profit.",
    'sku_count': "Number of active SKUs in the assortment. Balance breadth (customer choice) vs. complexity (inventory costs).",
    'sales_per_lf': "Revenue generated per linear foot of shelf space. Higher values indicate better space productivity.",
    'turns': "How many times inventory sells and replenishes annually. FMCG beverages typically target 12-24 turns.",
    'linear_feet': "Total shelf space allocated to this category. Optimize to balance sales potential vs. store constraints.",
    'avg_rev_sku': "Average revenue per SKU. Low values may indicate underperforming products that could be delisted."
}


def render_kpi_cards(metrics: Dict[str, float]):
    """Render KPI metric cards with tooltips."""

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            label="Total Revenue",
            value=f"${metrics['total_revenue']:,.0f}",
            delta=None,
            help=KPI_TOOLTIPS['revenue']
        )

    with col2:
        st.metric(
            label="Total Profit",
            value=f"${metrics['total_profit']:,.0f}",
            delta=f"{metrics['margin_pct']:.1f}% margin",
            help=KPI_TOOLTIPS['profit']
        )

    with col3:
        st.metric(
            label="GMROI",
            value=f"{metrics['gmroi']:.2f}x",
            delta=None,
            help=KPI_TOOLTIPS['gmroi']
        )

    with col4:
        st.metric(
            label="Active SKUs",
            value=f"{metrics['sku_count']}",
            delta=None,
            help=KPI_TOOLTIPS['sku_count']
        )

    # Second row of metrics
    col5, col6, col7, col8 = st.columns(4)

    with col5:
        st.metric(
            label="Sales/Linear Foot",
            value=f"${metrics['sales_per_linear_foot']:,.0f}",
            delta=None,
            help=KPI_TOOLTIPS['sales_per_lf']
        )

    with col6:
        st.metric(
            label="Inventory Turns",
            value=f"{metrics['inventory_turns']:.1f}x",
            delta=None,
            help=KPI_TOOLTIPS['turns']
        )

    with col7:
        st.metric(
            label="Linear Feet",
            value=f"{metrics['linear_feet']:.1f} ft",
            delta=None,
            help=KPI_TOOLTIPS['linear_feet']
        )

    with col8:
        avg_rev_per_sku = metrics['total_revenue'] / max(metrics['sku_count'], 1)
        st.metric(
            label="Avg Rev/SKU",
            value=f"${avg_rev_per_sku:,.0f}",
            delta=None,
            help=KPI_TOOLTIPS['avg_rev_sku']
        )


def render_sales_trend(sales_df: pd.DataFrame):
    """Render weekly sales trend chart with insights."""
    weekly = sales_df.groupby('week').agg({
        'revenue': 'sum',
        'profit': 'sum',
        'units_sold': 'sum'
    }).reset_index()

    # Calculate insights
    peak_week = weekly.loc[weekly['revenue'].idxmax(), 'week']
    low_week = weekly.loc[weekly['revenue'].idxmin(), 'week']
    seasonality = (weekly['revenue'].max() - weekly['revenue'].min()) / weekly['revenue'].mean() * 100

    fig = go.Figure()

    fig.add_trace(go.Scatter(
        x=weekly['week'],
        y=weekly['revenue'],
        name='Revenue',
        line=dict(color='#2E86AB', width=2),
        fill='tozeroy',
        fillcolor='rgba(46, 134, 171, 0.1)'
    ))

    fig.add_trace(go.Scatter(
        x=weekly['week'],
        y=weekly['profit'],
        name='Profit',
        line=dict(color='#28A745', width=2)
    ))

    fig.update_layout(
        title='Weekly Sales Trend',
        xaxis_title='Week',
        yaxis_title='Amount ($)',
        hovermode='x unified',
        legend=dict(orientation='h', yanchor='bottom', y=1.02),
        height=350
    )

    st.plotly_chart(fig, use_container_width=True)

    # Insight box
    st.info(f"""
    **Trend Insights:**
    - Peak sales in **Week {int(peak_week)}** (summer months - beverages are seasonal)
    - Lowest sales in **Week {int(low_week)}** (typically winter)
    - Seasonality index: **{seasonality:.0f}%** variation from mean
    - Use this pattern for inventory planning and promotional timing
    """)


def render_top_skus(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    metric: str = 'revenue',
    top_n: int = 10
):
    """Render top performing SKUs bar chart with insights."""
    sku_perf = sales_df.groupby('sku_id').agg({
        'revenue': 'sum',
        'profit': 'sum',
        'units_sold': 'sum'
    }).reset_index()

    sku_perf = sku_perf.merge(products_df[['sku_id', 'name', 'brand', 'subcategory']], on='sku_id')
    sku_perf = sku_perf.nlargest(top_n, metric)

    # Calculate concentration
    total = sales_df[metric].sum() if metric in sales_df.columns else sales_df['revenue'].sum()
    top_10_share = sku_perf[metric].sum() / total * 100

    # Truncate long names
    sku_perf['display_name'] = sku_perf['name'].apply(
        lambda x: x[:30] + '...' if len(x) > 30 else x
    )

    fig = px.bar(
        sku_perf,
        x=metric,
        y='display_name',
        orientation='h',
        color='subcategory',
        title=f'Top {top_n} SKUs by {metric.title()}',
        labels={metric: metric.title(), 'display_name': 'Product'},
        color_discrete_sequence=px.colors.qualitative.Set2
    )

    fig.update_layout(
        yaxis={'categoryorder': 'total ascending'},
        height=400,
        showlegend=True,
        legend=dict(orientation='h', yanchor='bottom', y=1.02)
    )

    st.plotly_chart(fig, use_container_width=True)

    # Insight box
    st.info(f"""
    **Top Performers Insight:**
    - Top 10 SKUs contribute **{top_10_share:.1f}%** of total {metric}
    - {"High concentration - consider protecting these core items" if top_10_share > 50 else "Healthy distribution across assortment"}
    - Top brand: **{sku_perf['brand'].mode().iloc[0]}** dominates the top sellers
    """)


def render_category_mix(sales_df: pd.DataFrame, products_df: pd.DataFrame):
    """Render category mix pie chart with insights."""
    # Calculate revenue by subcategory
    merged = sales_df.merge(products_df[['sku_id', 'subcategory']], on='sku_id')
    subcat_rev = merged.groupby('subcategory')['revenue'].sum().reset_index()
    subcat_rev['share'] = subcat_rev['revenue'] / subcat_rev['revenue'].sum() * 100

    fig = px.pie(
        subcat_rev,
        values='revenue',
        names='subcategory',
        title='Revenue by Subcategory',
        color_discrete_sequence=px.colors.qualitative.Set2,
        hole=0.4
    )

    fig.update_traces(
        textposition='inside',
        textinfo='percent+label'
    )

    fig.update_layout(height=350)

    st.plotly_chart(fig, use_container_width=True)

    # Find insights
    top_subcat = subcat_rev.loc[subcat_rev['revenue'].idxmax()]

    st.info(f"""
    **Category Mix Insight:**
    - **{top_subcat['subcategory']}** leads with {top_subcat['share']:.1f}% share
    - Balanced mix indicates healthy category - no over-reliance on one segment
    - Consider growing underperforming subcategories or reallocating space
    """)


def render_brand_performance(sales_df: pd.DataFrame, products_df: pd.DataFrame):
    """Render brand tier performance comparison with insights."""
    merged = sales_df.merge(products_df[['sku_id', 'brand_tier']], on='sku_id')
    tier_perf = merged.groupby('brand_tier').agg({
        'revenue': 'sum',
        'profit': 'sum',
        'units_sold': 'sum'
    }).reset_index()

    # Calculate margin percentage
    tier_perf['margin_pct'] = (tier_perf['profit'] / tier_perf['revenue'] * 100).round(1)

    # Order tiers logically
    tier_order = ['Premium', 'National A', 'National B', 'Store Brand']
    tier_perf['brand_tier'] = pd.Categorical(tier_perf['brand_tier'], categories=tier_order, ordered=True)
    tier_perf = tier_perf.sort_values('brand_tier')

    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=tier_perf['brand_tier'],
        y=tier_perf['revenue'],
        name='Revenue',
        marker_color='#2E86AB'
    ))

    fig.add_trace(go.Bar(
        x=tier_perf['brand_tier'],
        y=tier_perf['profit'],
        name='Profit',
        marker_color='#28A745'
    ))

    fig.update_layout(
        title='Performance by Brand Tier',
        xaxis_title='Brand Tier',
        yaxis_title='Amount ($)',
        barmode='group',
        height=350,
        legend=dict(orientation='h', yanchor='bottom', y=1.02)
    )

    st.plotly_chart(fig, use_container_width=True)

    # Calculate insights
    store_brand = tier_perf[tier_perf['brand_tier'] == 'Store Brand']
    sb_margin = store_brand['margin_pct'].iloc[0] if len(store_brand) > 0 else 0
    national_margin = tier_perf[tier_perf['brand_tier'] == 'National A']['margin_pct'].iloc[0] if len(tier_perf[tier_perf['brand_tier'] == 'National A']) > 0 else 0

    st.info(f"""
    **Brand Tier Insight:**
    - Store Brand margin: **{sb_margin:.1f}%** vs National A: **{national_margin:.1f}%**
    - Store brands typically offer higher margins but lower velocity
    - Balance national brands (traffic drivers) with private label (margin builders)
    """)


def render_price_tier_analysis(sales_df: pd.DataFrame, products_df: pd.DataFrame):
    """Render price tier analysis with insights."""
    merged = sales_df.merge(products_df[['sku_id', 'price_tier']], on='sku_id')
    tier_perf = merged.groupby('price_tier').agg({
        'revenue': 'sum',
        'units_sold': 'sum',
        'sku_id': 'nunique'
    }).reset_index()
    tier_perf.columns = ['price_tier', 'revenue', 'units', 'sku_count']

    # Order tiers
    tier_order = ['Value', 'Mid', 'Premium']
    tier_perf['price_tier'] = pd.Categorical(tier_perf['price_tier'], categories=tier_order, ordered=True)
    tier_perf = tier_perf.sort_values('price_tier')

    # Calculate shares
    tier_perf['rev_share'] = tier_perf['revenue'] / tier_perf['revenue'].sum() * 100
    tier_perf['unit_share'] = tier_perf['units'] / tier_perf['units'].sum() * 100

    col1, col2 = st.columns(2)

    with col1:
        fig = px.bar(
            tier_perf,
            x='price_tier',
            y='revenue',
            title='Revenue by Price Tier',
            color='price_tier',
            color_discrete_map={'Value': '#28A745', 'Mid': '#FFC107', 'Premium': '#DC3545'}
        )
        fig.update_layout(height=300, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    with col2:
        fig = px.bar(
            tier_perf,
            x='price_tier',
            y='units',
            title='Units Sold by Price Tier',
            color='price_tier',
            color_discrete_map={'Value': '#28A745', 'Mid': '#FFC107', 'Premium': '#DC3545'}
        )
        fig.update_layout(height=300, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    # Insights
    value_tier = tier_perf[tier_perf['price_tier'] == 'Value'].iloc[0] if len(tier_perf[tier_perf['price_tier'] == 'Value']) > 0 else None
    premium_tier = tier_perf[tier_perf['price_tier'] == 'Premium'].iloc[0] if len(tier_perf[tier_perf['price_tier'] == 'Premium']) > 0 else None

    if value_tier is not None and premium_tier is not None:
        st.info(f"""
        **Price Tier Insight:**
        - Value tier: **{value_tier['unit_share']:.1f}%** of units but **{value_tier['rev_share']:.1f}%** of revenue
        - Premium tier: **{premium_tier['unit_share']:.1f}%** of units but **{premium_tier['rev_share']:.1f}%** of revenue
        - Premium products punch above their weight in revenue contribution
        - Ensure adequate shelf space for high-value premium items
        """)


def render_dashboard(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    stores_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """
    Render the complete KPI dashboard with insights.
    """
    # Filter data if store specified
    if store_id is not None:
        sales_df = sales_df[sales_df['store_id'] == store_id]
        assortment_df = assortment_df[assortment_df['store_id'] == store_id]
        store_name = stores_df[stores_df['store_id'] == store_id]['name'].iloc[0]
        st.subheader(f"Dashboard: {store_name}")
    else:
        st.subheader("Dashboard: All Stores")

    # Dashboard explanation
    with st.expander("About this Dashboard", expanded=False):
        st.markdown("""
        **What this shows:** Key performance indicators for the Beverages category, helping you understand:
        - **Financial Performance**: Revenue, profit, and margins
        - **Space Productivity**: How efficiently shelf space generates sales
        - **Inventory Efficiency**: GMROI and turnover rates
        - **Assortment Health**: SKU count and concentration

        **How to use it:**
        - Compare metrics across stores using the sidebar selector
        - Identify seasonal patterns in the trend chart
        - Find your hero SKUs and underperformers
        - Understand category and brand mix dynamics
        """)

    # Calculate and display KPI cards
    metrics = calculate_productivity_metrics(
        sales_df, products_df, assortment_df, store_id
    )
    render_kpi_cards(metrics)

    st.divider()

    # Sales trend and category mix
    col1, col2 = st.columns([2, 1])

    with col1:
        render_sales_trend(sales_df)

    with col2:
        render_category_mix(sales_df, products_df)

    st.divider()

    # Top SKUs and brand performance
    col1, col2 = st.columns(2)

    with col1:
        metric_choice = st.selectbox(
            "Rank SKUs by:",
            options=['revenue', 'profit', 'units_sold'],
            format_func=lambda x: x.replace('_', ' ').title(),
            key='top_sku_metric',
            help="Choose how to rank top-performing products"
        )
        render_top_skus(sales_df, products_df, metric=metric_choice)

    with col2:
        render_brand_performance(sales_df, products_df)

    st.divider()

    # Price tier analysis
    st.subheader("Price Tier Analysis")
    st.caption("Understanding how different price points contribute to your business")
    render_price_tier_analysis(sales_df, products_df)
