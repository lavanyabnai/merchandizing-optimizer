"""
Store Clustering UI component for Streamlit app.
Provides interface for clustering stores and viewing cluster profiles.
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Optional

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from models.clustering import StoreClustering, ClusteringResult


def render_cluster_settings() -> dict:
    """Render clustering configuration settings."""
    st.markdown("### Clustering Configuration")

    with st.expander("Understanding Clustering Methods", expanded=False):
        st.markdown("""
        **K-Means Clustering:**
        - Groups stores into K distinct clusters based on similarity
        - Each store belongs to exactly one cluster
        - Fast and works well when clusters are spherical
        - Best for: Clear segmentation with distinct boundaries

        **Gaussian Mixture Model (GMM):**
        - Probabilistic approach - stores have probability of belonging to each cluster
        - Better at handling overlapping clusters
        - Can capture clusters of different shapes and sizes
        - Best for: When stores may share characteristics of multiple segments

        **How many clusters (K)?**
        - Too few: Loses nuance in store differences
        - Too many: Over-segments, making strategies impractical
        - Sweet spot: Usually 3-6 clusters for store networks
        """)

    col1, col2 = st.columns(2)

    with col1:
        method = st.selectbox(
            "Clustering Method",
            options=['kmeans', 'gmm'],
            format_func=lambda x: {'kmeans': 'K-Means', 'gmm': 'Gaussian Mixture Model'}[x],
            help="K-Means is faster and simpler. GMM is more flexible but computationally heavier."
        )

        auto_k = st.checkbox("Auto-select number of clusters", value=True,
                            help="Uses silhouette score to find the optimal number of clusters")

    with col2:
        if not auto_k:
            n_clusters = st.slider(
                "Number of Clusters",
                min_value=2,
                max_value=8,
                value=4,
                help="Number of store clusters to create. 4-6 is typical for retail networks."
            )
        else:
            n_clusters = None
            st.caption("Optimal K will be determined automatically")

    return {
        'method': method,
        'n_clusters': n_clusters
    }


def render_cluster_scatter(result: ClusteringResult, stores_df: pd.DataFrame):
    """Render 2D PCA scatter plot of store clusters."""
    st.markdown("### Store Cluster Map")
    st.caption("PCA projection of store features - stores close together are similar")

    # Create DataFrame with PCA coordinates and cluster labels
    plot_df = pd.DataFrame({
        'PC1': result.pca_coords[:, 0],
        'PC2': result.pca_coords[:, 1],
        'cluster': result.cluster_labels.astype(str),
        'store_id': result.store_features['store_id'].values
    })

    # Merge with store info
    plot_df = plot_df.merge(
        stores_df[['store_id', 'name', 'format', 'location']],
        on='store_id'
    )

    fig = px.scatter(
        plot_df,
        x='PC1',
        y='PC2',
        color='cluster',
        hover_data=['name', 'format', 'location'],
        title='Store Clusters (PCA Projection)',
        labels={'cluster': 'Cluster'},
        color_discrete_sequence=px.colors.qualitative.Set1
    )

    fig.update_traces(marker=dict(size=12))

    fig.update_layout(
        height=450,
        xaxis_title='Principal Component 1',
        yaxis_title='Principal Component 2'
    )

    st.plotly_chart(fig, use_container_width=True)

    st.info("""
    **Reading the Map:** Each dot is a store. Stores clustered together share similar characteristics
    (sales patterns, customer preferences). Hover over dots to see store details.
    """)


def render_cluster_profiles(result: ClusteringResult):
    """Render cluster profile summary table and radar chart."""
    st.markdown("### Cluster Profiles")
    st.caption("Characteristics that define each store segment")

    profiles = result.cluster_profiles

    # Display metrics
    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric("Number of Clusters", result.n_clusters,
                 help="Total number of distinct store segments identified")
    with col2:
        score_quality = "Excellent" if result.silhouette_score > 0.5 else ("Good" if result.silhouette_score > 0.3 else "Fair")
        st.metric("Silhouette Score", f"{result.silhouette_score:.3f}",
                 help=f"Clustering quality: {score_quality}. Range 0-1, higher is better. >0.5 is excellent, >0.3 is good.")
    with col3:
        if result.inertia:
            st.metric("Inertia", f"{result.inertia:,.0f}",
                     help="Within-cluster sum of squares. Lower indicates tighter clusters.")

    st.divider()

    # Profile table
    display_cols = ['cluster', 'n_stores', 'avg_revenue', 'avg_premium_share',
                   'avg_pl_share', 'dominant_format', 'dominant_location', 'dominant_income']
    display_cols = [c for c in display_cols if c in profiles.columns]

    st.dataframe(
        profiles[display_cols],
        column_config={
            'cluster': 'Cluster',
            'n_stores': st.column_config.NumberColumn('Stores', help="Number of stores in this cluster"),
            'avg_revenue': st.column_config.NumberColumn('Avg Revenue', format="$%,.0f", help="Average weekly revenue"),
            'avg_premium_share': st.column_config.NumberColumn('Premium %', format="%.1f%%", help="Share of premium brand sales"),
            'avg_pl_share': st.column_config.NumberColumn('Private Label %', format="%.1f%%", help="Share of store brand sales"),
            'dominant_format': st.column_config.TextColumn('Format', help="Most common store format"),
            'dominant_location': st.column_config.TextColumn('Location', help="Most common location type"),
            'dominant_income': st.column_config.TextColumn('Income', help="Dominant income level in trade area")
        },
        hide_index=True,
        use_container_width=True
    )

    st.info("""
    **Profile Insight:** Use these characteristics to name and describe each cluster
    (e.g., "Premium Urban", "Value Suburban"). This helps communicate strategies across the organization.
    """)

    # Radar chart of cluster characteristics
    st.markdown("### Cluster Comparison")
    st.caption("Visual comparison of key metrics across clusters (normalized to 0-1 scale)")

    metrics = ['avg_revenue', 'avg_premium_share', 'avg_pl_share', 'avg_basket']
    metric_labels = ['Revenue', 'Premium Share', 'PL Share', 'Basket Size']

    # Filter to available metrics
    available = [(m, l) for m, l in zip(metrics, metric_labels) if m in profiles.columns]
    if not available:
        return

    metrics, metric_labels = zip(*available)

    fig = go.Figure()

    for _, row in profiles.iterrows():
        values = [row.get(m, 0) for m in metrics]
        # Normalize for radar chart
        max_vals = [profiles[m].max() for m in metrics]
        normalized = [v / mx if mx > 0 else 0 for v, mx in zip(values, max_vals)]
        normalized.append(normalized[0])  # Close the loop

        fig.add_trace(go.Scatterpolar(
            r=normalized,
            theta=list(metric_labels) + [metric_labels[0]],
            fill='toself',
            name=f"Cluster {row['cluster']}"
        ))

    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 1])
        ),
        showlegend=True,
        height=400,
        title='Cluster Characteristics (Normalized)'
    )

    st.plotly_chart(fig, use_container_width=True)


def render_cluster_recommendations(
    result: ClusteringResult,
    products_df: pd.DataFrame,
    clustering_model: StoreClustering
):
    """Render assortment recommendations per cluster."""
    st.markdown("### Assortment Recommendations by Cluster")
    st.caption("Tailored strategies based on each cluster's characteristics")

    with st.expander("How Recommendations are Generated", expanded=False):
        st.markdown("""
        **Recommendation Logic:**

        Each cluster's profile drives specific assortment strategies:

        - **High Premium Share** → Focus on National A brands, premium sizes
        - **High Private Label Share** → Emphasize Store Brand depth, value positioning
        - **Urban + High Traffic** → More single-serve, grab-and-go options
        - **Suburban + High Income** → Multi-packs, family sizes, premium options
        - **Rural + Low Traffic** → Core assortment only, reduce complexity

        **Note:** These are directional guidelines. Always validate with local market knowledge.
        """)

    recommendations = clustering_model.recommend_assortment_by_cluster(
        result.cluster_profiles,
        products_df
    )

    for cluster_id, rec in recommendations.items():
        with st.expander(f"Cluster {cluster_id}: {rec['cluster_name']}", expanded=True):
            st.markdown(f"**Strategy:** {rec['strategy']}")

            col1, col2 = st.columns(2)

            with col1:
                st.markdown("**Brand Focus:**")
                for brand in rec['brand_focus']:
                    st.markdown(f"- {brand}")

            with col2:
                st.markdown(f"**Price Focus:** {rec['price_focus']}")

                if rec.get('subcategory_focus'):
                    st.markdown("**Top Subcategories:**")
                    for subcat in rec['subcategory_focus']:
                        st.markdown(f"- {subcat}")


def render_store_cluster_map(
    result: ClusteringResult,
    stores_df: pd.DataFrame
):
    """Render store list with cluster assignments."""
    st.markdown("### Store Cluster Assignments")
    st.caption("Complete list of stores with their assigned clusters")

    # Create mapping table
    store_clusters = pd.DataFrame({
        'store_id': result.store_features['store_id'],
        'cluster': result.cluster_labels
    })

    store_clusters = store_clusters.merge(
        stores_df[['store_id', 'name', 'format', 'location', 'income_index', 'weekly_traffic']],
        on='store_id'
    )

    # Add features from clustering
    store_clusters = store_clusters.merge(
        result.store_features[['store_id', 'total_revenue', 'premium_share', 'pl_share']],
        on='store_id'
    )

    # Filter by cluster
    selected_cluster = st.selectbox(
        "Filter by Cluster",
        options=['All'] + list(range(result.n_clusters)),
        format_func=lambda x: 'All Clusters' if x == 'All' else f'Cluster {x}'
    )

    if selected_cluster != 'All':
        store_clusters = store_clusters[store_clusters['cluster'] == selected_cluster]

    st.dataframe(
        store_clusters,
        column_config={
            'store_id': 'ID',
            'name': 'Store',
            'cluster': 'Cluster',
            'format': 'Format',
            'location': 'Location',
            'income_index': 'Income',
            'weekly_traffic': st.column_config.NumberColumn('Traffic', format="%,d"),
            'total_revenue': st.column_config.NumberColumn('Revenue', format="$%,.0f"),
            'premium_share': st.column_config.NumberColumn('Premium %', format="%.1f%%"),
            'pl_share': st.column_config.NumberColumn('PL %', format="%.1f%%")
        },
        hide_index=True,
        use_container_width=True,
        height=400
    )


def render_elbow_chart(
    features_df: pd.DataFrame,
    clustering_model: StoreClustering
):
    """Render elbow chart for optimal K selection."""
    st.caption("Finding the optimal number of clusters using elbow method and silhouette score")

    optimal_k, inertias, silhouettes = clustering_model.find_optimal_k(features_df)

    k_values = list(range(2, 9))

    fig = go.Figure()

    # Inertia line
    fig.add_trace(go.Scatter(
        x=k_values,
        y=inertias,
        name='Inertia',
        mode='lines+markers',
        yaxis='y1',
        line=dict(color='#2E86AB')
    ))

    # Silhouette line
    fig.add_trace(go.Scatter(
        x=k_values,
        y=silhouettes,
        name='Silhouette Score',
        mode='lines+markers',
        yaxis='y2',
        line=dict(color='#28A745')
    ))

    # Mark optimal K
    fig.add_vline(x=optimal_k, line_dash="dash", line_color="red",
                 annotation_text=f"Optimal K={optimal_k}")

    fig.update_layout(
        title='Optimal Number of Clusters',
        xaxis_title='Number of Clusters (K)',
        yaxis=dict(title='Inertia', side='left', color='#2E86AB'),
        yaxis2=dict(title='Silhouette Score', side='right', overlaying='y', color='#28A745'),
        height=350,
        legend=dict(orientation='h', yanchor='bottom', y=1.02)
    )

    st.plotly_chart(fig, use_container_width=True)

    st.info(f"Recommended number of clusters: **{optimal_k}** (based on silhouette score)")

    with st.expander("Understanding the Chart", expanded=False):
        st.markdown("""
        **Two methods for finding optimal K:**

        - **Inertia (blue line)**: Measures how tight clusters are. Look for the "elbow" where
          adding more clusters stops significantly reducing inertia.

        - **Silhouette Score (green line)**: Measures how well-separated clusters are.
          Higher is better (range 0-1). Pick K where silhouette peaks.

        **The red dashed line** shows the recommended K based on these metrics.
        """)


def render_clustering_page(
    products_df: pd.DataFrame,
    sales_df: pd.DataFrame,
    stores_df: pd.DataFrame
):
    """
    Render complete store clustering page.
    """
    st.subheader("Store Clustering")

    with st.expander("About Store Clustering", expanded=False):
        st.markdown("""
        **What is Store Clustering?**

        Store clustering groups similar stores together based on their characteristics
        and shopping patterns. Instead of creating custom assortments for every store,
        you can develop strategies for each cluster and apply them efficiently.

        **Why cluster stores?**

        - **Efficiency**: Manage 4-6 assortment strategies instead of hundreds
        - **Relevance**: Match assortments to local shopper preferences
        - **Insights**: Understand what drives performance differences

        **Features used for clustering:**
        - Total category revenue (sales volume)
        - Premium brand share (shopper preferences)
        - Private label share (price sensitivity)
        - Store format and location
        - Trade area demographics

        **Output:**
        - Cluster assignments for each store
        - Cluster profiles describing key characteristics
        - Tailored assortment recommendations per cluster
        """)

    st.markdown("""
    Cluster stores based on sales patterns, demographics, and category mix
    to develop tailored assortment strategies for each store segment.
    """)

    # Clustering settings
    settings = render_cluster_settings()

    # Initialize clustering model
    clustering_model = StoreClustering(method=settings['method'])

    # Prepare features
    features_df = clustering_model.prepare_features(stores_df, sales_df, products_df)

    st.divider()

    # Show elbow chart if auto-selecting K
    if settings['n_clusters'] is None:
        st.markdown("### Finding Optimal K")
        render_elbow_chart(features_df, clustering_model)

    st.divider()

    # Run clustering button
    run_button = st.button("Run Clustering", type="primary")

    if run_button:
        with st.spinner("Clustering stores..."):
            result = clustering_model.fit_predict(
                stores=stores_df,
                sales=sales_df,
                products=products_df,
                n_clusters=settings['n_clusters']
            )

            # Store in session state
            st.session_state['clustering_result'] = result
            st.session_state['clustering_model'] = clustering_model

    # Display results if available
    if 'clustering_result' in st.session_state:
        result = st.session_state['clustering_result']
        model = st.session_state['clustering_model']

        st.divider()

        # Scatter plot
        render_cluster_scatter(result, stores_df)

        st.divider()

        # Cluster profiles
        render_cluster_profiles(result)

        st.divider()

        # Recommendations
        render_cluster_recommendations(result, products_df, model)

        st.divider()

        # Store mapping
        render_store_cluster_map(result, stores_df)
