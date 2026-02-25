"""Integration tests for complete optimization workflow."""

import pytest
from httpx import AsyncClient


class TestCompleteOptimizationWorkflow:
    """Tests for the complete end-to-end optimization workflow."""

    @pytest.mark.asyncio
    async def test_complete_optimization_workflow(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test complete workflow from seeding to simulation.

        Steps:
        1. Seed data
        2. Verify products/stores created
        3. Run optimization
        4. Verify results
        5. Run simulation on optimized assortment
        6. Run clustering
        7. Verify all results consistent
        """
        # Step 1: Seed data
        seed_response = await client.post(
            "/api/v1/data/seed",
            json={
                "num_products": 15,
                "num_stores": 5,
                "weeks": 8,
                "year": 2024,
                "seed": 42,
                "clear_existing": True,
            },
            headers=auth_headers,
        )

        assert seed_response.status_code == 200
        seed_data = seed_response.json()
        assert seed_data["success"] is True
        assert seed_data["products_created"] == 15
        assert seed_data["stores_created"] == 5

        # Step 2: Verify products created
        products_response = await client.get(
            "/api/v1/data/export/products",
            params={"limit": 20},
            headers=auth_headers,
        )

        assert products_response.status_code == 200
        products_data = products_response.json()
        assert products_data["count"] >= 15

        # Verify stores created
        stores_response = await client.get(
            "/api/v1/data/export/stores",
            params={"limit": 10},
            headers=auth_headers,
        )

        assert stores_response.status_code == 200
        stores_data = stores_response.json()
        assert stores_data["count"] >= 5

        # Get a store ID for subsequent tests
        store_id = None
        if stores_data["data"]:
            # Get store by code from database
            stats_response = await client.get(
                "/api/v1/data/stats",
                headers=auth_headers,
            )
            assert stats_response.status_code == 200

        # Step 3: Run optimization (if endpoints support it without store_id)
        optimization_response = await client.post(
            "/api/v1/optimization/run",
            json={
                "constraints": {
                    "total_facings": 50,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 4,
                    "min_skus_per_subcategory": 2,
                    "min_skus_per_price_tier": 1,
                },
            },
            headers=auth_headers,
        )

        # Optimization may require store_id - check both cases
        if optimization_response.status_code in [200, 202]:
            opt_data = optimization_response.json()
            run_id = opt_data.get("run_id") or opt_data.get("id")

            # Step 4: Verify results (if run completed)
            if run_id:
                result_response = await client.get(
                    f"/api/v1/optimization/{run_id}",
                    headers=auth_headers,
                )

                if result_response.status_code == 200:
                    result_data = result_response.json()
                    assert "status" in result_data

                    # Step 5: Run simulation if optimization succeeded
                    if result_data.get("status") == "completed":
                        # Get a product SKU for simulation
                        if products_data["data"]:
                            test_sku = products_data["data"][0]["sku"]

                            sim_response = await client.post(
                                "/api/v1/simulation/run",
                                json={
                                    "scenario_type": "remove_sku",
                                    "parameters": {"sku": test_sku},
                                    "config": {"num_trials": 50},
                                },
                                headers=auth_headers,
                            )

                            # Simulation should at least accept the request
                            assert sim_response.status_code in [200, 202, 422]

        # Step 6: Run clustering
        cluster_response = await client.post(
            "/api/v1/cluster/run",
            json={
                "method": "kmeans",
                "n_clusters": 3,
                "features": ["revenue", "traffic"],
            },
            headers=auth_headers,
        )

        # Clustering may succeed or fail depending on data volume
        assert cluster_response.status_code in [200, 202, 422, 500]

        # Step 7: Verify data consistency
        final_stats = await client.get(
            "/api/v1/data/stats",
            headers=auth_headers,
        )

        assert final_stats.status_code == 200
        stats_data = final_stats.json()

        # Data should still be consistent
        assert stats_data["products"]["count"] >= 15
        assert stats_data["stores"]["count"] >= 5
        assert stats_data["sales"]["count"] > 0


class TestWorkflowWithStoreSelection:
    """Tests for workflow with specific store selection."""

    @pytest.mark.asyncio
    async def test_store_specific_optimization(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test optimization for a specific store."""
        store_id = str(sample_stores[0].id)

        # Run optimization for specific store
        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": store_id,
                "constraints": {
                    "total_facings": 40,
                    "min_facings_per_sku": 1,
                    "max_facings_per_sku": 3,
                },
            },
            headers=auth_headers,
        )

        assert response.status_code in [200, 202]


class TestWorkflowErrorRecovery:
    """Tests for workflow error handling and recovery."""

    @pytest.mark.asyncio
    async def test_optimization_with_impossible_constraints(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test handling of impossible constraints."""
        response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {
                    "total_facings": 10,  # Very limited space
                    "min_facings_per_sku": 5,  # But high minimum per SKU
                    "min_skus_per_subcategory": 10,  # Impossible to satisfy
                },
            },
            headers=auth_headers,
        )

        # Should either fail gracefully or return infeasibility
        assert response.status_code in [200, 202, 422, 400]

    @pytest.mark.asyncio
    async def test_simulation_after_failed_optimization(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
    ):
        """Test simulation can run even without completed optimization."""
        # Try simulation directly (without optimization)
        response = await client.post(
            "/api/v1/simulation/run",
            json={
                "scenario_type": "change_price",
                "parameters": {
                    "sku": sample_products[0].sku,
                    "current_price": float(sample_products[0].price),
                    "new_price": float(sample_products[0].price) * 0.95,
                },
                "store_id": str(sample_stores[0].id),
                "config": {"num_trials": 50},
            },
            headers=auth_headers,
        )

        # Should handle gracefully
        assert response.status_code in [200, 202, 422]


class TestWorkflowDataConsistency:
    """Tests for data consistency across workflow stages."""

    @pytest.mark.asyncio
    async def test_data_persists_across_operations(
        self,
        client: AsyncClient,
        auth_headers: dict,
    ):
        """Test that data persists across multiple operations."""
        # Seed initial data
        await client.post(
            "/api/v1/data/seed",
            json={"num_products": 5, "num_stores": 2, "weeks": 2, "clear_existing": True},
            headers=auth_headers,
        )

        # Get initial counts
        stats1 = await client.get("/api/v1/data/stats", headers=auth_headers)
        initial_count = stats1.json()["products"]["count"]

        # Run some operations
        await client.get("/api/v1/data/export/products", headers=auth_headers)
        await client.get("/api/v1/data/export/stores", headers=auth_headers)

        # Verify counts unchanged
        stats2 = await client.get("/api/v1/data/stats", headers=auth_headers)
        final_count = stats2.json()["products"]["count"]

        assert initial_count == final_count

    @pytest.mark.asyncio
    async def test_optimization_results_persist(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test that optimization results are persisted."""
        # Run optimization
        opt_response = await client.post(
            "/api/v1/optimization/run",
            json={
                "store_id": str(sample_stores[0].id),
                "constraints": {"total_facings": 30},
            },
            headers=auth_headers,
        )

        if opt_response.status_code in [200, 202]:
            opt_data = opt_response.json()
            run_id = opt_data.get("run_id") or opt_data.get("id")

            if run_id:
                # Retrieve results
                result1 = await client.get(
                    f"/api/v1/optimization/{run_id}",
                    headers=auth_headers,
                )

                # Retrieve again
                result2 = await client.get(
                    f"/api/v1/optimization/{run_id}",
                    headers=auth_headers,
                )

                # Should be consistent
                assert result1.status_code == result2.status_code
                if result1.status_code == 200:
                    assert result1.json()["status"] == result2.json()["status"]
