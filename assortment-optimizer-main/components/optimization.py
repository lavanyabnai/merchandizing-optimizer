"""
Optimization UI component for Streamlit app.
Provides interface for configuring and running assortment optimization.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional, List

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.optimizer import (
    AssortmentOptimizer,
    OptimizationConstraints,
    OptimizationResult
)


def render_constraint_form(
    products_df: pd.DataFrame,
    stores_df: pd.DataFrame,
    store_id: Optional[int] = None
) -> OptimizationConstraints:
    """
    Render form for configuring optimization constraints.

    Returns:
        OptimizationConstraints object
    """
    st.markdown("### Optimization Constraints")

    with st.expander("Understanding Constraints", expanded=False):
        st.markdown("""
        **Why do we need constraints?**

        Optimization without constraints would simply select the highest-profit items.
        Real-world assortment decisions must balance multiple business objectives:

        - **Space Constraints**: Physical shelf space is limited - you can't carry everything
        - **Coverage Constraints**: Ensure variety for different shopper needs (subcategories, price points)
        - **Brand Constraints**: Maintain relationships with key suppliers while avoiding over-reliance
        - **Must-Carry Items**: Protect traffic-driving hero SKUs that customers expect

        **Tip:** Start with default constraints and adjust based on results.
        """)

    col1, col2 = st.columns(2)

    with col1:
        st.markdown("**Space Constraints**")
        st.caption("Control how shelf space is allocated")

        # Get default total facings based on store
        if store_id is not None:
            default_facings = stores_df[stores_df['store_id'] == store_id]['total_facings'].iloc[0]
        else:
            default_facings = 120

        total_facings = st.slider(
            "Total Available Facings",
            min_value=50,
            max_value=200,
            value=int(default_facings),
            step=10,
            help="Maximum number of product facings on the shelf. A 'facing' is one product front visible to shoppers. More facings = more visibility but less variety."
        )

        min_facings = st.slider(
            "Min Facings per SKU",
            min_value=1,
            max_value=3,
            value=1,
            help="Minimum facings for each selected SKU. At least 1 facing is needed for a product to be visible. 2+ facings improve findability."
        )

        max_facings = st.slider(
            "Max Facings per SKU",
            min_value=3,
            max_value=10,
            value=6,
            help="Maximum facings for any single SKU. Prevents a single product from dominating the shelf and ensures variety."
        )

    with col2:
        st.markdown("**Coverage Constraints**")
        st.caption("Ensure variety for different shopper needs")

        min_skus_per_brand = st.slider(
            "Min SKUs per Brand",
            min_value=1,
            max_value=4,
            value=2,
            help="Minimum SKUs from each brand if included. Having 2+ SKUs per brand allows for size/flavor variety."
        )

        max_skus_per_brand = st.slider(
            "Max SKUs per Brand",
            min_value=3,
            max_value=10,
            value=6,
            help="Maximum SKUs from any single brand. Prevents over-reliance on one supplier and ensures competitive offerings."
        )

        min_skus_per_subcat = st.slider(
            "Min SKUs per Subcategory",
            min_value=1,
            max_value=5,
            value=3,
            help="Minimum SKUs per subcategory (Soft Drinks, Juices, Water, Energy Drinks). Ensures shoppers find what they're looking for."
        )

        min_skus_per_price = st.slider(
            "Min SKUs per Price Tier",
            min_value=1,
            max_value=3,
            value=1,
            help="Minimum SKUs at each price point (Value, Mid, Premium). Ensures options for different budgets."
        )

    st.divider()

    # Must-carry selection
    st.markdown("**Must-Carry SKUs**")
    st.caption("Products that must be included regardless of profitability (e.g., hero SKUs, contractual obligations)")

    # Group products for easier selection
    product_options = products_df[['sku_id', 'name', 'brand', 'subcategory']].copy()
    product_options['display'] = product_options.apply(
        lambda x: f"{x['name']} ({x['brand']})", axis=1
    )

    must_carry = st.multiselect(
        "Must-Carry Products",
        options=product_options['sku_id'].tolist(),
        format_func=lambda x: product_options[product_options['sku_id'] == x]['display'].iloc[0],
        default=[],
        help="These products will always be included"
    )

    # Exclude selection
    st.markdown("**Exclude SKUs**")
    st.caption("Products to remove from consideration (e.g., discontinued, supplier issues)")
    exclude = st.multiselect(
        "Products to Exclude",
        options=product_options['sku_id'].tolist(),
        format_func=lambda x: product_options[product_options['sku_id'] == x]['display'].iloc[0],
        default=[],
        help="These products will never be included in the optimized assortment, regardless of performance."
    )

    return OptimizationConstraints(
        total_facings=total_facings,
        min_facings_per_sku=min_facings,
        max_facings_per_sku=max_facings,
        min_skus_per_brand=min_skus_per_brand,
        max_skus_per_brand=max_skus_per_brand,
        min_skus_per_subcategory=min_skus_per_subcat,
        min_skus_per_price_tier=min_skus_per_price,
        must_carry=must_carry,
        exclude=exclude
    )


def render_optimization_results(
    result: OptimizationResult,
    comparison_df: pd.DataFrame
):
    """Render optimization results and comparison."""

    # Status banner
    if result.status == 'optimal':
        st.success(f"Optimization completed successfully in {result.solve_time_seconds}s")
    elif result.status == 'feasible':
        st.warning(f"Found feasible solution in {result.solve_time_seconds}s (may not be optimal)")
    else:
        st.error("No feasible solution found. Try relaxing constraints.")
        st.info("""
        **Troubleshooting tips:**
        - Increase total facings available
        - Reduce minimum SKUs per subcategory/brand
        - Remove conflicting must-carry items
        - Check that exclude list doesn't remove required coverage
        """)
        return

    # Key metrics
    st.markdown("### Results Summary")
    st.caption("Key metrics comparing current vs optimized assortment")

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            "SKUs Selected",
            len(result.selected_skus),
            delta=None,
            help="Number of unique products in the optimized assortment"
        )

    with col2:
        st.metric(
            "Total Facings Used",
            sum(result.facings.values()),
            delta=None,
            help="Total shelf facings allocated (should be close to maximum available)"
        )

    with col3:
        delta_color = "normal" if result.profit_lift >= 0 else "inverse"
        st.metric(
            "Weekly Profit (After)",
            f"${result.after_profit:,.0f}",
            delta=f"${result.profit_lift:+,.0f}",
            delta_color=delta_color,
            help="Expected weekly profit with the optimized assortment"
        )

    with col4:
        st.metric(
            "Profit Lift",
            f"{result.profit_lift_pct:+.1f}%",
            delta=None,
            help="Percentage improvement over current assortment profit"
        )

    st.divider()

    # Before/After comparison chart
    st.markdown("### Assortment Changes")
    st.caption("Products that changed between current and optimized assortment")

    # Filter to show only changed items
    changed = comparison_df[comparison_df['status'] != 'Unchanged'].copy()

    if len(changed) > 0:
        # Summary of changes
        added = len(comparison_df[comparison_df['status'] == 'Added'])
        removed = len(comparison_df[comparison_df['status'] == 'Removed'])
        modified = len(comparison_df[comparison_df['status'] == 'Changed'])

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("SKUs Added", added, delta=f"+{added}" if added > 0 else None,
                     help="New products recommended to add to the assortment")
        with col2:
            st.metric("SKUs Removed", removed, delta=f"-{removed}" if removed > 0 else None, delta_color="inverse",
                     help="Products recommended for delisting (low performers)")
        with col3:
            st.metric("SKUs Modified", modified,
                     help="Products staying in assortment but with changed facings")

        # Visualization of changes
        fig = go.Figure()

        # Before bars
        fig.add_trace(go.Bar(
            name='Before',
            x=changed['name'].str[:20],
            y=changed['before_facings'],
            marker_color='#6C757D'
        ))

        # After bars
        fig.add_trace(go.Bar(
            name='After',
            x=changed['name'].str[:20],
            y=changed['after_facings'],
            marker_color='#28A745'
        ))

        fig.update_layout(
            title='Facing Changes for Modified SKUs',
            xaxis_title='Product',
            yaxis_title='Facings',
            barmode='group',
            height=400,
            xaxis_tickangle=-45
        )

        st.plotly_chart(fig, use_container_width=True)

    # Detailed comparison table
    st.markdown("### Detailed Comparison")
    st.caption("Green = Added | Red = Removed | Yellow = Changed facings")

    # Color code the status
    def highlight_status(row):
        if row['status'] == 'Added':
            return ['background-color: #d4edda'] * len(row)
        elif row['status'] == 'Removed':
            return ['background-color: #f8d7da'] * len(row)
        elif row['status'] == 'Changed':
            return ['background-color: #fff3cd'] * len(row)
        return [''] * len(row)

    # Show the table
    display_df = comparison_df[['name', 'brand', 'subcategory', 'before_facings', 'after_facings', 'change', 'status']]

    st.dataframe(
        display_df.style.apply(highlight_status, axis=1),
        column_config={
            'name': 'Product',
            'brand': 'Brand',
            'subcategory': 'Subcategory',
            'before_facings': 'Before',
            'after_facings': 'After',
            'change': st.column_config.NumberColumn('Change', format="%+d"),
            'status': 'Status'
        },
        hide_index=True,
        use_container_width=True,
        height=400
    )


def render_category_summary(comparison_df: pd.DataFrame, products_df: pd.DataFrame):
    """Render summary by category/subcategory."""
    st.markdown("### Category Summary")
    st.caption("How shelf space allocation changes by subcategory")

    # Merge to get subcategory
    merged = comparison_df.merge(
        products_df[['sku_id', 'subcategory']],
        on='sku_id',
        suffixes=('', '_prod')
    )

    # Use the correct subcategory column
    if 'subcategory_prod' in merged.columns:
        merged['subcategory'] = merged['subcategory'].fillna(merged['subcategory_prod'])

    summary = merged.groupby('subcategory').agg({
        'before_facings': 'sum',
        'after_facings': 'sum',
        'sku_id': 'count'
    }).reset_index()

    summary.columns = ['Subcategory', 'Before Facings', 'After Facings', 'SKU Count']
    summary['Change'] = summary['After Facings'] - summary['Before Facings']

    fig = go.Figure()

    fig.add_trace(go.Bar(
        name='Before',
        x=summary['Subcategory'],
        y=summary['Before Facings'],
        marker_color='#6C757D'
    ))

    fig.add_trace(go.Bar(
        name='After',
        x=summary['Subcategory'],
        y=summary['After Facings'],
        marker_color='#2E86AB'
    ))

    fig.update_layout(
        title='Facings by Subcategory',
        xaxis_title='Subcategory',
        yaxis_title='Total Facings',
        barmode='group',
        height=350
    )

    st.plotly_chart(fig, use_container_width=True)

    st.dataframe(summary, hide_index=True, use_container_width=True)

    # Add insight
    if len(summary) > 0:
        max_gain = summary.loc[summary['Change'].idxmax()]
        max_loss = summary.loc[summary['Change'].idxmin()]

        if max_gain['Change'] > 0 or max_loss['Change'] < 0:
            st.info(f"""
            **Reallocation Insight:**
            - **{max_gain['Subcategory']}** gains the most space (+{max_gain['Change']:.0f} facings) - likely higher profit potential
            - **{max_loss['Subcategory']}** loses space ({max_loss['Change']:.0f} facings) - may be over-spaced relative to performance
            """)


def render_optimization_page(
    products_df: pd.DataFrame,
    sales_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    stores_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """
    Render complete optimization page.
    """
    st.subheader("Assortment Optimizer")

    with st.expander("About Assortment Optimization", expanded=False):
        st.markdown("""
        **What is Assortment Optimization?**

        This tool uses a mathematical algorithm to find the best combination of products
        and shelf space allocation that maximizes profit while meeting business constraints.

        **How it works:**
        1. **Input**: Historical sales data, product profitability, current assortment
        2. **Constraints**: Space limits, coverage requirements, must-carry items
        3. **Algorithm**: Greedy heuristic that prioritizes highest-profit items while ensuring coverage
        4. **Output**: Recommended assortment with facing allocations and expected profit lift

        **Key Concepts:**
        - **Space Elasticity**: More facings = more sales, but with diminishing returns
        - **Coverage**: Ensures all shopper needs are met (subcategories, price tiers)
        - **Profit Lift**: Expected improvement vs current assortment

        **Important:** This is a decision-support tool. Always validate recommendations against
        local market knowledge, supplier relationships, and seasonal factors.
        """)

    st.markdown("""
    Configure constraints and run the optimizer to find the profit-maximizing
    assortment subject to space, coverage, and business rule constraints.
    """)

    # Constraint configuration form
    constraints = render_constraint_form(products_df, stores_df, store_id)

    st.divider()

    # Run optimization button
    col1, col2, col3 = st.columns([1, 1, 2])

    with col1:
        run_button = st.button("Run Optimization", type="primary", use_container_width=True)

    with col2:
        time_limit = st.number_input(
            "Time Limit (sec)",
            min_value=5,
            max_value=120,
            value=30,
            help="Maximum solver runtime. The algorithm typically completes in seconds."
        )

    if run_button:
        with st.spinner("Running optimization..."):
            try:
                optimizer = AssortmentOptimizer(constraints)

                result = optimizer.optimize(
                    products=products_df,
                    sales_data=sales_df,
                    current_assortment=assortment_df,
                    store_id=store_id,
                    time_limit_seconds=time_limit
                )

                comparison = optimizer.get_optimization_comparison(
                    products=products_df,
                    current_assortment=assortment_df,
                    result=result,
                    store_id=store_id
                )

                # Store results in session state
                st.session_state['optimization_result'] = result
                st.session_state['optimization_comparison'] = comparison

            except Exception as e:
                st.error(f"Optimization failed: {str(e)}")
                st.info("Try adjusting constraints (e.g., reduce min SKUs per subcategory or increase total facings)")

    # Display results if available
    if 'optimization_result' in st.session_state:
        st.divider()
        render_optimization_results(
            st.session_state['optimization_result'],
            st.session_state['optimization_comparison']
        )

        st.divider()
        render_category_summary(
            st.session_state['optimization_comparison'],
            products_df
        )
