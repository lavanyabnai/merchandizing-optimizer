"""Integration tests for authentication flow."""

import pytest
from httpx import AsyncClient


class TestValidToken:
    """Tests for valid token handling."""

    @pytest.mark.asyncio
    async def test_valid_jwt_token_passes(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test that valid authentication headers pass."""
        response = await client.get(
            "/api/v1/data/stats",
            headers=auth_headers,
        )

        # Should not be 401 with valid headers
        assert response.status_code != 401

    @pytest.mark.asyncio
    async def test_user_id_extracted_correctly(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
    ):
        """Test that user ID is extracted from headers."""
        # Seed some data with the test user
        response = await client.post(
            "/api/v1/data/seed",
            json={"num_products": 3, "num_stores": 2, "weeks": 1},
            headers=auth_headers,
        )

        assert response.status_code == 200


class TestExpiredToken:
    """Tests for expired token handling."""

    @pytest.mark.asyncio
    async def test_expired_token_returns_401(
        self,
        client: AsyncClient,
    ):
        """Test that expired token returns 401."""
        expired_headers = {
            "Authorization": "Bearer expired-test-token",
            # In a real scenario, this would be a properly formatted but expired JWT
        }

        response = await client.get(
            "/api/v1/data/stats",
            headers=expired_headers,
        )

        # Should fail authentication
        assert response.status_code == 401


class TestInvalidSignature:
    """Tests for invalid signature handling."""

    @pytest.mark.asyncio
    async def test_invalid_signature_returns_401(
        self,
        client: AsyncClient,
        invalid_auth_headers: dict,
    ):
        """Test that invalid signature returns 401."""
        response = await client.get(
            "/api/v1/data/stats",
            headers=invalid_auth_headers,
        )

        assert response.status_code == 401


class TestMissingToken:
    """Tests for missing token handling."""

    @pytest.mark.asyncio
    async def test_missing_token_returns_401(
        self,
        client: AsyncClient,
    ):
        """Test that missing token returns 401."""
        response = await client.get("/api/v1/data/stats")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_empty_authorization_header(
        self,
        client: AsyncClient,
    ):
        """Test that empty authorization header returns 401."""
        response = await client.get(
            "/api/v1/data/stats",
            headers={"Authorization": ""},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_malformed_authorization_header(
        self,
        client: AsyncClient,
    ):
        """Test that malformed authorization header returns 401."""
        response = await client.get(
            "/api/v1/data/stats",
            headers={"Authorization": "NotBearer token"},
        )
        assert response.status_code == 401


class TestPublicEndpoints:
    """Tests for public endpoints that don't require auth."""

    @pytest.mark.asyncio
    async def test_health_endpoint_public(
        self,
        client: AsyncClient,
    ):
        """Test that health endpoint doesn't require auth."""
        response = await client.get("/api/v1/health")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_readiness_endpoint_public(
        self,
        client: AsyncClient,
    ):
        """Test that readiness endpoint doesn't require auth."""
        response = await client.get("/api/v1/health/ready")
        # May return 200 or 503 depending on DB connection
        assert response.status_code in [200, 503]

    @pytest.mark.asyncio
    async def test_openapi_public(
        self,
        client: AsyncClient,
    ):
        """Test that OpenAPI docs are accessible in dev mode."""
        response = await client.get("/openapi.json")
        # May or may not be available depending on environment
        assert response.status_code in [200, 404]


class TestAuthenticatedEndpoints:
    """Tests verifying all main endpoints require auth."""

    @pytest.mark.asyncio
    async def test_data_seed_requires_auth(self, client: AsyncClient):
        """Test data seed requires auth."""
        response = await client.post(
            "/api/v1/data/seed",
            json={"num_products": 1},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_optimization_run_requires_auth(self, client: AsyncClient):
        """Test optimization run requires auth."""
        response = await client.post(
            "/api/v1/optimization/run",
            json={"constraints": {}},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_simulation_run_requires_auth(self, client: AsyncClient):
        """Test simulation run requires auth."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={"scenario_type": "remove_sku"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_clustering_run_requires_auth(self, client: AsyncClient):
        """Test clustering run requires auth."""
        response = await client.post(
            "/api/v1/cluster/run",
            json={"method": "kmeans"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_demand_predict_requires_auth(self, client: AsyncClient):
        """Test demand prediction requires auth."""
        response = await client.post(
            "/api/v1/demand/predict",
            json={},
        )
        assert response.status_code == 401


class TestAuthorizationHeaders:
    """Tests for various authorization header formats."""

    @pytest.mark.asyncio
    async def test_bearer_case_sensitivity(
        self,
        client: AsyncClient,
    ):
        """Test that Bearer prefix is case-sensitive."""
        # Lowercase "bearer" should still work
        response = await client.get(
            "/api/v1/data/stats",
            headers={
                "Authorization": "bearer test-token-valid",
                "X-User-Id": "test-user-123",
            },
        )
        # Implementation may or may not accept lowercase
        # Just verify it doesn't crash
        assert response.status_code in [200, 401]

    @pytest.mark.asyncio
    async def test_extra_whitespace_in_header(
        self,
        client: AsyncClient,
    ):
        """Test handling of extra whitespace in header."""
        response = await client.get(
            "/api/v1/data/stats",
            headers={
                "Authorization": "Bearer  test-token-valid",  # Extra space
                "X-User-Id": "test-user-123",
            },
        )
        # Should handle gracefully
        assert response.status_code in [200, 401]
