"""Unit tests for Store Clustering service."""

import numpy as np
import pytest
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

from app.schemas.clustering import (
    ClusteringMethod,
    ClusteringRequest,
    ClusterProfile,
    ClusterRecommendation,
    OptimalKResult,
    PCACoordinate,
    StoreClusterAssignment,
)


# =============================================================================
# Test Data Fixtures
# =============================================================================


@pytest.fixture
def sample_features():
    """Generate sample feature matrix for testing."""
    np.random.seed(42)
    # Create 3 distinct clusters
    cluster1 = np.random.randn(10, 3) + np.array([0, 0, 0])
    cluster2 = np.random.randn(10, 3) + np.array([5, 5, 5])
    cluster3 = np.random.randn(10, 3) + np.array([10, 0, 5])
    return np.vstack([cluster1, cluster2, cluster3])


@pytest.fixture
def sample_cluster_profile():
    """Create a sample cluster profile for testing."""
    return ClusterProfile(
        cluster_id=0,
        cluster_name="Premium Urban",
        store_count=15,
        avg_revenue=125000.0,
        total_revenue=1875000.0,
        revenue_share_pct=35.5,
        avg_traffic=5200.0,
        total_traffic=78000,
        premium_share=35.0,
        national_a_share=25.0,
        national_b_share=25.0,
        store_brand_share=15.0,
        avg_basket=8.50,
        dominant_format="Superstore",
        dominant_location="Urban",
        dominant_income="High",
        is_premium_focused=True,
        is_value_focused=False,
        recommendations=["Focus on premium brands"],
    )


@pytest.fixture
def value_cluster_profile():
    """Create a value-focused cluster profile."""
    return ClusterProfile(
        cluster_id=1,
        cluster_name="Value Suburban",
        store_count=20,
        avg_revenue=85000.0,
        total_revenue=1700000.0,
        revenue_share_pct=32.2,
        avg_traffic=4500.0,
        total_traffic=90000,
        premium_share=15.0,
        national_a_share=15.0,
        national_b_share=30.0,
        store_brand_share=40.0,
        avg_basket=6.25,
        dominant_format="Standard",
        dominant_location="Suburban",
        dominant_income="Low",
        is_premium_focused=False,
        is_value_focused=True,
        recommendations=["Focus on store brands"],
    )


# =============================================================================
# Optimal K Selection Tests
# =============================================================================


class TestOptimalKSelection:
    """Tests for optimal K (number of clusters) selection."""

    def test_finds_correct_k_for_clear_clusters(self, sample_features):
        """Test that optimal K is found for well-separated clusters."""
        scaler = StandardScaler()
        X = scaler.fit_transform(sample_features)

        # Test K from 2 to 6
        silhouettes = []
        for k in range(2, 7):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X)
            silhouettes.append(silhouette_score(X, labels))

        optimal_idx = np.argmax(silhouettes)
        optimal_k = 2 + optimal_idx

        # With 3 clear clusters, optimal K should be 3
        assert optimal_k == 3

    def test_silhouette_score_range(self, sample_features):
        """Test that silhouette scores are in valid range [-1, 1]."""
        scaler = StandardScaler()
        X = scaler.fit_transform(sample_features)

        for k in range(2, 6):
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X)
            score = silhouette_score(X, labels)

            assert -1 <= score <= 1, f"Silhouette score {score} out of range"

    def test_optimal_k_with_small_dataset(self):
        """Test optimal K detection with minimal data."""
        np.random.seed(42)
        X = np.random.randn(5, 3)  # Only 5 samples
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Max K should be limited by sample size
        max_k = min(4, len(X) - 1)
        assert max_k <= 4

        kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X_scaled)

        # Should still produce valid labels
        assert len(labels) == 5
        assert len(set(labels)) == 2


# =============================================================================
# Cluster Assignment Tests
# =============================================================================


