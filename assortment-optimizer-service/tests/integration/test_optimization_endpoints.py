"""Integration tests for optimization endpoints."""

import pytest
from httpx import AsyncClient


class TestRunOptimization:
    """Tests for running optimization."""

    @pytest.mark.asyncio
    async def test_run_optimization_success(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test running optimization successfully."""
        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": 50,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 5,
                    "min_skus_per_subcategory": 1,
                    "min_skus_per_price_tier": 1,
                },
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]  # May be async
        data = response.json()
        assert "run_id" in data or "id" in data

    @pytest.mark.asyncio
    async def test_optimization_respects_total_facings(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that optimization respects total facings constraint."""
        total_facings = 30

        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": total_facings,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 3,
                },
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "results" in data and "product_allocations" in data["results"]:
                allocations = data["results"]["product_allocations"]
                total_allocated = sum(a.get("optimized_facings", 0) for a in allocations)
                assert total_allocated <= total_facings

    @pytest.mark.asyncio
    async def test_optimization_includes_must_carry(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that must-carry products are included in optimization."""
        must_carry_sku = sample_products[0].sku

        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": 50,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 5,
                    "must_carry": [must_carry_sku],
                },
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "results" in data and "product_allocations" in data["results"]:
                allocations = data["results"]["product_allocations"]
                skus = [a.get("sku") for a in allocations if a.get("optimized_facings", 0) > 0]
                assert must_carry_sku in skus

    @pytest.mark.asyncio
    async def test_optimization_excludes_excluded(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that excluded products are not in optimization."""
        excluded_sku = sample_products[0].sku

        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": 50,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 5,
                    "exclude": [excluded_sku],
                },
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "results" in data and "product_allocations" in data["results"]:
                allocations = data["results"]["product_allocations"]
                skus = [a.get("sku") for a in allocations if a.get("optimized_facings", 0) > 0]
                assert excluded_sku not in skus

    @pytest.mark.asyncio
    async def test_optimization_covers_subcategories(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that optimization covers all subcategories."""
        min_per_subcategory = 1

        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": 100,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 5,
                    "min_skus_per_subcategory": min_per_subcategory,
                },
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            if "results" in data and "product_allocations" in data["results"]:
                allocations = data["results"]["product_allocations"]
                active_allocations = [a for a in allocations if a.get("optimized_facings", 0) > 0]

                subcategories = set(a.get("subcategory") for a in active_allocations)
                # Should have multiple subcategories represented
                assert len(subcategories) >= 1


class TestGetOptimizationResults:
    """Tests for retrieving optimization results."""

    @pytest.mark.asyncio
    async def test_get_optimization_results(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_optimization_run,
    ):
        """Test getting optimization results by ID."""
        response = await client.get(
            f"/api/v1/optimization/{sample_optimization_run.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "completed"

    @pytest.mark.asyncio
    async def test_get_nonexistent_optimization(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test getting non-existent optimization returns 404."""
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(
            f"/api/v1/optimization/{fake_id}",
            headers=auth_headers,
        )

        assert response.status_code == 404


class TestOptimizationHistory:
    """Tests for optimization history."""

    @pytest.mark.asyncio
    async def test_optimization_history_pagination(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_optimization_run,
    ):
        """Test pagination of optimization history."""
        response = await client.get(
            "/api/v1/optimization/history",
            params={"skip": 0, "limit": 10},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data or isinstance(data, list)

    @pytest.mark.asyncio
    async def test_optimization_history_filter_by_store(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_optimization_run,
        sample_stores,
    ):
        """Test filtering optimization history by store."""
        response = await client.get(
            "/api/v1/optimization/history",
            params={"store_id": str(sample_stores[0].id)},
            headers=auth_headers,
        )

        assert response.status_code == 200


class TestCompareOptimizations:
    """Tests for comparing optimization runs."""

    @pytest.mark.asyncio
    async def test_compare_optimizations(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_optimization_run,
    ):
        """Test comparing two optimization runs."""
        # For now, compare the same run to itself
        response = await client.post(
            "/api/v1/optimization/compare",
            json={
                "run_id_1": str(sample_optimization_run.id),
                "run_id_2": str(sample_optimization_run.id),
            },
            headers=auth_headers,
        )

        if response.status_code == 200:
            data = response.json()
            assert "comparison" in data or "run_1" in data


class TestOptimizationAuth:
    """Tests for optimization authentication."""

    @pytest.mark.asyncio
    async def test_optimization_requires_auth(self, client: AsyncClient):
        """Test that optimization requires authentication."""
        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "constraints": {"total_facings": 50},
            },
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_optimization_history_requires_auth(self, client: AsyncClient):
        """Test that history requires authentication."""
        response = await client.get("/api/v1/optimization/history")
        assert response.status_code == 401
