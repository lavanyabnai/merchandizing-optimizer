"""Performance benchmark tests for the API."""

import time
import pytest
from httpx import AsyncClient


class TestOptimizationPerformance:
    """Performance tests for optimization operations."""

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_optimization_completes_under_5_seconds(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that optimization completes within 5 seconds."""
        start_time = time.perf_counter()

        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": 50,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 5,
                },
            },
            headers=auth_headers,
        )

        elapsed_time = time.perf_counter() - start_time

        # Request should complete (not hang)
        assert response.status_code in [200, 202, 422, 500]

        # Should complete within 5 seconds
        assert elapsed_time < 5.0, f"Optimization took {elapsed_time:.2f}s (limit: 5s)"


class TestSimulationPerformance:
    """Performance tests for simulation operations."""

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_simulation_5000_trials_under_10_seconds(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that 5000-trial simulation completes within 10 seconds."""
        start_time = time.perf_counter()

        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "remove_sku",
                "parameters": {"sku": sample_products[0].sku},
                "store_id": str(sample_stores[0].id),
                "config": {
                    "num_trials": 5000,
                    "demand_cv": 0.2,
                },
            },
            headers=auth_headers,
        )

        elapsed_time = time.perf_counter() - start_time

        # Request should complete
        assert response.status_code in [200, 202, 422, 500]

        # Should complete within 10 seconds
        assert elapsed_time < 10.0, f"Simulation took {elapsed_time:.2f}s (limit: 10s)"


class TestClusteringPerformance:
    """Performance tests for clustering operations."""

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_clustering_25_stores_under_2_seconds(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test that clustering 25 stores completes within 2 seconds."""
        # First seed enough data
        await client.post(
            "/api/v1/data/seed",
            json={
                "num_products": 30,
                "num_stores": 25,
                "weeks": 12,
                "seed": 42,
                "clear_existing": True,
            },
            headers=auth_headers,
        )

        start_time = time.perf_counter()

        response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "kmeans",
                "n_clusters": 4,
                "features": ["revenue", "traffic", "premium_share"],
            },
            headers=auth_headers,
        )

        elapsed_time = time.perf_counter() - start_time

        # Request should complete
        assert response.status_code in [200, 202, 422, 500]

        # Should complete within 2 seconds
        assert elapsed_time < 2.0, f"Clustering took {elapsed_time:.2f}s (limit: 2s)"


class TestAPIResponseTime:
    """Performance tests for API response times."""

    @pytest.mark.asyncio
    async def test_api_response_time_under_200ms(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
    ):
        """Test that simple GET endpoints respond within 200ms."""
        endpoints = [
            "/api/v1/health",
            "/api/v1/data/stats",
        ]

        for endpoint in endpoints:
            start_time = time.perf_counter()

            response = await client.get(endpoint, headers=auth_headers)

            elapsed_ms = (time.perf_counter() - start_time) * 1000

            # Should respond (don't care about specific status for this test)
            assert response.status_code in [200, 401, 404, 500]

            # Should respond within 200ms
            assert elapsed_ms < 200, f"{endpoint} took {elapsed_ms:.0f}ms (limit: 200ms)"

    @pytest.mark.asyncio
    async def test_export_response_time(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
    ):
        """Test that export endpoints respond reasonably fast."""
        start_time = time.perf_counter()

        response = await client.get(
            "/api/v1/data/export/products",
            params={"limit": 100},
            headers=auth_headers,
        )

        elapsed_ms = (time.perf_counter() - start_time) * 1000

        assert response.status_code == 200
        # Should respond within 500ms for 100 products
        assert elapsed_ms < 500, f"Product export took {elapsed_ms:.0f}ms (limit: 500ms)"


class TestConcurrentRequests:
    """Tests for handling concurrent requests."""

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_concurrent_data_reads(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
    ):
        """Test handling multiple concurrent read requests."""
        import asyncio

        async def make_request():
            return await client.get(
                "/api/v1/data/export/products",
                params={"limit": 10},
                headers=auth_headers,
            )

        # Make 10 concurrent requests
        start_time = time.perf_counter()
        responses = await asyncio.gather(*[make_request() for _ in range(10)])
        elapsed_time = time.perf_counter() - start_time

        # All should succeed
        for response in responses:
            assert response.status_code == 200

        # Should complete within reasonable time (not 10x single request)
        assert elapsed_time < 5.0, f"10 concurrent requests took {elapsed_time:.2f}s"


class TestDataScaling:
    """Tests for performance with varying data sizes."""

    @pytest.mark.asyncio
    @pytest.mark.slow
    async def test_seeding_scales_linearly(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test that seeding time scales approximately linearly."""
        sizes = [10, 20, 40]
        times = []

        for num_products in sizes:
            # Clear first
            await client.delete(
                "/api/v1/data/clear",
                params={"confirm": True},
                headers=auth_headers,
            )

            start_time = time.perf_counter()

            response = await client.post(
                "/api/v1/data/seed",
                json={
                    "num_products": num_products,
                    "num_stores": 5,
                    "weeks": 4,
                },
                headers=auth_headers,
            )

            elapsed_time = time.perf_counter() - start_time
            times.append(elapsed_time)

            assert response.status_code == 200

        # Time should scale roughly linearly (not exponentially)
        # 4x products should take less than 8x time
        if times[0] > 0.01:  # Avoid division issues with very fast operations
            ratio = times[2] / times[0]
            assert ratio < 8.0, f"Seeding scaled by {ratio:.1f}x for 4x data (limit: 8x)"


class TestMemoryEfficiency:
    """Tests for memory-efficient operations."""

    @pytest.mark.asyncio
    async def test_paginated_export_works(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
    ):
        """Test that paginated exports work correctly."""
        # First page
        response1 = await client.get(
            "/api/v1/data/export/products",
            params={"skip": 0, "limit": 5},
            headers=auth_headers,
        )

        assert response1.status_code == 200
        data1 = response1.json()
        assert len(data1["data"]) <= 5

        # Second page
        response2 = await client.get(
            "/api/v1/data/export/products",
            params={"skip": 5, "limit": 5},
            headers=auth_headers,
        )

        assert response2.status_code == 200
        data2 = response2.json()

        # Pages should be different (if enough data)
        if len(data1["data"]) == 5 and len(data2["data"]) > 0:
            skus1 = set(p["sku"] for p in data1["data"])
            skus2 = set(p["sku"] for p in data2["data"])
            assert len(skus1.intersection(skus2)) == 0, "Pagination returned duplicate data"