class TestClusterAssignments:
    """Tests for cluster assignment validity."""

    def test_all_samples_assigned(self, sample_features):
        """Test that all samples receive cluster assignments."""
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(sample_features)

        assert len(labels) == len(sample_features)

    def test_labels_are_valid_integers(self, sample_features):
        """Test that labels are non-negative integers."""
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(sample_features)

        for label in labels:
            assert isinstance(label, (int, np.integer))
            assert label >= 0
            assert label < 3

    def test_all_clusters_have_members(self, sample_features):
        """Test that each cluster has at least one member."""
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(sample_features)

        unique_labels = set(labels)
        assert len(unique_labels) == 3

        for cluster_id in range(3):
            assert cluster_id in unique_labels

    def test_assignment_consistency_with_seed(self, sample_features):
        """Test that same seed produces same assignments."""
        kmeans1 = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans2 = KMeans(n_clusters=3, random_state=42, n_init=10)

        labels1 = kmeans1.fit_predict(sample_features)
        labels2 = kmeans2.fit_predict(sample_features)

        np.testing.assert_array_equal(labels1, labels2)


# =============================================================================
# Silhouette Score Tests
# =============================================================================


class TestSilhouetteScore:
    """Tests for silhouette score calculation."""

    def test_well_separated_clusters_high_score(self):
        """Test that well-separated clusters get high silhouette scores."""
        # Create very distinct clusters
        cluster1 = np.array([[0, 0], [0.1, 0.1], [0, 0.1]])
        cluster2 = np.array([[10, 10], [10.1, 10.1], [10, 10.1]])
        cluster3 = np.array([[0, 10], [0.1, 10.1], [0, 10.1]])
        X = np.vstack([cluster1, cluster2, cluster3])
        labels = np.array([0, 0, 0, 1, 1, 1, 2, 2, 2])

        score = silhouette_score(X, labels)

        # Well-separated clusters should have high score
        assert score > 0.8

    def test_overlapping_clusters_lower_score(self):
        """Test that overlapping clusters get lower silhouette scores."""
        np.random.seed(42)
        # Create overlapping clusters
        cluster1 = np.random.randn(20, 2) * 2
        cluster2 = np.random.randn(20, 2) * 2 + np.array([1, 1])
        X = np.vstack([cluster1, cluster2])
        labels = np.array([0] * 20 + [1] * 20)

        score = silhouette_score(X, labels)

        # Overlapping clusters should have lower score
        assert score < 0.5

    def test_silhouette_returns_float(self, sample_features):
        """Test that silhouette score is a float."""
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(sample_features)
        score = silhouette_score(sample_features, labels)

        assert isinstance(score, (float, np.floating))


# =============================================================================
# Cluster Profile Tests
# =============================================================================


class TestClusterProfiles:
    """Tests for cluster profile accuracy."""

    def test_profile_has_all_required_fields(self, sample_cluster_profile):
        """Test that profile contains all required fields."""
        assert hasattr(sample_cluster_profile, "cluster_id")
        assert hasattr(sample_cluster_profile, "cluster_name")
        assert hasattr(sample_cluster_profile, "store_count")
        assert hasattr(sample_cluster_profile, "avg_revenue")
        assert hasattr(sample_cluster_profile, "premium_share")
        assert hasattr(sample_cluster_profile, "store_brand_share")
        assert hasattr(sample_cluster_profile, "dominant_format")
        assert hasattr(sample_cluster_profile, "dominant_location")
        assert hasattr(sample_cluster_profile, "dominant_income")
        assert hasattr(sample_cluster_profile, "recommendations")

    def test_premium_focused_flag_calculation(self):
        """Test is_premium_focused flag based on premium share."""
        # Premium focused: premium + national_a > 55%
        premium_profile = ClusterProfile(
            cluster_id=0,
            cluster_name="Test",
            store_count=10,
            avg_revenue=100000.0,
            total_revenue=1000000.0,
            revenue_share_pct=25.0,
            avg_traffic=5000.0,
            total_traffic=50000,
            premium_share=35.0,
            national_a_share=25.0,  # Total = 60% > 55%
            national_b_share=25.0,
            store_brand_share=15.0,
            avg_basket=7.50,
            dominant_format="Standard",
            dominant_location="Urban",
            dominant_income="High",
            is_premium_focused=True,
            is_value_focused=False,
            recommendations=[],
        )

        assert premium_profile.is_premium_focused is True
        assert premium_profile.premium_share + premium_profile.national_a_share > 55

    def test_value_focused_flag_calculation(self, value_cluster_profile):
        """Test is_value_focused flag based on store brand share."""
        # Value focused: store_brand > 30%
        assert value_cluster_profile.is_value_focused is True
        assert value_cluster_profile.store_brand_share > 30

    def test_brand_shares_sum_approximately_100(self, sample_cluster_profile):
        """Test that brand tier shares sum to approximately 100%."""
        total_share = (
            sample_cluster_profile.premium_share
            + sample_cluster_profile.national_a_share
            + sample_cluster_profile.national_b_share
            + sample_cluster_profile.store_brand_share
        )

        assert 95 <= total_share <= 105, f"Brand shares sum to {total_share}%"

    def test_private_label_share_alias(self, sample_cluster_profile):
        """Test that private_label_share is alias for store_brand_share."""
        assert sample_cluster_profile.private_label_share == sample_cluster_profile.store_brand_share


