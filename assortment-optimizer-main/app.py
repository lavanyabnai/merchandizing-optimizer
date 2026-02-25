"""
FMCG Assortment Advisor - Streamlit Application
Main entry point with tab navigation for all features.
"""

import streamlit as st
import pandas as pd
from typing import Optional

# Import data generator
from data.generator import load_all_data

# Import UI components
from components.dashboard import render_dashboard
from components.cdt_analysis import render_cdt_analysis
from components.optimization import render_optimization_page
from components.simulation import render_simulation_page
from components.clustering import render_clustering_page
from components.planogram import render_planogram_page


# Page configuration
st.set_page_config(
    page_title="Assortment Advisor",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="expanded"
)


@st.cache_data
def load_data():
    """Load and cache synthetic data."""
    return load_all_data()


def render_sidebar(data: dict) -> Optional[int]:
    """
    Render sidebar controls.

    Returns:
        Selected store ID or None for all stores
    """
    st.sidebar.title("🛒 Assortment Advisor")
    st.sidebar.markdown("---")

    # Store selector
    st.sidebar.subheader("Store Selection")

    stores_df = data['stores']
    store_options = ['All Stores'] + [
        f"{row['name']} ({row['format']})"
        for _, row in stores_df.iterrows()
    ]

    selected_store = st.sidebar.selectbox(
        "Select Store",
        options=store_options,
        index=0
    )

    if selected_store == 'All Stores':
        store_id = None
    else:
        # Extract store ID from selection
        store_name = selected_store.split(' (')[0]
        store_id = stores_df[stores_df['name'] == store_name]['store_id'].iloc[0]

    # Show store info if specific store selected
    if store_id is not None:
        store_info = stores_df[stores_df['store_id'] == store_id].iloc[0]
        st.sidebar.markdown(f"""
        **Format:** {store_info['format']}
        **Location:** {store_info['location']}
        **Income Index:** {store_info['income_index']}
        **Weekly Traffic:** {store_info['weekly_traffic']:,}
        """)

    st.sidebar.markdown("---")

    # Category filter
    st.sidebar.subheader("Category Filter")

    products_df = data['products']
    subcategories = products_df['subcategory'].unique().tolist()

    selected_subcats = st.sidebar.multiselect(
        "Subcategories",
        options=subcategories,
        default=subcategories,
        help="Filter products by subcategory"
    )

    # Store selection in session state for use by components
    st.session_state['selected_subcategories'] = selected_subcats

    st.sidebar.markdown("---")

    # Quick stats
    st.sidebar.subheader("Quick Stats")

    sales_df = data['sales']
    if store_id is not None:
        sales_df = sales_df[sales_df['store_id'] == store_id]

    total_revenue = sales_df['revenue'].sum()
    total_profit = sales_df['profit'].sum()
    avg_weekly = total_revenue / 52

    st.sidebar.metric("Total Revenue (52 wk)", f"${total_revenue:,.0f}")
    st.sidebar.metric("Avg Weekly Revenue", f"${avg_weekly:,.0f}")
    st.sidebar.metric("Profit Margin", f"{total_profit/total_revenue*100:.1f}%")

    st.sidebar.markdown("---")

    # About section
    st.sidebar.markdown("""
    ### About
    This demo showcases FMCG assortment optimization
    capabilities for the **Beverages** category.

    **Features:**
    - KPI Dashboard
    - Consumer Decision Tree
    - MILP Optimization
    - Monte Carlo Simulation
    - Store Clustering
    - Visual Planogram

    Built with Streamlit, OR-Tools, and scikit-learn.
    """)

    return store_id


def filter_data_by_subcategory(data: dict) -> dict:
    """Filter data based on selected subcategories."""
    selected_subcats = st.session_state.get('selected_subcategories', [])

    if not selected_subcats or len(selected_subcats) == len(data['products']['subcategory'].unique()):
        return data

    # Filter products
    filtered_products = data['products'][
        data['products']['subcategory'].isin(selected_subcats)
    ]

    # Filter sales to matching SKUs
    filtered_sales = data['sales'][
        data['sales']['sku_id'].isin(filtered_products['sku_id'])
    ]

    # Filter assortment to matching SKUs
    filtered_assortment = data['assortment'][
        data['assortment']['sku_id'].isin(filtered_products['sku_id'])
    ]

    return {
        **data,
        'products': filtered_products,
        'sales': filtered_sales,
        'assortment': filtered_assortment
    }


def main():
    """Main application entry point."""
    # Load data
    data = load_data()

    # Render sidebar and get store selection
    store_id = render_sidebar(data)

    # Filter data by subcategory
    filtered_data = filter_data_by_subcategory(data)

    # Main content area
    st.title("Beverages Category - Assortment Advisor")

    # Tab navigation
    tabs = st.tabs([
        "📊 Dashboard",
        "🌳 CDT Analysis",
        "⚡ Optimizer",
        "🎲 What-If",
        "🏪 Store Clusters",
        "📦 Planogram"
    ])

    # Dashboard Tab
    with tabs[0]:
        render_dashboard(
            sales_df=filtered_data['sales'],
            products_df=filtered_data['products'],
            assortment_df=filtered_data['assortment'],
            stores_df=filtered_data['stores'],
            store_id=store_id
        )

    # CDT Analysis Tab
    with tabs[1]:
        render_cdt_analysis(
            sales_df=filtered_data['sales'],
            products_df=filtered_data['products'],
            switching_df=filtered_data['switching_matrix'],
            importance_df=filtered_data['attribute_importance'],
            store_id=store_id
        )

    # Optimizer Tab
    with tabs[2]:
        render_optimization_page(
            products_df=filtered_data['products'],
            sales_df=filtered_data['sales'],
            assortment_df=filtered_data['assortment'],
            stores_df=filtered_data['stores'],
            store_id=store_id
        )

    # What-If Simulation Tab
    with tabs[3]:
        render_simulation_page(
            products_df=filtered_data['products'],
            sales_df=filtered_data['sales'],
            assortment_df=filtered_data['assortment'],
            store_id=store_id
        )

    # Store Clusters Tab
    with tabs[4]:
        render_clustering_page(
            products_df=data['products'],  # Use full data for clustering
            sales_df=data['sales'],
            stores_df=data['stores']
        )

    # Planogram Tab
    with tabs[5]:
        render_planogram_page(
            products_df=filtered_data['products'],
            sales_df=filtered_data['sales'],
            assortment_df=filtered_data['assortment'],
            stores_df=filtered_data['stores'],
            store_id=store_id
        )


if __name__ == "__main__":
    main()
