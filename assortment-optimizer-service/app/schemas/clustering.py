"""Pydantic schemas for Clustering operations."""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import Field

from app.db.models import OptimizationStatus
from app.schemas.common import BaseSchema


class ClusteringMethod(str, Enum):
    """Supported clustering methods."""

    KMEANS = "kmeans"
    GMM = "gmm"


class ClusteringRequest(BaseSchema):
    """Request to run store clustering."""

    method: ClusteringMethod = Field(
        default=ClusteringMethod.KMEANS,
        description="Clustering algorithm to use",
    )
    n_clusters: int | None = Field(
        None,
        ge=2,
        le=20,
        description="Number of clusters (None = auto-detect)",
    )
    max_clusters: int = Field(
        default=10,
        ge=2,
        le=20,
        description="Maximum clusters for auto-detection",
    )
    features: list[str] = Field(
        default_factory=lambda: ["revenue", "premium_share", "traffic"],
        description="Features to use for clustering",
    )
    random_seed: int | None = Field(
        default=42,
        description="Random seed for reproducibility",
    )


class ClusterProfile(BaseSchema):
    """Profile of a single cluster."""

    cluster_id: int = Field(..., description="Cluster identifier")
    cluster_name: str = Field(..., description="Descriptive cluster name")
    store_count: int = Field(..., ge=0, description="Number of stores in cluster")

    # Revenue metrics
    avg_revenue: float = Field(..., description="Average revenue per store")
    total_revenue: float = Field(..., description="Total cluster revenue")
    revenue_share_pct: float = Field(..., description="Share of total revenue (%)")

    # Traffic metrics
    avg_traffic: float = Field(..., description="Average weekly traffic per store")
    total_traffic: int = Field(..., description="Total weekly traffic")

    # Brand tier metrics (percentages)
    premium_share: float = Field(..., ge=0, le=100, description="Premium brand share (%)")
    national_a_share: float = Field(..., ge=0, le=100, description="National A share (%)")
    national_b_share: float = Field(..., ge=0, le=100, description="National B share (%)")
    store_brand_share: float = Field(..., ge=0, le=100, description="Store brand share (%)")

    # Alias for API consistency
    @property
    def private_label_share(self) -> float:
        """Alias for store_brand_share."""
        return self.store_brand_share

    # Basket metrics
    avg_basket: float = Field(default=0.0, description="Average basket size (revenue per unit)")

    # Store characteristics
    dominant_format: str = Field(..., description="Most common store format")
    dominant_location: str = Field(..., description="Most common location type")
    dominant_income: str = Field(..., description="Most common income index")

    # Computed flags
    is_premium_focused: bool = Field(..., description="True if premium share > 55%")
    is_value_focused: bool = Field(..., description="True if store brand share > 30%")

    # Recommendations
    recommendations: list[str] = Field(
        default_factory=list,
        description="Assortment recommendations for this cluster",
    )


class StoreClusterAssignment(BaseSchema):
    """Individual store cluster assignment."""

    store_id: UUID
    store_code: str
    store_name: str
    cluster_id: int
    cluster_name: str


class PCACoordinate(BaseSchema):
    """PCA coordinate for visualization."""

    store_id: UUID
    store_code: str
    cluster_id: int
    pc1: float
    pc2: float
    revenue: float  # For point sizing


class ClusteringResult(BaseSchema):
    """Complete clustering result."""

    run_id: UUID
    status: OptimizationStatus

    # Configuration
    method: ClusteringMethod
    n_clusters: int
    features_used: list[str]

    # Quality metrics
    silhouette_score: float = Field(
        ...,
        ge=-1,
        le=1,
        description="Silhouette score (-1 to 1, higher is better)",
    )
    inertia: float | None = Field(
        None,
        description="Within-cluster sum of squares (K-Means only)",
    )

    # Results
    cluster_profiles: list[ClusterProfile]
    store_assignments: list[StoreClusterAssignment]
    pca_coordinates: list[PCACoordinate]

    # Execution metadata
    execution_time_ms: int
    created_at: datetime


class ClusteringResponse(BaseSchema):
    """Response when starting clustering."""

    run_id: UUID
    status: OptimizationStatus
    message: str


class ClusteringSummary(BaseSchema):
    """Summary of a clustering run for listing."""

    run_id: UUID
    method: ClusteringMethod
    n_clusters: int
    silhouette_score: float | None
    status: OptimizationStatus
    created_at: datetime


class ClusterRecommendation(BaseSchema):
    """Assortment recommendation for a cluster."""

    cluster_id: int = Field(..., description="Cluster identifier")
    cluster_name: str = Field(..., description="Descriptive cluster name")
    strategy: str = Field(..., description="Overall assortment strategy")
    focus_brands: list[str] = Field(..., description="Brand tiers to focus on")
    focus_subcategories: list[str] = Field(
        default_factory=list,
        description="Top subcategories to emphasize",
    )
    price_tier_emphasis: str = Field(..., description="Recommended price tier focus")
    space_allocation_suggestion: dict[str, float] = Field(
        default_factory=dict,
        description="Suggested space allocation by brand tier",
    )
    rationale: str = Field(..., description="Explanation for recommendations")


class OptimalKResult(BaseSchema):
    """Result from optimal K detection."""

    optimal_k: int = Field(..., description="Recommended number of clusters")
    k_values: list[int] = Field(..., description="K values tested")
    silhouette_scores: list[float] = Field(..., description="Silhouette score for each K")
    inertias: list[float] = Field(..., description="Inertia for each K (K-means only)")


class VisualizationData(BaseSchema):
    """Data for cluster visualization."""

    pca_coordinates: list[PCACoordinate] = Field(
        ...,
        description="2D PCA coordinates for all stores",
    )
    cluster_centers_pca: list[dict[str, float]] = Field(
        ...,
        description="Cluster center coordinates in PCA space",
    )
    explained_variance_ratio: tuple[float, float] = Field(
        ...,
        description="Variance explained by each PCA component (0-1)",
    )