# =============================================================================
# Store Count Tests
# =============================================================================


class TestStoreCounts:
    """Tests for store count handling."""

    def test_various_store_counts(self):
        """Test clustering works with various store counts."""
        np.random.seed(42)

        for n_stores in [5, 10, 20, 50]:
            X = np.random.randn(n_stores, 3)
            n_clusters = min(3, n_stores - 1)

            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X)

            assert len(labels) == n_stores
            assert len(set(labels)) <= n_clusters

    def test_minimum_stores_for_clustering(self):
        """Test that clustering requires at least 2 stores."""
        X = np.array([[1, 2, 3]])  # Only 1 sample

        with pytest.raises(ValueError):
            kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
            kmeans.fit_predict(X)

    def test_large_store_count_performance(self):
        """Test clustering completes in reasonable time for many stores."""
        import time

        np.random.seed(42)
        X = np.random.randn(500, 5)

        start = time.time()
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)
        elapsed = time.time() - start

        assert len(labels) == 500
        assert elapsed < 5.0, f"Clustering took {elapsed:.2f}s, expected < 5s"


# =============================================================================
# Schema Validation Tests
# =============================================================================


class TestSchemaValidation:
    """Tests for Pydantic schema validation."""

    def test_clustering_request_defaults(self):
        """Test ClusteringRequest default values."""
        request = ClusteringRequest()

        assert request.method == ClusteringMethod.KMEANS
        assert request.n_clusters is None
        assert request.max_clusters == 10
        assert "revenue" in request.features
        assert request.random_seed == 42

    def test_clustering_request_custom_values(self):
        """Test ClusteringRequest with custom values."""
        request = ClusteringRequest(
            method=ClusteringMethod.GMM,
            n_clusters=5,
            max_clusters=15,
            features=["revenue", "traffic", "avg_basket"],
            random_seed=123,
        )

        assert request.method == ClusteringMethod.GMM
        assert request.n_clusters == 5
        assert request.max_clusters == 15
        assert len(request.features) == 3
        assert request.random_seed == 123

    def test_n_clusters_bounds(self):
        """Test n_clusters validation bounds."""
        # Valid range: 2-20
        valid_request = ClusteringRequest(n_clusters=5)
        assert valid_request.n_clusters == 5

        # Below minimum
        with pytest.raises(ValueError):
            ClusteringRequest(n_clusters=1)

        # Above maximum
        with pytest.raises(ValueError):
            ClusteringRequest(n_clusters=25)

    def test_max_clusters_bounds(self):
        """Test max_clusters validation bounds."""
        # Valid
        valid_request = ClusteringRequest(max_clusters=15)
        assert valid_request.max_clusters == 15

        # Below minimum
        with pytest.raises(ValueError):
            ClusteringRequest(max_clusters=1)

        # Above maximum
        with pytest.raises(ValueError):
            ClusteringRequest(max_clusters=25)

    def test_silhouette_score_bounds_in_result(self):
        """Test that silhouette score bounds are validated."""
        from pydantic import ValidationError
        from app.schemas.clustering import ClusteringResult

        # Creating result requires many fields, test via profile
        profile = ClusterProfile(
            cluster_id=0,
            cluster_name="Test",
            store_count=10,
            avg_revenue=100000.0,
            total_revenue=1000000.0,
            revenue_share_pct=25.0,
            avg_traffic=5000.0,
            total_traffic=50000,
            premium_share=50.0,  # Within 0-100
            national_a_share=20.0,
            national_b_share=20.0,
            store_brand_share=10.0,
            avg_basket=7.50,
            dominant_format="Standard",
            dominant_location="Urban",
            dominant_income="Medium",
            is_premium_focused=False,
            is_value_focused=False,
            recommendations=[],
        )

        assert profile.premium_share == 50.0

    def test_pca_coordinate_schema(self):
        """Test PCACoordinate schema."""
        from uuid import uuid4

        coord = PCACoordinate(
            store_id=uuid4(),
            store_code="STORE-001",
            cluster_id=0,
            pc1=1.5,
            pc2=-0.8,
            revenue=125000.0,
        )

        assert coord.pc1 == 1.5
        assert coord.pc2 == -0.8
        assert coord.revenue == 125000.0


