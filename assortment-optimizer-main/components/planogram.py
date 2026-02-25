"""
Planogram visualization component for Streamlit app.
Visual shelf representation with product placement.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from typing import Optional, Dict, List


# Color palette for subcategories
SUBCATEGORY_COLORS = {
    'Soft Drinks': '#E74C3C',
    'Juices': '#F39C12',
    'Water': '#3498DB',
    'Energy Drinks': '#9B59B6'
}

# Color shades for brand tiers
BRAND_TIER_SHADES = {
    'Premium': 1.0,
    'National A': 0.85,
    'National B': 0.70,
    'Store Brand': 0.55
}


def get_product_color(subcategory: str, brand_tier: str) -> str:
    """Get color for a product based on subcategory and brand tier."""
    base_color = SUBCATEGORY_COLORS.get(subcategory, '#95A5A6')

    # Adjust brightness based on brand tier
    shade = BRAND_TIER_SHADES.get(brand_tier, 0.7)

    # Simple brightness adjustment (for hex colors)
    r = int(base_color[1:3], 16)
    g = int(base_color[3:5], 16)
    b = int(base_color[5:7], 16)

    r = int(r * shade)
    g = int(g * shade)
    b = int(b * shade)

    return f'#{r:02x}{g:02x}{b:02x}'


def create_shelf_layout(
    products_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    store_id: Optional[int] = None,
    shelf_width: int = 48,
    num_shelves: int = 4
) -> List[List[Dict]]:
    """
    Create shelf layout data structure.

    Args:
        products_df: Product data
        assortment_df: Current assortment with facings
        store_id: Optional store filter
        shelf_width: Width of each shelf in inches
        num_shelves: Number of shelves

    Returns:
        List of shelves, each containing list of product placements
    """
    if store_id is not None:
        assortment_df = assortment_df[assortment_df['store_id'] == store_id]

    # Get listed products with facings
    listed = assortment_df[assortment_df['is_listed']].copy()
    listed = listed.merge(
        products_df[['sku_id', 'name', 'subcategory', 'brand', 'brand_tier',
                    'size', 'price', 'width_inches']],
        on='sku_id'
    )

    # Sort by subcategory, then brand for visual organization
    listed = listed.sort_values(['subcategory', 'brand', 'name'])

    shelves = [[] for _ in range(num_shelves)]
    current_shelf = 0
    current_x = 0

    for _, product in listed.iterrows():
        # Calculate total width for this product (facings * width)
        product_width = product['width_inches'] * product['current_facings']

        # Check if we need to move to next shelf
        if current_x + product_width > shelf_width:
            current_shelf += 1
            current_x = 0

            if current_shelf >= num_shelves:
                break  # No more shelf space

        # Add product to current shelf
        shelves[current_shelf].append({
            'sku_id': product['sku_id'],
            'name': product['name'],
            'brand': product['brand'],
            'subcategory': product['subcategory'],
            'brand_tier': product['brand_tier'],
            'size': product['size'],
            'price': product['price'],
            'facings': product['current_facings'],
            'width': product_width,
            'x_start': current_x,
            'x_end': current_x + product_width,
            'color': get_product_color(product['subcategory'], product['brand_tier'])
        })

        current_x += product_width

    return shelves


def render_planogram_visual(shelves: List[List[Dict]], shelf_width: int = 48):
    """Render visual planogram using Plotly."""
    fig = go.Figure()

    shelf_height = 8
    shelf_gap = 2
    num_shelves = len(shelves)

    # Draw each shelf
    for shelf_idx, shelf in enumerate(shelves):
        y_base = (num_shelves - 1 - shelf_idx) * (shelf_height + shelf_gap)

        # Draw shelf background
        fig.add_shape(
            type="rect",
            x0=0, y0=y_base,
            x1=shelf_width, y1=y_base + shelf_height,
            fillcolor="#ECF0F1",
            line=dict(color="#BDC3C7", width=2)
        )

        # Draw products
        for product in shelf:
            # Product rectangle
            fig.add_shape(
                type="rect",
                x0=product['x_start'],
                y0=y_base + 0.5,
                x1=product['x_end'],
                y1=y_base + shelf_height - 0.5,
                fillcolor=product['color'],
                line=dict(color="#2C3E50", width=1),
                opacity=0.9
            )

            # Product label (if wide enough)
            if product['width'] >= 4:
                label = product['name'][:15] if product['width'] >= 8 else product['brand'][:8]

                fig.add_annotation(
                    x=(product['x_start'] + product['x_end']) / 2,
                    y=y_base + shelf_height / 2,
                    text=label,
                    showarrow=False,
                    font=dict(size=8, color='white'),
                    textangle=-45 if product['width'] < 8 else 0
                )

        # Shelf label
        fig.add_annotation(
            x=-2,
            y=y_base + shelf_height / 2,
            text=f"Shelf {shelf_idx + 1}",
            showarrow=False,
            font=dict(size=10, color='#2C3E50'),
            xanchor='right'
        )

    # Add hover traces for interactivity
    for shelf_idx, shelf in enumerate(shelves):
        y_base = (num_shelves - 1 - shelf_idx) * (shelf_height + shelf_gap)

        for product in shelf:
            fig.add_trace(go.Scatter(
                x=[(product['x_start'] + product['x_end']) / 2],
                y=[y_base + shelf_height / 2],
                mode='markers',
                marker=dict(size=0.1, color='rgba(0,0,0,0)'),
                hovertemplate=(
                    f"<b>{product['name']}</b><br>"
                    f"Brand: {product['brand']}<br>"
                    f"Size: {product['size']}<br>"
                    f"Price: ${product['price']:.2f}<br>"
                    f"Facings: {product['facings']}<br>"
                    f"Width: {product['width']:.1f}\"<extra></extra>"
                ),
                showlegend=False
            ))

    fig.update_layout(
        title='Shelf Planogram',
        xaxis=dict(
            title='Width (inches)',
            range=[-5, shelf_width + 2],
            showgrid=True,
            gridcolor='#E0E0E0'
        ),
        yaxis=dict(
            title='',
            showticklabels=False,
            range=[-2, num_shelves * (shelf_height + shelf_gap)],
            showgrid=False
        ),
        height=150 + num_shelves * 100,
        showlegend=False,
        plot_bgcolor='white'
    )

    return fig


def render_legend():
    """Render color legend for subcategories."""
    st.markdown("### Legend")
    st.caption("Color coding by subcategory; darker shades indicate premium brands")

    cols = st.columns(len(SUBCATEGORY_COLORS))

    for i, (subcat, color) in enumerate(SUBCATEGORY_COLORS.items()):
        with cols[i]:
            st.markdown(
                f'<div style="background-color:{color};width:20px;height:20px;'
                f'display:inline-block;margin-right:8px;"></div>{subcat}',
                unsafe_allow_html=True
            )

    st.caption("Darker shades = Premium/National A brands | Lighter shades = National B/Store Brand")


def render_space_utilization(
    shelves: List[List[Dict]],
    shelf_width: int,
    products_df: pd.DataFrame,
    sales_df: pd.DataFrame
):
    """Render space utilization metrics."""
    st.markdown("### Space Utilization Metrics")
    st.caption("How efficiently shelf space is being used")

    # Calculate utilization
    total_capacity = len(shelves) * shelf_width
    used_width = sum(sum(p['width'] for p in shelf) for shelf in shelves)
    utilization = used_width / total_capacity * 100

    # Count products
    total_products = sum(len(shelf) for shelf in shelves)
    total_facings = sum(sum(p['facings'] for p in shelf) for shelf in shelves)

    # Calculate by subcategory
    subcat_facings = {}
    for shelf in shelves:
        for product in shelf:
            subcat = product['subcategory']
            subcat_facings[subcat] = subcat_facings.get(subcat, 0) + product['facings']

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric("Space Utilization", f"{utilization:.1f}%",
                 help="Percentage of available shelf space currently used. Target 85-95% for optimal balance.")
    with col2:
        st.metric("Products Displayed", total_products,
                 help="Number of unique products (SKUs) currently on shelf")
    with col3:
        st.metric("Total Facings", total_facings,
                 help="Total number of product facings (fronts visible to shopper)")
    with col4:
        st.metric("Available Shelves", len(shelves),
                 help="Number of shelf levels in this section")

    # Facings by subcategory
    st.markdown("#### Facings by Subcategory")
    st.caption("Distribution of shelf space across product categories")

    subcat_df = pd.DataFrame([
        {'Subcategory': k, 'Facings': v, 'Share': v / total_facings * 100}
        for k, v in subcat_facings.items()
    ]).sort_values('Facings', ascending=False)

    fig = go.Figure(go.Bar(
        x=subcat_df['Subcategory'],
        y=subcat_df['Facings'],
        marker_color=[SUBCATEGORY_COLORS.get(s, '#95A5A6') for s in subcat_df['Subcategory']],
        text=[f"{s:.1f}%" for s in subcat_df['Share']],
        textposition='outside'
    ))

    fig.update_layout(
        xaxis_title='Subcategory',
        yaxis_title='Facings',
        height=300,
        showlegend=False
    )

    st.plotly_chart(fig, use_container_width=True)

    # Add insight
    if len(subcat_df) > 0:
        top_subcat = subcat_df.iloc[0]
        st.info(f"""
        **Space Allocation Insight:** **{top_subcat['Subcategory']}** has the most shelf space ({top_subcat['Share']:.1f}% of facings).
        Ensure space allocation aligns with sales contribution for optimal productivity.
        """)


def render_shelf_editor(
    products_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """Render simple shelf editor for adjusting facings."""
    st.markdown("### Adjust Facings")
    st.caption("Modify product facing counts to see planogram changes")

    if store_id is not None:
        assortment_df = assortment_df[assortment_df['store_id'] == store_id]

    listed = assortment_df[assortment_df['is_listed']].copy()
    listed = listed.merge(
        products_df[['sku_id', 'name', 'subcategory', 'brand']],
        on='sku_id'
    )

    # Filter by subcategory
    subcats = listed['subcategory'].unique().tolist()
    selected_subcat = st.selectbox("Filter by Subcategory", options=['All'] + subcats)

    if selected_subcat != 'All':
        listed = listed[listed['subcategory'] == selected_subcat]

    # Display editable table
    st.markdown("Adjust facings for each product (changes are for visualization only):")

    edited_df = st.data_editor(
        listed[['sku_id', 'name', 'brand', 'subcategory', 'current_facings']],
        column_config={
            'sku_id': st.column_config.NumberColumn('SKU ID', disabled=True),
            'name': st.column_config.TextColumn('Product', disabled=True),
            'brand': st.column_config.TextColumn('Brand', disabled=True),
            'subcategory': st.column_config.TextColumn('Subcategory', disabled=True),
            'current_facings': st.column_config.NumberColumn(
                'Facings',
                min_value=0,
                max_value=10,
                step=1,
                help="Number of product facings on shelf"
            )
        },
        hide_index=True,
        use_container_width=True,
        height=300,
        key='facing_editor'
    )

    return edited_df


def render_planogram_page(
    products_df: pd.DataFrame,
    sales_df: pd.DataFrame,
    assortment_df: pd.DataFrame,
    stores_df: pd.DataFrame,
    store_id: Optional[int] = None
):
    """
    Render complete planogram page.
    """
    st.subheader("Visual Planogram")

    with st.expander("About Planograms", expanded=False):
        st.markdown("""
        **What is a Planogram?**

        A planogram is a visual diagram showing how products should be arranged on retail shelves.
        It specifies:
        - Which products to display
        - How many facings (fronts) each product gets
        - Where products are positioned on the shelf

        **Why Planograms Matter:**

        - **Consistency**: Ensures all stores execute the same strategy
        - **Productivity**: Optimal space allocation maximizes sales per foot
        - **Shopper Experience**: Logical organization helps customers find products
        - **Replenishment**: Clear layouts speed up restocking

        **Reading This Visualization:**
        - Colors represent subcategories (Soft Drinks, Juices, Water, Energy Drinks)
        - Darker shades indicate premium/national brands
        - Lighter shades indicate value/store brands
        - Width represents number of facings
        - Hover over products for details
        """)

    st.markdown("""
    View and explore the shelf layout with product placement visualization.
    Products are organized by subcategory and colored to show category mix.
    """)

    # Configuration
    st.markdown("### Shelf Configuration")
    st.caption("Adjust the physical shelf dimensions")

    col1, col2 = st.columns(2)

    with col1:
        shelf_width = st.slider(
            "Shelf Width (inches)",
            min_value=36,
            max_value=72,
            value=48,
            step=6,
            help="Width of each shelf section. Standard sections are 48\" (4 feet)."
        )

    with col2:
        num_shelves = st.slider(
            "Number of Shelves",
            min_value=2,
            max_value=8,
            value=4,
            help="Number of vertical shelf levels. Beverages typically use 4-6 shelves."
        )

    st.divider()

    # Create shelf layout
    shelves = create_shelf_layout(
        products_df=products_df,
        assortment_df=assortment_df,
        store_id=store_id,
        shelf_width=shelf_width,
        num_shelves=num_shelves
    )

    # Legend
    render_legend()

    st.divider()

    # Main planogram visual
    fig = render_planogram_visual(shelves, shelf_width)
    st.plotly_chart(fig, use_container_width=True)

    st.divider()

    # Space utilization metrics
    render_space_utilization(shelves, shelf_width, products_df, sales_df)

    st.divider()

    # Shelf editor
    with st.expander("Adjust Product Facings", expanded=False):
        edited = render_shelf_editor(products_df, assortment_df, store_id)

        if st.button("Apply Changes & Refresh"):
            # In a real app, this would update the assortment
            st.info("Facing changes would be applied here. Refresh to see updated planogram.")
            st.rerun()
