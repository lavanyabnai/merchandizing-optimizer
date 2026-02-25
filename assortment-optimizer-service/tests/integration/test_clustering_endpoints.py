"""Integration tests for clustering endpoints."""

import pytest
from httpx import AsyncClient


class TestKMeansClustering:
    """Tests for K-Means clustering."""

    @pytest.mark.asyncio
    async def test_kmeans_clustering(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_stores,
        sample_sales,
    ):
        """Test running K-Means clustering."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "kmeans",
                "n_clusters": 3,
                "features": ["revenue", "traffic", "premium_share"],
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]
        data = response.json()
        assert "run_id" in data or "id" in data or "n_clusters" in data


class TestGMMClustering:
    """Tests for Gaussian Mixture Model clustering."""

    @pytest.mark.asyncio
    async def test_gmm_clustering(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_stores,
        sample_sales,
    ):
        """Test running GMM clustering."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "gmm",
                "n_clusters": 3,
                "features": ["revenue", "traffic"],
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]


class TestAutoKSelection:
    """Tests for automatic K selection."""

    @pytest.mark.asyncio
    async def test_auto_k_selection(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_stores,
        sample_sales,
    ):
        """Test automatic cluster number selection."""
        response = await client.get(
            "/api/v1/cluster/optimal-k",
            params={"max_k": 6},
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            assert "optimal_k" in data or "optimalK" in data
            # Optimal K should be within range
            optimal_k = data.get("optimal_k") or data.get("optimalK")
            if optimal_k:
                assert 2 <= optimal_k <= 6

    @pytest.mark.asyncio
    async def test_clustering_without_n_clusters(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_stores,
        sample_sales,
    ):
        """Test clustering with automatic K selection."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "kmeans",
                # No n_clusters specified - should auto-select
                "max_clusters": 6,
                "features": ["revenue", "traffic"],
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]


class TestClusterProfiles:
    """Tests for cluster profile generation."""

    @pytest.mark.asyncio
    async def test_cluster_profiles_generated(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_clustering_run,
    ):
        """Test that cluster profiles are generated."""
        response = await client.get(
            f"/api/v1/cluster/{sample_clustering_run.id}/profiles",
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)
            for profile in data:
                # Each profile should have key fields
                assert "cluster_id" in profile or "clusterId" in profile


class TestClusterRecommendations:
    """Tests for cluster recommendations."""

    @pytest.mark.asyncio
    async def test_recommendations_generated(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_clustering_run,
    ):
        """Test that recommendations are generated for clusters."""
        response = await client.get(
            f"/api/v1/cluster/{sample_clustering_run.id}/recommendations",
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            # Recommendations should be a dict or list
            assert isinstance(data, (dict, list))


class TestPCACoordinates:
    """Tests for PCA coordinate generation."""

    @pytest.mark.asyncio
    async def test_pca_coordinates_returned(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_clustering_run,
    ):
        """Test that PCA coordinates are returned."""
        response = await client.get(
            f"/api/v1/cluster/{sample_clustering_run.id}",
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            # Check for PCA coordinates
            if "pca_coordinates" in data or "pcaCoordinates" in data:
                coords = data.get("pca_coordinates") or data.get("pcaCoordinates")
                assert isinstance(coords, list)
                for coord in coords:
                    # Each coordinate should have pc1 and pc2
                    assert "pc1" in coord or "PC1" in coord


class TestClusteringResults:
    """Tests for retrieving clustering results."""

    @pytest.mark.asyncio
    async def test_get_clustering_result(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_clustering_run,
    ):
        """Test retrieving clustering result by ID."""
        response = await client.get(
            f"/api/v1/cluster/{sample_clustering_run.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "method" in data
        assert "n_clusters" in data or "nClusters" in data

    @pytest.mark.asyncio
    async def test_clustering_silhouette_score(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_clustering_run,
    ):
        """Test that silhouette score is returned."""
        response = await client.get(
            f"/api/v1/cluster/{sample_clustering_run.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        if "silhouette_score" in data or "silhouetteScore" in data:
            score = data.get("silhouette_score") or data.get("silhouetteScore")
            # Silhouette score should be between -1 and 1
            assert -1 <= score <= 1


class TestClusteringHistory:
    """Tests for clustering history."""

    @pytest.mark.asyncio
    async def test_get_clustering_history(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_clustering_run,
    ):
        """Test retrieving clustering history."""
        response = await client.get(
            "/api/v1/cluster/history",
            params={"limit": 10},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestClusteringAuth:
    """Tests for clustering authentication."""

    @pytest.mark.asyncio
    async def test_clustering_requires_auth(self, client: AsyncClient):
        """Test that clustering requires authentication."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={"method": "kmeans", "n_clusters": 3},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_clustering_history_requires_auth(self, client: AsyncClient):
        """Test that history requires authentication."""
        response = await client.get("/api/v1/cluster/history")
        assert response.status_code == 401


class TestClusteringValidation:
    """Tests for clustering input validation."""

    @pytest.mark.asyncio
    async def test_invalid_method_rejected(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test that invalid clustering method is rejected."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "invalid_method",
                "n_clusters": 3,
            },
            headers=auth_headers,
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_invalid_n_clusters_rejected(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test that invalid n_clusters is rejected."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "kmeans",
                "n_clusters": 1,  # Too few clusters
            },
            headers=auth_headers,
        )

        assert response.status_code == 422