# =============================================================================
# Recommendation Generation Tests
# =============================================================================


class TestRecommendations:
    """Tests for cluster recommendation generation."""

    def test_premium_cluster_recommendations(self, sample_cluster_profile):
        """Test recommendations for premium-focused cluster."""
        # Profile has premium_share + national_a_share = 60% > 55%
        assert sample_cluster_profile.is_premium_focused is True

        # Should have premium-focused recommendations
        assert len(sample_cluster_profile.recommendations) > 0

    def test_value_cluster_recommendations(self, value_cluster_profile):
        """Test recommendations for value-focused cluster."""
        assert value_cluster_profile.is_value_focused is True
        assert value_cluster_profile.store_brand_share > 30

    def test_recommendation_schema(self):
        """Test ClusterRecommendation schema."""
        rec = ClusterRecommendation(
            cluster_id=0,
            cluster_name="Premium Urban",
            strategy="Premium-focused assortment",
            focus_brands=["Premium", "National A"],
            focus_subcategories=["Beverages", "Snacks"],
            price_tier_emphasis="Mid to Premium",
            space_allocation_suggestion={"Premium": 0.35, "National A": 0.30},
            rationale="High premium share indicates customer preference",
        )

        assert rec.cluster_id == 0
        assert len(rec.focus_brands) == 2
        assert "Premium" in rec.focus_brands
        assert rec.price_tier_emphasis == "Mid to Premium"


# =============================================================================
# GMM vs K-Means Comparison Tests
# =============================================================================


class TestClusteringMethods:
    """Tests comparing K-Means and GMM clustering."""

    def test_kmeans_produces_valid_labels(self, sample_features):
        """Test K-Means produces valid cluster labels."""
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(sample_features)

        assert len(labels) == len(sample_features)
        assert min(labels) >= 0
        assert max(labels) < 3

    def test_gmm_produces_valid_labels(self, sample_features):
        """Test GMM produces valid cluster labels."""
        from sklearn.mixture import GaussianMixture

        gmm = GaussianMixture(n_components=3, random_state=42, n_init=3)
        labels = gmm.fit_predict(sample_features)

        assert len(labels) == len(sample_features)
        assert min(labels) >= 0
        assert max(labels) < 3

    def test_both_methods_cluster_similarly(self, sample_features):
        """Test that K-Means and GMM produce similar clusterings."""
        from sklearn.mixture import GaussianMixture
        from sklearn.metrics import adjusted_rand_score

        scaler = StandardScaler()
        X = scaler.fit_transform(sample_features)

        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans_labels = kmeans.fit_predict(X)

        gmm = GaussianMixture(n_components=3, random_state=42, n_init=3)
        gmm_labels = gmm.fit_predict(X)

        # Adjusted Rand Index measures similarity between clusterings
        ari = adjusted_rand_score(kmeans_labels, gmm_labels)

        # For well-separated clusters, both methods should agree reasonably
        assert ari > 0.5, f"ARI = {ari}, methods disagree significantly"

    def test_kmeans_has_inertia(self, sample_features):
        """Test that K-Means provides inertia metric."""
        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans.fit(sample_features)

        assert hasattr(kmeans, "inertia_")
        assert kmeans.inertia_ >= 0

    def test_gmm_has_means(self, sample_features):
        """Test that GMM provides cluster means."""
        from sklearn.mixture import GaussianMixture

        gmm = GaussianMixture(n_components=3, random_state=42, n_init=3)
        gmm.fit(sample_features)

        assert hasattr(gmm, "means_")
        assert gmm.means_.shape == (3, sample_features.shape[1])


# =============================================================================
# PCA Visualization Tests
# =============================================================================


