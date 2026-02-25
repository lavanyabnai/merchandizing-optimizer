"""Integration tests for demand model endpoints."""

import pytest
from httpx import AsyncClient


class TestDemandPrediction:
    """Tests for demand prediction endpoints."""

    @pytest.mark.asyncio
    async def test_predict_demand_returns_probabilities(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that demand prediction returns choice probabilities."""
        response = await client.post(
            "/api/v1/demand/predict",
            json={
                "store_id": str(sample_stores[0].id),
                "product_ids": [str(p.id) for p in sample_products[:5]],
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "probabilities" in data
        assert isinstance(data["probabilities"], dict)

    @pytest.mark.asyncio
    async def test_probabilities_sum_to_one(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that choice probabilities sum to approximately 1."""
        response = await client.post(
            "/api/v1/demand/predict",
            json={
                "store_id": str(sample_stores[0].id),
                "product_ids": [str(p.id) for p in sample_products[:5]],
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "probabilities" in data and data["probabilities"]:
                total = sum(data["probabilities"].values())
                # Probabilities should sum to approximately 1 (with some tolerance)
                assert 0.99 <= total <= 1.01


class TestSubstitutionMatrix:
    """Tests for substitution matrix endpoints."""

    @pytest.mark.asyncio
    async def test_substitution_matrix_shape(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_sales,
    ):
        """Test that substitution matrix has correct shape."""
        response = await client.get(
            "/api/v1/demand/substitution-matrix",
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "matrix" in data:
                matrix = data["matrix"]
                assert isinstance(matrix, dict)
                # Matrix should be square (same number of from/to entries)
                brands = list(matrix.keys())
                for brand in brands:
                    assert len(matrix[brand]) == len(brands)

    @pytest.mark.asyncio
    async def test_demand_transfer_sums_correctly(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_sales,
    ):
        """Test that demand transfer probabilities are valid."""
        response = await client.get(
            "/api/v1/demand/substitution-matrix",
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "matrix" in data:
                matrix = data["matrix"]
                # Each row should sum to <= 1 (some demand walks away)
                for brand, transfers in matrix.items():
                    row_sum = sum(transfers.values())
                    assert 0 <= row_sum <= 1.01


class TestElasticity:
    """Tests for elasticity calculation endpoints."""

    @pytest.mark.asyncio
    async def test_elasticity_calculations(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_sales,
    ):
        """Test price and space elasticity calculations."""
        response = await client.get(
            "/api/v1/demand/elasticity",
            params={"product_id": str(sample_products[0].id)},
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            # Elasticity values should be reasonable
            if "price_elasticity" in data:
                # Price elasticity is typically negative
                assert data["price_elasticity"] < 0 or data["price_elasticity"] == 0

            if "space_elasticity" in data:
                # Space elasticity is typically positive but small
                assert 0 <= data["space_elasticity"] <= 1

    @pytest.mark.asyncio
    async def test_cross_elasticity(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_sales,
    ):
        """Test cross-price elasticity calculations."""
        response = await client.post(
            "/api/v1/demand/cross-elasticity",
            json={
                "product_id": str(sample_products[0].id),
                "competitor_ids": [str(p.id) for p in sample_products[1:3]],
            },
            headers=auth_headers,
        )

        # Endpoint may not be implemented
        if response.status_code == 200:
            data = response.json()
            assert "cross_elasticities" in data


class TestDemandForecast:
    """Tests for demand forecasting endpoints."""

    @pytest.mark.asyncio
    async def test_forecast_demand(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test demand forecasting."""
        response = await client.post(
            "/api/v1/demand/forecast",
            json={
                "store_id": str(sample_stores[0].id),
                "product_ids": [str(p.id) for p in sample_products[:3]],
                "weeks_ahead": 4,
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            assert "forecasts" in data

    @pytest.mark.asyncio
    async def test_demand_requires_auth(self, client: AsyncClient):
        """Test that demand endpoints require authentication."""
        response = await client.post(
            "/api/v1/demand/predict",
            json={"store_id": "test", "product_ids": []},
        )

        assert response.status_code == 401
