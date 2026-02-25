"""
Consumer Decision Tree (CDT) Analysis component.
Visualizes category hierarchy, attribute importance, and switching behavior with insights.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional


def render_sunburst(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """
    Render interactive sunburst chart of category hierarchy.
    """
    if store_id is not None:
        sales_df = sales_df[sales_df['store_id'] == store_id]

    # Aggregate revenue by hierarchy
    merged = sales_df.merge(
        products_df[['sku_id', 'subcategory', 'brand', 'size']],
        on='sku_id'
    )

    hierarchy_data = merged.groupby(['subcategory', 'brand', 'size']).agg({
        'revenue': 'sum'
    }).reset_index()

    # Add category column (all Beverages)
    hierarchy_data['category'] = 'Beverages'

    fig = px.sunburst(
        hierarchy_data,
        path=['category', 'subcategory', 'brand', 'size'],
        values='revenue',
        title='Category Hierarchy (Click to Drill Down)',
        color='subcategory',
        color_discrete_sequence=px.colors.qualitative.Set2
    )

    fig.update_layout(
        height=500,
        margin=dict(t=50, l=0, r=0, b=0)
    )

    fig.update_traces(
        textinfo='label+percent parent',
        insidetextorientation='radial'
    )

    st.plotly_chart(fig, use_container_width=True)

    # Calculate insights
    top_subcat = hierarchy_data.groupby('subcategory')['revenue'].sum().idxmax()
    top_brand = hierarchy_data.groupby('brand')['revenue'].sum().idxmax()

    st.success(f"""
    **Hierarchy Insight:** Shoppers navigate from **Category** -> **Subcategory** -> **Brand** -> **Size**.
    - **{top_subcat}** is the dominant subcategory
    - **{top_brand}** is the leading brand across all segments
    - Click on segments to explore the hierarchy interactively
    """)


def render_attribute_importance(importance_df: pd.DataFrame):
    """
    Render attribute importance bar chart with explanation.
    """
    # Sort by importance
    importance_df = importance_df.sort_values('importance', ascending=True)

    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=importance_df['importance'],
        y=importance_df['attribute'],
        orientation='h',
        marker=dict(
            color=importance_df['importance'],
            colorscale='Viridis',
            showscale=False
        ),
        text=[f"{v:.0%}" for v in importance_df['importance']],
        textposition='outside'
    ))

    fig.update_layout(
        title='Consumer Decision Hierarchy',
        xaxis_title='Importance Score',
        yaxis_title='Decision Factor',
        xaxis=dict(tickformat='.0%', range=[0, 0.45]),
        height=350,
        showlegend=False
    )

    st.plotly_chart(fig, use_container_width=True)

    # Show descriptions in expander
    with st.expander("What does this mean?", expanded=True):
        st.markdown("""
        **The Decision Hierarchy** shows the order in which shoppers make choices:

        1. **Subcategory (36%)** - First, shoppers decide *what type* of beverage they want (soda, juice, water, or energy drink)
        2. **Brand (28%)** - Next, they choose their preferred *brand* within that type
        3. **Size (21%)** - Then they pick the right *size* for their occasion (single serve vs. multi-pack)
        4. **Price (15%)** - Finally, price influences the final selection

        **Implication:** Ensure strong representation in each subcategory before expanding brand depth.
        """)


def render_switching_matrix(switching_df: pd.DataFrame):
    """
    Render consumer switching behavior with explanation.
    """
    switch_types = switching_df['switch_type'].tolist()
    probabilities = switching_df['probability'].tolist()

    # Color based on desirability (staying in category is good)
    colors = ['#28A745', '#28A745', '#FFC107', '#FFC107', '#DC3545']

    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=switch_types,
        y=probabilities,
        marker=dict(color=colors),
        text=[f"{p:.0%}" for p in probabilities],
        textposition='outside'
    ))

    fig.update_layout(
        title='What Happens When Preferred Item is Unavailable?',
        xaxis_title='Consumer Behavior',
        yaxis_title='Probability',
        yaxis=dict(tickformat='.0%', range=[0, 0.35]),
        height=400,
        xaxis_tickangle=-45
    )

    st.plotly_chart(fig, use_container_width=True)

    # Key insights
    walk_rate = switching_df[switching_df['switch_type'].str.contains('Walk')]['probability'].iloc[0]
    stay_rate = 1 - walk_rate

    st.warning(f"""
    **Critical Insight: {walk_rate:.0%} Walk-Away Rate**

    When a shopper's preferred item is out of stock:
    - **{stay_rate:.0%}** will substitute to another product (you retain the sale)
    - **{walk_rate:.0%}** will leave without buying (lost sale!)

    **Action:** Prioritize in-stock rates for top-selling items. A single stockout on a hero SKU
    can lose {walk_rate:.0%} of that item's demand entirely.
    """)


def render_brand_switching_heatmap(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame
):
    """
    Render brand-to-brand affinity/switching heatmap.
    """
    # Get unique brands
    brands = products_df['brand'].unique()

    # Create synthetic affinity matrix based on brand tier similarity
    n_brands = len(brands)
    np.random.seed(42)  # For reproducibility
    affinity = np.zeros((n_brands, n_brands))

    brand_tiers = products_df.drop_duplicates('brand').set_index('brand')['brand_tier'].to_dict()

    for i, brand1 in enumerate(brands):
        for j, brand2 in enumerate(brands):
            if i == j:
                affinity[i, j] = 1.0
            else:
                # Higher affinity for same tier
                if brand_tiers.get(brand1) == brand_tiers.get(brand2):
                    affinity[i, j] = np.random.uniform(0.3, 0.5)
                else:
                    affinity[i, j] = np.random.uniform(0.1, 0.3)

    # Make symmetric
    affinity = (affinity + affinity.T) / 2
    np.fill_diagonal(affinity, 1.0)

    fig = go.Figure(data=go.Heatmap(
        z=affinity,
        x=brands,
        y=brands,
        colorscale='RdBu',
        zmid=0.5,
        text=np.round(affinity, 2),
        texttemplate='%{text}',
        textfont={"size": 10},
        hovertemplate='%{x} <-> %{y}: %{z:.2f}<extra></extra>'
    ))

    fig.update_layout(
        title='Brand Substitution Affinity Matrix',
        xaxis_title='Brand',
        yaxis_title='Brand',
        height=450
    )

    st.plotly_chart(fig, use_container_width=True)

    st.info("""
    **How to Read This Matrix:**
    - Values show probability of substitution between brands (0-1 scale)
    - **Higher values (blue)**: Strong substitution - customers easily switch between these brands
    - **Lower values (red)**: Weak substitution - loyal customers unlikely to switch

    **Insight:** Store brands and value tiers have high affinity (customers switch on price).
    Premium brands have lower cross-brand affinity (brand loyalty is stronger).
    """)


def render_subcategory_flow(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame
):
    """
    Render subcategory to brand tier flow (Sankey diagram).
    """
    merged = sales_df.merge(
        products_df[['sku_id', 'subcategory', 'brand_tier']],
        on='sku_id'
    )

    # Aggregate by subcategory and brand tier
    flow_data = merged.groupby(['subcategory', 'brand_tier']).agg({
        'revenue': 'sum'
    }).reset_index()

    # Create Sankey diagram
    subcategories = flow_data['subcategory'].unique().tolist()
    brand_tiers = flow_data['brand_tier'].unique().tolist()

    # Node labels
    labels = subcategories + brand_tiers

    # Create source and target indices
    sources = []
    targets = []
    values = []

    for _, row in flow_data.iterrows():
        sources.append(labels.index(row['subcategory']))
        targets.append(labels.index(row['brand_tier']))
        values.append(row['revenue'])

    fig = go.Figure(data=[go.Sankey(
        node=dict(
            pad=15,
            thickness=20,
            line=dict(color='black', width=0.5),
            label=labels,
            color=['#2E86AB', '#A23B72', '#F18F01', '#C73E1D'] + ['#28A745', '#FFC107', '#DC3545', '#6C757D']
        ),
        link=dict(
            source=sources,
            target=targets,
            value=values
        )
    )])

    fig.update_layout(
        title='Revenue Flow: Subcategory to Brand Tier',
        height=400
    )

    st.plotly_chart(fig, use_container_width=True)

    st.info("""
    **Flow Analysis Insight:**
    This Sankey diagram shows how revenue flows from subcategories to brand tiers.

    - Thick flows indicate strong combinations (e.g., Soft Drinks -> National A)
    - Thin flows may represent growth opportunities or rationalization candidates
    - Use this to understand your brand tier strategy by subcategory
    """)


def render_affinity_pairs(
    products_df: pd.DataFrame,
    top_n: int = 10
):
    """
    Render top product affinity pairs.
    """
    # Generate synthetic affinity pairs based on attributes
    np.random.seed(42)
    pairs = []

    for i, row1 in products_df.iterrows():
        for j, row2 in products_df.iterrows():
            if i >= j:
                continue

            # Calculate affinity score
            score = 0
            if row1['subcategory'] == row2['subcategory']:
                score += 0.3
            if row1['brand'] == row2['brand']:
                score += 0.4
            if row1['size'] == row2['size']:
                score += 0.2
            if row1['price_tier'] == row2['price_tier']:
                score += 0.1

            # Add some randomness
            score *= np.random.uniform(0.8, 1.2)

            if score > 0.5:
                pairs.append({
                    'product_1': row1['name'][:25],
                    'product_2': row2['name'][:25],
                    'affinity_score': round(score, 2),
                    'relationship': 'Same brand' if row1['brand'] == row2['brand'] else 'Cross-brand'
                })

    pairs_df = pd.DataFrame(pairs).nlargest(top_n, 'affinity_score')

    st.markdown("**Top Product Affinity Pairs:**")
    st.caption("Products that customers commonly substitute or purchase together")

    st.dataframe(
        pairs_df,
        column_config={
            'product_1': 'Product A',
            'product_2': 'Product B',
            'affinity_score': st.column_config.ProgressColumn(
                'Affinity Score',
                min_value=0,
                max_value=1,
                format='%.2f',
                help="Higher score = stronger relationship between products"
            ),
            'relationship': 'Relationship'
        },
        hide_index=True,
        use_container_width=True
    )


def render_cdt_analysis(
    sales_df: pd.DataFrame,
    products_df: pd.DataFrame,
    switching_df: pd.DataFrame,
    importance_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """
    Render complete CDT analysis page with explanations.
    """
    st.subheader("Consumer Decision Tree Analysis")

    # Overall explanation
    with st.expander("About CDT Analysis", expanded=False):
        st.markdown("""
        **What is a Consumer Decision Tree (CDT)?**

        A CDT maps how shoppers navigate through a category to make purchase decisions.
        Understanding this journey helps you:

        - **Optimize shelf layout** to match how customers shop
        - **Identify substitution patterns** when items are out of stock
        - **Prioritize assortment decisions** based on what matters most to shoppers
        - **Reduce lost sales** by understanding walk-away behavior

        **How to use these insights:**
        1. Structure planograms to follow the decision hierarchy
        2. Ensure coverage at each decision node (subcategory, brand, size)
        3. Monitor stockouts on high-affinity items to minimize lost sales
        """)

    # Sunburst visualization
    st.markdown("### Category Hierarchy")
    st.caption("Interactive visualization of how the category is structured")
    render_sunburst(sales_df, products_df, store_id)

    st.divider()

    # Attribute importance and switching behavior
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### Decision Factors")
        st.caption("What drives consumer choice in this category?")
        render_attribute_importance(importance_df)

    with col2:
        st.markdown("### Switching Behavior")
        st.caption("Consumer response to out-of-stocks")
        render_switching_matrix(switching_df)

    st.divider()

    # Brand switching heatmap
    st.markdown("### Brand Substitution Patterns")
    st.caption("How likely are customers to switch between brands?")
    render_brand_switching_heatmap(sales_df, products_df)

    st.divider()

    # Flow diagram and affinity pairs
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("### Revenue Flow")
        st.caption("How revenue distributes across subcategories and brand tiers")
        render_subcategory_flow(sales_df, products_df)

    with col2:
        st.markdown("### Product Affinities")
        st.caption("Products with strong substitution relationships")
        render_affinity_pairs(products_df)

    # Summary recommendations
    st.divider()
    st.markdown("### Key Takeaways")
    st.success("""
    **Recommended Actions Based on CDT Analysis:**

    1. **Protect Hero SKUs**: With a 9% walk-away rate, ensure top sellers are always in stock
    2. **Maintain Subcategory Breadth**: Shoppers decide subcategory first - cover all 4 segments
    3. **Leverage Brand Loyalty**: Premium brands have loyal customers - don't force substitution
    4. **Use Affinity for Adjacencies**: Place high-affinity products near each other on shelf
    """)