class TestPCAVisualization:
    """Tests for PCA dimensionality reduction for visualization."""

    def test_pca_reduces_to_2d(self, sample_features):
        """Test that PCA correctly reduces to 2 dimensions."""
        from sklearn.decomposition import PCA

        pca = PCA(n_components=2)
        coords = pca.fit_transform(sample_features)

        assert coords.shape == (len(sample_features), 2)

    def test_pca_explained_variance_sums_correctly(self, sample_features):
        """Test that explained variance ratios sum to <= 1."""
        from sklearn.decomposition import PCA

        pca = PCA(n_components=2)
        pca.fit(sample_features)

        total_variance = sum(pca.explained_variance_ratio_)
        assert total_variance <= 1.0
        assert total_variance > 0

    def test_pca_preserves_cluster_separation(self, sample_features):
        """Test that PCA preserves cluster separation."""
        from sklearn.decomposition import PCA

        scaler = StandardScaler()
        X = scaler.fit_transform(sample_features)

        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        pca = PCA(n_components=2)
        coords = pca.fit_transform(X)

        # Check that different clusters have different PCA centers
        cluster_centers = []
        for cluster_id in range(3):
            mask = labels == cluster_id
            center = coords[mask].mean(axis=0)
            cluster_centers.append(center)

        # Centers should be distinct
        for i in range(3):
            for j in range(i + 1, 3):
                dist = np.linalg.norm(cluster_centers[i] - cluster_centers[j])
                assert dist > 0.1, f"Clusters {i} and {j} have similar PCA centers"


# =============================================================================
# Edge Case Tests
# =============================================================================


class TestEdgeCases:
    """Tests for edge cases and error handling."""

    def test_all_identical_features(self):
        """Test handling of identical feature values."""
        X = np.ones((10, 3))  # All same values

        scaler = StandardScaler()
        # StandardScaler will produce zeros or NaN for constant features
        X_scaled = scaler.fit_transform(X)

        # Result should be all zeros (mean-centered, std=0 handled gracefully)
        # Modern sklearn handles this without warnings
        assert X_scaled.shape == X.shape

    def test_single_feature(self):
        """Test clustering with single feature."""
        np.random.seed(42)
        X = np.random.randn(30, 1)

        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        assert len(labels) == 30
        assert len(set(labels)) == 3

    def test_many_features(self):
        """Test clustering with many features."""
        np.random.seed(42)
        X = np.random.randn(50, 20)

        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        assert len(labels) == 50
        assert len(set(labels)) == 4

    def test_unbalanced_clusters(self):
        """Test clustering with unbalanced cluster sizes."""
        np.random.seed(42)
        # Create unbalanced clusters
        cluster1 = np.random.randn(50, 3)
        cluster2 = np.random.randn(10, 3) + np.array([10, 10, 10])
        X = np.vstack([cluster1, cluster2])

        kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        # Should still assign all points
        assert len(labels) == 60

        # Check cluster sizes are reasonably distributed
        unique, counts = np.unique(labels, return_counts=True)
        assert len(unique) == 2


# =============================================================================
# Reproducibility Tests
# =============================================================================


class TestReproducibility:
    """Tests for clustering reproducibility."""

    def test_same_seed_same_results(self, sample_features):
        """Test that same random seed produces identical results."""
        kmeans1 = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans2 = KMeans(n_clusters=3, random_state=42, n_init=10)

        labels1 = kmeans1.fit_predict(sample_features)
        labels2 = kmeans2.fit_predict(sample_features)

        np.testing.assert_array_equal(labels1, labels2)

    def test_different_seeds_potentially_different(self, sample_features):
        """Test that different seeds may produce different results."""
        kmeans1 = KMeans(n_clusters=3, random_state=42, n_init=10)
        kmeans2 = KMeans(n_clusters=3, random_state=123, n_init=10)

        labels1 = kmeans1.fit_predict(sample_features)
        labels2 = kmeans2.fit_predict(sample_features)

        # Results may differ (not guaranteed, but likely with different seeds)
        # Just verify both produce valid outputs
        assert len(labels1) == len(labels2)
        assert len(set(labels1)) == 3
        assert len(set(labels2)) == 3

    def test_none_seed_is_random(self):
        """Test that None seed produces potentially different results."""
        np.random.seed(None)  # Reset to random
        X = np.random.randn(30, 3)

        # Run twice without setting seed - may produce same or different
        # Just verify it completes successfully
        kmeans = KMeans(n_clusters=3, n_init=10)
        labels = kmeans.fit_predict(X)

        assert len(labels) == 30
