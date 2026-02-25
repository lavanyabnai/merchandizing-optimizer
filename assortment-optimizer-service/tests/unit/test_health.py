"""Unit tests for health endpoints."""

import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoints:
    """Tests for health check endpoints."""

    def test_health_check(self, client: TestClient) -> None:
        """Test basic health check returns healthy status."""
        response = client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "healthy"
        assert data["service"] == "assortment-optimizer"
        assert data["version"] == "1.0.0"
        assert "timestamp" in data
        assert "environment" in data

    def test_liveness_check(self, client: TestClient) -> None:
        """Test liveness check returns alive status."""
        response = client.get("/api/v1/health/live")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "alive"

    def test_readiness_check(self, client: TestClient) -> None:
        """Test readiness check returns detailed status."""
        response = client.get("/api/v1/health/ready")

        assert response.status_code == 200
        data = response.json()

        assert data["status"] == "healthy"
        assert "database" in data
        assert "redis" in data


class TestCORS:
    """Tests for CORS configuration."""

    def test_cors_allows_configured_origin(self, client: TestClient) -> None:
        """Test that CORS allows requests from configured origin."""
        response = client.options(
            "/api/v1/health",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
            },
        )

        # CORS preflight should succeed
        assert response.status_code in [200, 204]


class TestErrorHandling:
    """Tests for error handling."""

    def test_404_for_unknown_route(self, client: TestClient) -> None:
        """Test that unknown routes return 404."""
        response = client.get("/api/v1/unknown-endpoint")

        assert response.status_code == 404
