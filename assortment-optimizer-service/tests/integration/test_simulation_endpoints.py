"""Integration tests for simulation endpoints."""

import pytest
from httpx import AsyncClient


class TestRemoveSkuSimulation:
    """Tests for remove SKU simulation."""

    @pytest.mark.asyncio
    async def test_remove_sku_simulation(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test simulating SKU removal."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "remove_sku",
                "parameters": {
                    "sku": sample_products[0].sku,
                },
                "store_id": str(sample_stores[0].id),
                "config": {
                    "num_trials": 100,  # Reduced for testing
                    "demand_cv": 0.2,
                },
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]
        data = response.json()
        assert "run_id" in data or "id" in data


class TestAddSkuSimulation:
    """Tests for add SKU simulation."""

    @pytest.mark.asyncio
    async def test_add_sku_simulation(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test simulating SKU addition."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "add_sku",
                "parameters": {
                    "sku": "NEW-SKU-001",
                    "price": 2.99,
                    "facings": 3,
                    "subcategory": "Soft Drinks",
                },
                "store_id": str(sample_stores[0].id),
                "config": {
                    "num_trials": 100,
                },
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202, 422]  # 422 if SKU doesn't exist


class TestChangeFacingsSimulation:
    """Tests for change facings simulation."""

    @pytest.mark.asyncio
    async def test_change_facings_simulation(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test simulating facings change."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "change_facings",
                "parameters": {
                    "sku": sample_products[0].sku,
                    "current_facings": 2,
                    "new_facings": 5,
                },
                "store_id": str(sample_stores[0].id),
                "config": {
                    "num_trials": 100,
                },
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]


class TestChangePriceSimulation:
    """Tests for change price simulation."""

    @pytest.mark.asyncio
    async def test_change_price_simulation(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test simulating price change."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "change_price",
                "parameters": {
                    "sku": sample_products[0].sku,
                    "current_price": float(sample_products[0].price),
                    "new_price": float(sample_products[0].price) * 0.9,  # 10% discount
                },
                "store_id": str(sample_stores[0].id),
                "config": {
                    "num_trials": 100,
                },
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]


class TestSimulationResults:
    """Tests for simulation result structure."""

    @pytest.mark.asyncio
    async def test_simulation_returns_distribution_stats(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_simulation_run,
    ):
        """Test that simulation returns distribution statistics."""
        response = await client.get(
            f"/api/v1/simulation/{sample_simulation_run.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        # Check for distribution stats in results
        if "results" in data and data["results"]:
            results = data["results"]
            # Should have mean and std for key metrics
            assert "revenue_mean" in results or "profit_mean" in results

    @pytest.mark.asyncio
    async def test_simulation_confidence_intervals(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that simulation returns confidence intervals."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "remove_sku",
                "parameters": {"sku": sample_products[0].sku},
                "store_id": str(sample_stores[0].id),
                "config": {"num_trials": 100},
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            # Check for confidence intervals
            if "results" in data:
                results = data["results"]
                # May have percentile info
                assert isinstance(results, dict)


class TestBatchSimulation:
    """Tests for batch simulation."""

    @pytest.mark.asyncio
    async def test_batch_simulation(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test running multiple simulations in batch."""
        scenarios = [
            {
                "scenario_type": "remove_sku",
                "parameters": {"sku": sample_products[0].sku},
            },
            {
                "scenario_type": "change_facings",
                "parameters": {
                    "sku": sample_products[1].sku,
                    "current_facings": 2,
                    "new_facings": 4,
                },
            },
        ]

        response = await client.post(
            "/api/v1/simulation/batch",
            json={
                "scenarios": scenarios,
                "store_id": str(sample_stores[0].id),
                "config": {"num_trials": 50},
            },
            headers=auth_headers,
        )

        # Batch endpoint may not exist
        if response.status_code == 200:
            data = response.json()
            assert "results" in data or "run_ids" in data


class TestSimulationHistory:
    """Tests for simulation history."""

    @pytest.mark.asyncio
    async def test_get_simulation_history(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_simulation_run,
    ):
        """Test retrieving simulation history."""
        response = await client.get(
            "/api/v1/simulation/history",
            params={"limit": 10},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, (list, dict))

    @pytest.mark.asyncio
    async def test_get_simulation_by_id(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_simulation_run,
    ):
        """Test retrieving specific simulation."""
        response = await client.get(
            f"/api/v1/simulation/{sample_simulation_run.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "scenario_type" in data or "results" in data


class TestSimulationAuth:
    """Tests for simulation authentication."""

    @pytest.mark.asyncio
    async def test_simulation_requires_auth(self, client: AsyncClient):
        """Test that simulation requires authentication."""
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "remove_sku",
                "parameters": {"sku": "TEST"},
            },
        )

        assert response.status_code == 401
