"""Store Clustering Service using K-Means and GMM."""

import time
import uuid
from collections import Counter
from typing import Any

import numpy as np
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.mixture import GaussianMixture
from sklearn.preprocessing import StandardScaler
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import (
    AssortmentProduct,
    AssortmentSale,
    AssortmentStore,
    BrandTier,
    ClusteringRun,
    OptimizationStatus,
)
from app.schemas.clustering import (
    ClusteringMethod,
    ClusteringRequest,
    ClusteringResult,
    ClusterProfile,
    ClusterRecommendation,
    OptimalKResult,
    PCACoordinate,
    StoreClusterAssignment,
    VisualizationData,
)


class ClusteringService:
    """Service for clustering stores based on sales patterns and demographics."""

    # Format encoding for numerical features
    FORMAT_CODES = {"Express": 0, "Standard": 1, "Superstore": 2}
    INCOME_CODES = {"Low": 0, "Medium": 1, "High": 2}
    LOCATION_CODES = {"Urban": 0, "Suburban": 1, "Rural": 2}

    def __init__(
        self,
        session: AsyncSession,
        request: ClusteringRequest | None = None,
    ):
        """Initialize clustering service.

        Args:
            session: Database session
            request: Clustering configuration
        """
        self._session = session
        self._request = request or ClusteringRequest()
        self._scaler = StandardScaler()
        self._pca = PCA(n_components=2)
        self._rng = np.random.default_rng(self._request.random_seed)

    async def cluster_stores(self) -> ClusteringResult:
        """Run store clustering.

        Returns:
            Complete clustering result
        """
        start_time = time.time()
        run_id = uuid.uuid4()

        # Load data
        stores = await self._load_stores()
        sales_data = await self._load_sales_with_products()

        if len(stores) < 2:
            raise ValueError("Need at least 2 stores for clustering")

        # Extract features
        features, store_ids, store_codes = self._extract_features(stores, sales_data)

        if len(features) < 2:
            raise ValueError("Insufficient data for clustering")

        # Standardize features
        X = self._scaler.fit_transform(features)

        # Determine number of clusters
        n_clusters = self._request.n_clusters
        if n_clusters is None:
            n_clusters = self._find_optimal_k(X, max_k=min(self._request.max_clusters, len(X) - 1))

        # Ensure valid n_clusters
        n_clusters = min(n_clusters, len(X) - 1)
        n_clusters = max(n_clusters, 2)

        # Run clustering
        if self._request.method == ClusteringMethod.KMEANS:
            labels, centers, inertia = self._run_kmeans(X, n_clusters)
        else:
            labels, centers, inertia = self._run_gmm(X, n_clusters)

        # Calculate silhouette score
        sil_score = silhouette_score(X, labels) if len(set(labels)) > 1 else 0.0

        # Compute PCA coordinates
        pca_coords = self._pca.fit_transform(X)
        centers_pca = self._pca.transform(centers)

        # Build store lookup
        store_lookup = {str(s.id): s for s in stores}

        # Build results
        store_assignments = self._build_store_assignments(
            store_ids, store_codes, labels, store_lookup
        )

        pca_coordinates = self._build_pca_coordinates(
            store_ids, store_codes, labels, pca_coords, features
        )

        cluster_profiles = self._build_cluster_profiles(
            stores, sales_data, store_ids, labels
        )

        execution_time_ms = int((time.time() - start_time) * 1000)

        # Save to database
        await self._save_clustering_run(
            run_id=run_id,
            n_clusters=n_clusters,
            sil_score=sil_score,
            store_ids=store_ids,
            labels=labels,
            cluster_profiles=cluster_profiles,
            pca_coordinates=pca_coordinates,
            execution_time_ms=execution_time_ms,
        )

        return ClusteringResult(
            run_id=run_id,
            method=self._request.method,
            n_clusters=n_clusters,
            silhouette_score=round(sil_score, 4),
            inertia=round(inertia, 2) if inertia is not None else None,
            store_assignments=store_assignments,
            cluster_profiles=cluster_profiles,
            pca_coordinates=pca_coordinates,
            features_used=self._request.features,
            status=OptimizationStatus.COMPLETED,
            execution_time_ms=execution_time_ms,
            created_at=ClusteringRun.__table__.c.created_at.default.arg(),
        )

    async def _load_stores(self) -> list[AssortmentStore]:
        """Load all active stores."""
        result = await self._session.execute(
            select(AssortmentStore).where(AssortmentStore.is_active == True)
        )
        return list(result.scalars().all())

    async def _load_sales_with_products(self) -> list[dict[str, Any]]:
        """Load sales data with product information."""
        result = await self._session.execute(
            select(
                AssortmentSale.store_id,
                AssortmentSale.units_sold,
                AssortmentSale.revenue,
                AssortmentProduct.brand_tier,
                AssortmentProduct.subcategory,
                AssortmentProduct.price_tier,
            ).join(AssortmentProduct, AssortmentSale.product_id == AssortmentProduct.id)
        )
        rows = result.all()
        return [
            {
                "store_id": str(row.store_id),
                "units_sold": row.units_sold,
                "revenue": float(row.revenue),
                "brand_tier": row.brand_tier.value if hasattr(row.brand_tier, "value") else row.brand_tier,
                "subcategory": row.subcategory,
                "price_tier": row.price_tier,
            }
            for row in rows
        ]

    def _extract_features(
        self,
        stores: list[AssortmentStore],
        sales_data: list[dict[str, Any]],
    ) -> tuple[np.ndarray, list[str], list[str]]:
        """Extract clustering features for each store.

        Returns:
            Tuple of (feature_matrix, store_ids, store_codes)
        """
        # Group sales by store
        sales_by_store: dict[str, list[dict]] = {}
        for sale in sales_data:
            store_id = sale["store_id"]
            if store_id not in sales_by_store:
                sales_by_store[store_id] = []
            sales_by_store[store_id].append(sale)

        features_list = []
        store_ids = []
        store_codes = []

        for store in stores:
            store_id = str(store.id)
            store_sales = sales_by_store.get(store_id, [])

            if not store_sales:
                continue

            total_revenue = sum(s["revenue"] for s in store_sales)
            total_units = sum(s["units_sold"] for s in store_sales)

            if total_revenue <= 0:
                continue

            # Premium brand share (Premium + National A)
            premium_revenue = sum(
                s["revenue"]
                for s in store_sales
                if s["brand_tier"] in [BrandTier.PREMIUM.value, BrandTier.NATIONAL_A.value, "Premium", "National A"]
            )
            premium_share = premium_revenue / total_revenue

            # Private label (Store Brand) share
            pl_revenue = sum(
                s["revenue"]
                for s in store_sales
                if s["brand_tier"] in [BrandTier.STORE_BRAND.value, "Store Brand"]
            )
            pl_share = pl_revenue / total_revenue

            # Average basket (revenue per unit)
            avg_basket = total_revenue / total_units if total_units > 0 else 0

            # Encode store characteristics
            format_code = self.FORMAT_CODES.get(store.format.value if hasattr(store.format, "value") else store.format, 1)
            income_code = self.INCOME_CODES.get(store.income_index.value if hasattr(store.income_index, "value") else store.income_index, 1)
            location_code = self.LOCATION_CODES.get(store.location_type.value if hasattr(store.location_type, "value") else store.location_type, 1)

            # Build feature vector based on requested features
            feature_row = []
            for feat in self._request.features:
                if feat == "revenue":
                    feature_row.append(total_revenue)
                elif feat == "premium_share":
                    feature_row.append(premium_share)
                elif feat == "pl_share" or feat == "private_label_share":
                    feature_row.append(pl_share)
                elif feat == "traffic":
                    feature_row.append(float(store.weekly_traffic))
                elif feat == "avg_basket":
                    feature_row.append(avg_basket)
                elif feat == "format":
                    feature_row.append(float(format_code))
                elif feat == "income":
                    feature_row.append(float(income_code))
                elif feat == "location":
                    feature_row.append(float(location_code))
                else:
                    # Default: use revenue
                    feature_row.append(total_revenue)

            features_list.append(feature_row)
            store_ids.append(store_id)
            store_codes.append(store.store_code)

        return np.array(features_list), store_ids, store_codes

    def _find_optimal_k(self, X: np.ndarray, max_k: int = 10) -> int:
        """Find optimal number of clusters using silhouette score.

        Args:
            X: Standardized feature matrix
            max_k: Maximum K to consider

        Returns:
            Optimal number of clusters
        """
        if len(X) <= 2:
            return 2

        max_k = min(max_k, len(X) - 1)
        min_k = 2

        if max_k < min_k:
            return 2

        silhouettes = []
        for k in range(min_k, max_k + 1):
            kmeans = KMeans(
                n_clusters=k,
                random_state=self._request.random_seed or 42,
                n_init=10,
            )
            labels = kmeans.fit_predict(X)
            if len(set(labels)) > 1:
                silhouettes.append(silhouette_score(X, labels))
            else:
                silhouettes.append(-1)

        optimal_idx = np.argmax(silhouettes)
        return min_k + optimal_idx

    def _run_kmeans(
        self, X: np.ndarray, n_clusters: int
    ) -> tuple[np.ndarray, np.ndarray, float]:
        """Run K-Means clustering.

        Returns:
            Tuple of (labels, centers, inertia)
        """
        kmeans = KMeans(
            n_clusters=n_clusters,
            random_state=self._request.random_seed or 42,
            n_init=10,
        )
        labels = kmeans.fit_predict(X)
        return labels, kmeans.cluster_centers_, kmeans.inertia_

    def _run_gmm(
        self, X: np.ndarray, n_clusters: int
    ) -> tuple[np.ndarray, np.ndarray, float | None]:
        """Run Gaussian Mixture Model clustering.

        Returns:
            Tuple of (labels, centers, None)
        """
        gmm = GaussianMixture(
            n_components=n_clusters,
            random_state=self._request.random_seed or 42,
            n_init=3,
        )
        labels = gmm.fit_predict(X)
        return labels, gmm.means_, None

    def _build_store_assignments(
        self,
        store_ids: list[str],
        store_codes: list[str],
        labels: np.ndarray,
        store_lookup: dict[str, AssortmentStore],
    ) -> list[StoreClusterAssignment]:
        """Build store cluster assignments."""
        assignments = []
        for i, (store_id, store_code) in enumerate(zip(store_ids, store_codes)):
            store = store_lookup.get(store_id)
            cluster_id = int(labels[i])
            assignments.append(
                StoreClusterAssignment(
                    store_id=uuid.UUID(store_id),
                    store_code=store_code,
                    store_name=store.name if store else store_code,
                    cluster_id=cluster_id,
                    cluster_name=f"Cluster {cluster_id}",
                )
            )
        return assignments

    def _build_pca_coordinates(
        self,
        store_ids: list[str],
        store_codes: list[str],
        labels: np.ndarray,
        pca_coords: np.ndarray,
        features: np.ndarray,
    ) -> list[PCACoordinate]:
        """Build PCA coordinates for visualization."""
        coordinates = []
        for i, (store_id, store_code) in enumerate(zip(store_ids, store_codes)):
            coordinates.append(
                PCACoordinate(
                    store_id=uuid.UUID(store_id),
                    store_code=store_code,
                    cluster_id=int(labels[i]),
                    pc1=float(pca_coords[i, 0]),
                    pc2=float(pca_coords[i, 1]),
                    revenue=float(features[i, 0]) if features.shape[1] > 0 else 0.0,
                )
            )
        return coordinates

    def _build_cluster_profiles(
        self,
        stores: list[AssortmentStore],
        sales_data: list[dict[str, Any]],
        store_ids: list[str],
        labels: np.ndarray,
    ) -> list[ClusterProfile]:
        """Build profile summaries for each cluster."""
        # Create mappings
        store_lookup = {str(s.id): s for s in stores}
        store_to_cluster = {sid: int(labels[i]) for i, sid in enumerate(store_ids)}

        # Group sales by store
        sales_by_store: dict[str, list[dict]] = {}
        for sale in sales_data:
            store_id = sale["store_id"]
            if store_id not in sales_by_store:
                sales_by_store[store_id] = []
            sales_by_store[store_id].append(sale)

        # Calculate total revenue across all stores
        total_all_revenue = sum(
            sum(s["revenue"] for s in sales_by_store.get(sid, []))
            for sid in store_ids
        )

        # Build profiles
        unique_clusters = sorted(set(labels))
        profiles = []

        for cluster_id in unique_clusters:
            cluster_store_ids = [
                sid for sid in store_ids if store_to_cluster.get(sid) == cluster_id
            ]

            if not cluster_store_ids:
                continue

            # Aggregate metrics
            total_revenue = 0.0
            total_units = 0
            total_traffic = 0
            premium_revenue = 0.0
            national_a_revenue = 0.0
            national_b_revenue = 0.0
            store_brand_revenue = 0.0

            formats = []
            locations = []
            incomes = []

            for store_id in cluster_store_ids:
                store = store_lookup.get(store_id)
                if store:
                    total_traffic += store.weekly_traffic
                    formats.append(store.format.value if hasattr(store.format, "value") else store.format)
                    locations.append(store.location_type.value if hasattr(store.location_type, "value") else store.location_type)
                    incomes.append(store.income_index.value if hasattr(store.income_index, "value") else store.income_index)

                for sale in sales_by_store.get(store_id, []):
                    revenue = sale["revenue"]
                    total_revenue += revenue
                    total_units += sale["units_sold"]
                    brand_tier = sale["brand_tier"]

                    if brand_tier in [BrandTier.PREMIUM.value, "Premium"]:
                        premium_revenue += revenue
                    elif brand_tier in [BrandTier.NATIONAL_A.value, "National A"]:
                        national_a_revenue += revenue
                    elif brand_tier in [BrandTier.NATIONAL_B.value, "National B"]:
                        national_b_revenue += revenue
                    elif brand_tier in [BrandTier.STORE_BRAND.value, "Store Brand"]:
                        store_brand_revenue += revenue

            store_count = len(cluster_store_ids)
            avg_revenue = total_revenue / store_count if store_count > 0 else 0
            avg_traffic = total_traffic / store_count if store_count > 0 else 0
            avg_basket = total_revenue / total_units if total_units > 0 else 0
            revenue_share_pct = (total_revenue / total_all_revenue * 100) if total_all_revenue > 0 else 0

            # Brand tier shares (as percentages)
            premium_share = (premium_revenue / total_revenue * 100) if total_revenue > 0 else 0
            national_a_share = (national_a_revenue / total_revenue * 100) if total_revenue > 0 else 0
            national_b_share = (national_b_revenue / total_revenue * 100) if total_revenue > 0 else 0
            store_brand_share = (store_brand_revenue / total_revenue * 100) if total_revenue > 0 else 0

            # Dominant characteristics
            dominant_format = Counter(formats).most_common(1)[0][0] if formats else "Standard"
            dominant_location = Counter(locations).most_common(1)[0][0] if locations else "Suburban"
            dominant_income = Counter(incomes).most_common(1)[0][0] if incomes else "Medium"

            # Compute flags
            is_premium_focused = (premium_share + national_a_share) > 55
            is_value_focused = store_brand_share > 30

            # Generate cluster name
            cluster_name = self._generate_cluster_name(
                dominant_income, dominant_format, dominant_location
            )

            # Generate recommendations
            recommendations = self._generate_recommendations(
                premium_share + national_a_share,
                store_brand_share,
                dominant_income,
                dominant_format,
            )

            profiles.append(
                ClusterProfile(
                    cluster_id=int(cluster_id),
                    cluster_name=cluster_name,
                    store_count=store_count,
                    avg_revenue=round(avg_revenue, 2),
                    total_revenue=round(total_revenue, 2),
                    revenue_share_pct=round(revenue_share_pct, 1),
                    avg_traffic=round(avg_traffic, 0),
                    total_traffic=total_traffic,
                    premium_share=round(premium_share, 1),
                    national_a_share=round(national_a_share, 1),
                    national_b_share=round(national_b_share, 1),
                    store_brand_share=round(store_brand_share, 1),
                    avg_basket=round(avg_basket, 2),
                    dominant_format=dominant_format,
                    dominant_location=dominant_location,
                    dominant_income=dominant_income,
                    is_premium_focused=is_premium_focused,
                    is_value_focused=is_value_focused,
                    recommendations=recommendations,
                )
            )

        return profiles

    def _generate_cluster_name(
        self,
        income: str,
        format_: str,
        location: str,
    ) -> str:
        """Generate descriptive name for a cluster."""
        name_parts = []

        if income == "High":
            name_parts.append("Premium")
        elif income == "Low":
            name_parts.append("Value")

        if format_ == "Superstore":
            name_parts.append("High-Volume")
        elif format_ == "Express":
            name_parts.append("Convenience")

        if location == "Urban":
            name_parts.append("Urban")
        elif location == "Rural":
            name_parts.append("Rural")
        else:
            name_parts.append("Suburban")

        return " ".join(name_parts) if name_parts else "General"

    def _generate_recommendations(
        self,
        premium_share: float,
        pl_share: float,
        income: str,
        format_: str,
    ) -> list[str]:
        """Generate assortment recommendations for a cluster."""
        recommendations = []

        # Premium-focused strategy
        if premium_share > 55 or income == "High":
            recommendations.append("Focus on premium and national A brands")
            recommendations.append("Emphasize mid to premium price tiers")
            recommendations.append("Expand variety in premium subcategories")
        # Value-focused strategy
        elif pl_share > 30 or income == "Low":
            recommendations.append("Emphasize store brand and value options")
            recommendations.append("Focus on value and mid price tiers")
            recommendations.append("Optimize private label assortment")
        # Balanced strategy
        else:
            recommendations.append("Maintain balanced brand tier mix")
            recommendations.append("Cover all price tiers adequately")
            recommendations.append("Monitor brand performance for optimization")

        # Format-specific recommendations
        if format_ == "Superstore":
            recommendations.append("Leverage larger shelf space for variety")
            recommendations.append("Consider bulk/family sizes")
        elif format_ == "Express":
            recommendations.append("Focus on grab-and-go formats")
            recommendations.append("Prioritize top-selling SKUs")

        return recommendations

    async def _save_clustering_run(
        self,
        run_id: uuid.UUID,
        n_clusters: int,
        sil_score: float,
        store_ids: list[str],
        labels: np.ndarray,
        cluster_profiles: list[ClusterProfile],
        pca_coordinates: list[PCACoordinate],
        execution_time_ms: int,
    ) -> None:
        """Save clustering run to database."""
        # Convert assignments to dict
        assignments = {sid: int(labels[i]) for i, sid in enumerate(store_ids)}

        # Convert profiles to dict
        profiles_dict = [
            {
                "cluster_id": p.cluster_id,
                "cluster_name": p.cluster_name,
                "store_count": p.store_count,
                "avg_revenue": p.avg_revenue,
                "premium_share": p.premium_share,
                "store_brand_share": p.store_brand_share,
                "dominant_format": p.dominant_format,
                "dominant_location": p.dominant_location,
                "dominant_income": p.dominant_income,
                "recommendations": p.recommendations,
            }
            for p in cluster_profiles
        ]

        # Convert PCA coordinates to dict
        pca_dict = [
            {
                "store_id": str(p.store_id),
                "store_code": p.store_code,
                "cluster_id": p.cluster_id,
                "pc1": p.pc1,
                "pc2": p.pc2,
            }
            for p in pca_coordinates
        ]

        run = ClusteringRun(
            id=run_id,
            method=self._request.method.value,
            n_clusters=n_clusters,
            features_used=self._request.features,
            silhouette_score=sil_score,
            cluster_assignments=assignments,
            cluster_profiles=profiles_dict,
            pca_coordinates=pca_dict,
            status=OptimizationStatus.COMPLETED,
            execution_time_ms=execution_time_ms,
        )

        self._session.add(run)
        await self._session.commit()

    async def find_optimal_k(self, max_k: int | None = None) -> OptimalKResult:
        """Find optimal number of clusters.

        Args:
            max_k: Maximum K to test

        Returns:
            OptimalKResult with silhouette scores for each K
        """
        max_k = max_k or self._request.max_clusters

        stores = await self._load_stores()
        sales_data = await self._load_sales_with_products()

        features, _, _ = self._extract_features(stores, sales_data)

        if len(features) < 3:
            raise ValueError("Need at least 3 stores for optimal K detection")

        X = self._scaler.fit_transform(features)
        max_k = min(max_k, len(X) - 1)

        k_values = list(range(2, max_k + 1))
        silhouettes = []
        inertias = []

        for k in k_values:
            kmeans = KMeans(
                n_clusters=k,
                random_state=self._request.random_seed or 42,
                n_init=10,
            )
            labels = kmeans.fit_predict(X)
            inertias.append(float(kmeans.inertia_))
            if len(set(labels)) > 1:
                silhouettes.append(float(silhouette_score(X, labels)))
            else:
                silhouettes.append(-1.0)

        optimal_idx = np.argmax(silhouettes)
        optimal_k = k_values[optimal_idx]

        return OptimalKResult(
            optimal_k=optimal_k,
            k_values=k_values,
            silhouette_scores=silhouettes,
            inertias=inertias,
        )

    def get_recommendations_for_cluster(
        self, profile: ClusterProfile
    ) -> ClusterRecommendation:
        """Generate detailed recommendations for a cluster profile."""
        premium_share = profile.premium_share + profile.national_a_share
        pl_share = profile.store_brand_share

        if premium_share > 55:
            strategy = "Premium-focused assortment with strong national brands"
            focus_brands = ["Premium", "National A"]
            price_focus = "Mid to Premium tiers"
            space_allocation = {
                "Premium": 0.35,
                "National A": 0.30,
                "National B": 0.20,
                "Store Brand": 0.15,
            }
            rationale = f"High premium share ({premium_share:.1f}%) indicates customers prefer premium products"
        elif pl_share > 30:
            strategy = "Value-focused assortment with strong private label presence"
            focus_brands = ["Store Brand", "National B"]
            price_focus = "Value and Mid tiers"
            space_allocation = {
                "Premium": 0.15,
                "National A": 0.20,
                "National B": 0.30,
                "Store Brand": 0.35,
            }
            rationale = f"High private label share ({pl_share:.1f}%) indicates value-conscious customers"
        else:
            strategy = "Balanced assortment across all price points"
            focus_brands = ["National A", "National B", "Store Brand"]
            price_focus = "All price tiers"
            space_allocation = {
                "Premium": 0.20,
                "National A": 0.25,
                "National B": 0.30,
                "Store Brand": 0.25,
            }
            rationale = "Balanced brand tier mix suggests diverse customer base"

        return ClusterRecommendation(
            cluster_id=profile.cluster_id,
            cluster_name=profile.cluster_name,
            strategy=strategy,
            focus_brands=focus_brands,
            focus_subcategories=[],  # Would need subcategory data
            price_tier_emphasis=price_focus,
            space_allocation_suggestion=space_allocation,
            rationale=rationale,
        )

    async def get_visualization_data(self, run_id: uuid.UUID) -> VisualizationData:
        """Get visualization data for a clustering run.

        Args:
            run_id: Clustering run ID

        Returns:
            VisualizationData for rendering charts
        """
        result = await self._session.execute(
            select(ClusteringRun).where(ClusteringRun.id == run_id)
        )
        run = result.scalar_one_or_none()

        if not run:
            raise ValueError(f"Clustering run {run_id} not found")

        # Convert stored PCA coordinates
        pca_coordinates = [
            PCACoordinate(
                store_id=uuid.UUID(p["store_id"]),
                store_code=p["store_code"],
                cluster_id=p["cluster_id"],
                pc1=p["pc1"],
                pc2=p["pc2"],
                revenue=p.get("revenue", 0.0),
            )
            for p in (run.pca_coordinates or [])
        ]

        # Compute cluster centers in PCA space
        cluster_centers = []
        for cluster_id in range(run.n_clusters):
            cluster_points = [p for p in pca_coordinates if p.cluster_id == cluster_id]
            if cluster_points:
                center_x = np.mean([p.pc1 for p in cluster_points])
                center_y = np.mean([p.pc2 for p in cluster_points])
                cluster_centers.append({
                    "cluster_id": cluster_id,
                    "x": float(center_x),
                    "y": float(center_y),
                })

        return VisualizationData(
            pca_coordinates=pca_coordinates,
            cluster_centers_pca=cluster_centers,
            explained_variance_ratio=(0.0, 0.0),  # Would need to store this
        )
