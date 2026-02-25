"""
Store clustering model using K-means and GMM.
Clusters stores based on sales patterns and demographics.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score


@dataclass
class ClusteringResult:
    """Results from store clustering."""
    n_clusters: int
    cluster_labels: np.ndarray
    cluster_centers: np.ndarray
    silhouette_score: float
    inertia: Optional[float]
    store_features: pd.DataFrame
    pca_coords: np.ndarray
    cluster_profiles: pd.DataFrame


class StoreClustering:
    """
    Store clustering based on sales patterns and demographics.

    Features used for clustering:
    - Total category sales (normalized)
    - Premium brand share
    - Private label share
    - Average basket size
    - Store format encoding
    """

    def __init__(self, method: str = 'kmeans', random_state: int = 42):
        """
        Initialize clustering model.

        Args:
            method: 'kmeans' or 'gmm'
            random_state: Random seed
        """
        self.method = method
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.pca = PCA(n_components=2)

    def prepare_features(
        self,
        stores: pd.DataFrame,
        sales: pd.DataFrame,
        products: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Prepare clustering features for each store.

        Args:
            stores: Store data
            sales: Sales data
            products: Product data

        Returns:
            DataFrame with store features
        """
        # Merge sales with products to get brand info
        sales_with_products = sales.merge(
            products[['sku_id', 'brand_tier', 'subcategory', 'price_tier']],
            on='sku_id'
        )

        features = []

        for _, store in stores.iterrows():
            store_id = store['store_id']
            store_sales = sales_with_products[sales_with_products['store_id'] == store_id]

            if len(store_sales) == 0:
                continue

            total_revenue = store_sales['revenue'].sum()
            total_units = store_sales['units_sold'].sum()

            # Premium brand share
            premium_revenue = store_sales[
                store_sales['brand_tier'].isin(['Premium', 'National A'])
            ]['revenue'].sum()
            premium_share = premium_revenue / total_revenue if total_revenue > 0 else 0

            # Private label share
            pl_revenue = store_sales[
                store_sales['brand_tier'] == 'Store Brand'
            ]['revenue'].sum()
            pl_share = pl_revenue / total_revenue if total_revenue > 0 else 0

            # Subcategory mix
            subcat_shares = {}
            for subcat in products['subcategory'].unique():
                subcat_rev = store_sales[
                    store_sales['subcategory'] == subcat
                ]['revenue'].sum()
                subcat_shares[f'{subcat}_share'] = subcat_rev / total_revenue if total_revenue > 0 else 0

            # Average transaction value proxy (revenue per unit)
            avg_basket = total_revenue / total_units if total_units > 0 else 0

            # Format encoding
            format_codes = {'Express': 0, 'Standard': 1, 'Superstore': 2}
            format_code = format_codes.get(store['format'], 1)

            # Income encoding
            income_codes = {'Low': 0, 'Medium': 1, 'High': 2}
            income_code = income_codes.get(store['income_index'], 1)

            feature_row = {
                'store_id': store_id,
                'total_revenue': total_revenue,
                'premium_share': premium_share,
                'pl_share': pl_share,
                'avg_basket': avg_basket,
                'format_code': format_code,
                'income_code': income_code,
                'weekly_traffic': store['weekly_traffic'],
                **subcat_shares
            }

            features.append(feature_row)

        return pd.DataFrame(features)

    def find_optimal_k(
        self,
        features: pd.DataFrame,
        k_range: Tuple[int, int] = (2, 8)
    ) -> Tuple[int, List[float], List[float]]:
        """
        Find optimal number of clusters using elbow method and silhouette score.

        Args:
            features: Store features
            k_range: Range of k values to test

        Returns:
            Tuple of (optimal_k, inertias, silhouette_scores)
        """
        feature_cols = [c for c in features.columns if c != 'store_id']
        X = self.scaler.fit_transform(features[feature_cols])

        inertias = []
        silhouettes = []

        for k in range(k_range[0], k_range[1] + 1):
            kmeans = KMeans(n_clusters=k, random_state=self.random_state, n_init=10)
            labels = kmeans.fit_predict(X)

            inertias.append(kmeans.inertia_)
            silhouettes.append(silhouette_score(X, labels))

        # Find optimal k (highest silhouette score)
        optimal_idx = np.argmax(silhouettes)
        optimal_k = k_range[0] + optimal_idx

        return optimal_k, inertias, silhouettes

    def fit_predict(
        self,
        stores: pd.DataFrame,
        sales: pd.DataFrame,
        products: pd.DataFrame,
        n_clusters: Optional[int] = None
    ) -> ClusteringResult:
        """
        Fit clustering model and predict cluster assignments.

        Args:
            stores: Store data
            sales: Sales data
            products: Product data
            n_clusters: Number of clusters (auto-select if None)

        Returns:
            ClusteringResult
        """
        # Prepare features
        features = self.prepare_features(stores, sales, products)
        feature_cols = [c for c in features.columns if c != 'store_id']

        X = self.scaler.fit_transform(features[feature_cols])

        # Auto-select k if not specified
        if n_clusters is None:
            n_clusters, _, _ = self.find_optimal_k(features)

        # Fit model
        if self.method == 'kmeans':
            model = KMeans(n_clusters=n_clusters, random_state=self.random_state, n_init=10)
            labels = model.fit_predict(X)
            centers = model.cluster_centers_
            inertia = model.inertia_
        else:  # GMM
            model = GaussianMixture(
                n_components=n_clusters,
                random_state=self.random_state,
                n_init=3
            )
            labels = model.fit_predict(X)
            centers = model.means_
            inertia = None

        # Calculate silhouette score
        sil_score = silhouette_score(X, labels)

        # PCA for visualization
        pca_coords = self.pca.fit_transform(X)

        # Add cluster labels to features
        features['cluster'] = labels

        # Create cluster profiles
        profiles = self._create_cluster_profiles(features, stores)

        return ClusteringResult(
            n_clusters=n_clusters,
            cluster_labels=labels,
            cluster_centers=centers,
            silhouette_score=round(sil_score, 3),
            inertia=round(inertia, 2) if inertia else None,
            store_features=features,
            pca_coords=pca_coords,
            cluster_profiles=profiles
        )

    def _create_cluster_profiles(
        self,
        features: pd.DataFrame,
        stores: pd.DataFrame
    ) -> pd.DataFrame:
        """Create summary profiles for each cluster."""
        # Merge with store info
        merged = features.merge(stores[['store_id', 'format', 'location', 'income_index']], on='store_id')

        profiles = []
        for cluster_id in sorted(features['cluster'].unique()):
            cluster_data = merged[merged['cluster'] == cluster_id]

            profile = {
                'cluster': cluster_id,
                'n_stores': len(cluster_data),
                'avg_revenue': round(cluster_data['total_revenue'].mean(), 0),
                'avg_premium_share': round(cluster_data['premium_share'].mean() * 100, 1),
                'avg_pl_share': round(cluster_data['pl_share'].mean() * 100, 1),
                'avg_basket': round(cluster_data['avg_basket'].mean(), 2),
                'dominant_format': cluster_data['format'].mode().iloc[0] if len(cluster_data) > 0 else 'Standard',
                'dominant_location': cluster_data['location'].mode().iloc[0] if len(cluster_data) > 0 else 'Suburban',
                'dominant_income': cluster_data['income_index'].mode().iloc[0] if len(cluster_data) > 0 else 'Medium'
            }

            # Add subcategory shares if present
            subcat_cols = [c for c in cluster_data.columns if c.endswith('_share') and c not in ['premium_share', 'pl_share']]
            for col in subcat_cols:
                subcat_name = col.replace('_share', '')
                profile[f'avg_{col}'] = round(cluster_data[col].mean() * 100, 1)

            profiles.append(profile)

        return pd.DataFrame(profiles)

    def get_cluster_name(self, profile: pd.Series) -> str:
        """Generate a descriptive name for a cluster based on its profile."""
        names = []

        # Based on income
        if profile.get('dominant_income') == 'High':
            names.append('Premium')
        elif profile.get('dominant_income') == 'Low':
            names.append('Value')

        # Based on format
        if profile.get('dominant_format') == 'Superstore':
            names.append('High-Volume')
        elif profile.get('dominant_format') == 'Express':
            names.append('Convenience')

        # Based on location
        if profile.get('dominant_location') == 'Urban':
            names.append('Urban')
        elif profile.get('dominant_location') == 'Rural':
            names.append('Rural')
        else:
            names.append('Suburban')

        return ' '.join(names) if names else f"Cluster {profile.get('cluster', 0)}"

    def recommend_assortment_by_cluster(
        self,
        cluster_profiles: pd.DataFrame,
        products: pd.DataFrame
    ) -> Dict[int, Dict]:
        """
        Recommend assortment strategy for each cluster.

        Args:
            cluster_profiles: Cluster profile data
            products: Product data

        Returns:
            Dictionary mapping cluster ID to recommendation
        """
        recommendations = {}

        for _, profile in cluster_profiles.iterrows():
            cluster_id = profile['cluster']

            rec = {
                'cluster_name': self.get_cluster_name(profile),
                'strategy': '',
                'brand_focus': [],
                'price_focus': '',
                'subcategory_focus': []
            }

            # Determine strategy based on profile
            premium_share = profile.get('avg_premium_share', 50)
            pl_share = profile.get('avg_pl_share', 20)

            if premium_share > 55:
                rec['strategy'] = 'Premium-focused assortment with strong national brands'
                rec['brand_focus'] = ['Premium', 'National A']
                rec['price_focus'] = 'Mid to Premium tiers'
            elif pl_share > 30:
                rec['strategy'] = 'Value-focused assortment with strong private label presence'
                rec['brand_focus'] = ['Store Brand', 'National B']
                rec['price_focus'] = 'Value and Mid tiers'
            else:
                rec['strategy'] = 'Balanced assortment across all price points'
                rec['brand_focus'] = ['National A', 'National B', 'Store Brand']
                rec['price_focus'] = 'All price tiers'

            # Determine subcategory focus
            subcat_shares = {
                k.replace('avg_', '').replace('_share', ''): v
                for k, v in profile.items()
                if k.startswith('avg_') and k.endswith('_share')
                and k not in ['avg_premium_share', 'avg_pl_share']
            }

            if subcat_shares:
                sorted_subcats = sorted(subcat_shares.items(), key=lambda x: x[1], reverse=True)
                rec['subcategory_focus'] = [s[0] for s in sorted_subcats[:2]]

            recommendations[cluster_id] = rec

        return recommendations
