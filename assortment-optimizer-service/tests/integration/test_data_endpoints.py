"""Integration tests for data management endpoints."""

import io
import json
import pytest
from httpx import AsyncClient

from tests.conftest import create_test_product_data, create_test_store_data


class TestSeedEndpoint:
    """Tests for the /api/v1/data/seed endpoint."""

    @pytest.mark.asyncio
    async def test_seed_data_creates_products_stores_sales(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that seeding creates products, stores, and sales."""
        response = await client.post(
            "/api/v1/data/seed",
            json={
                "num_products": 10,
                "num_stores": 5,
                "weeks": 4,
                "year": 2024,
                "seed": 42,
                "clear_existing": True,
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["products_created"] == 10
        assert data["stores_created"] == 5
        assert data["sales_records_created"] > 0
        assert "message" in data

    @pytest.mark.asyncio
    async def test_seed_data_with_defaults(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test seeding with default parameters."""
        response = await client.post(
            "/api/v1/data/seed",
            json={"num_products": 5, "num_stores": 3, "weeks": 2},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.asyncio
    async def test_seed_data_requires_auth(self, client: AsyncClient):
        """Test that seeding requires authentication."""
        response = await client.post(
            "/api/v1/data/seed",
            json={"num_products": 5, "num_stores": 3},
        )

        assert response.status_code == 401


class TestImportProductsEndpoint:
    """Tests for the /api/v1/data/import/products endpoint."""

    @pytest.mark.asyncio
    async def test_import_products_json(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test importing products from JSON file."""
        products = create_test_product_data(5)
        content = json.dumps(products).encode("utf-8")

        files = {"file": ("products.json", io.BytesIO(content), "application/json")}

        response = await client.post(
            "/api/v1/data/import/products",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["imported"] == 5
        assert data["failed"] == 0

    @pytest.mark.asyncio
    async def test_import_products_csv(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test importing products from CSV file."""
        csv_content = """sku,name,brand,brand_tier,subcategory,size,pack_type,price,cost,width_inches
CSV-SKU-001,Test CSV Product,Test Brand,National A,Soft Drinks,12oz,Single,2.99,1.50,3.0
CSV-SKU-002,Test CSV Product 2,Test Brand,Premium,Juices,16oz,Single,3.99,2.00,3.5"""

        files = {"file": ("products.csv", io.BytesIO(csv_content.encode()), "text/csv")}

        response = await client.post(
            "/api/v1/data/import/products",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["imported"] == 2

    @pytest.mark.asyncio
    async def test_import_invalid_data_returns_422(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that invalid data returns validation error."""
        # Missing required fields
        invalid_products = [
            {"sku": "INVALID-001", "name": "Missing fields"}
            # Missing: brand, brand_tier, subcategory, size, pack_type, price, cost, width_inches
        ]
        content = json.dumps(invalid_products).encode("utf-8")

        files = {"file": ("products.json", io.BytesIO(content), "application/json")}

        response = await client.post(
            "/api/v1/data/import/products",
            files=files,
            headers=auth_headers,
        )

        # Should return success=False with errors
        data = response.json()
        assert data["success"] is False
        assert data["failed"] > 0
        assert data["errors"] is not None


class TestImportStoresEndpoint:
    """Tests for the /api/v1/data/import/stores endpoint."""

    @pytest.mark.asyncio
    async def test_import_stores_json(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test importing stores from JSON file."""
        stores = create_test_store_data(3)
        content = json.dumps(stores).encode("utf-8")

        files = {"file": ("stores.json", io.BytesIO(content), "application/json")}

        response = await client.post(
            "/api/v1/data/import/stores",
            files=files,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["imported"] == 3


class TestExportEndpoints:
    """Tests for export endpoints."""

    @pytest.mark.asyncio
    async def test_export_products_returns_json(
        self, client: AsyncClient, auth_headers: dict, sample_products
    ):
        """Test exporting products returns JSON data."""
        response = await client.get(
            "/api/v1/data/export/products",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert "data" in data
        assert data["count"] > 0
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_export_products_with_filters(
        self, client: AsyncClient, auth_headers: dict, sample_products
    ):
        """Test exporting products with filters."""
        response = await client.get(
            "/api/v1/data/export/products",
            params={"subcategory": "Soft Drinks", "limit": 5},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["count"] <= 5
        for product in data["data"]:
            assert product["subcategory"] == "Soft Drinks"

    @pytest.mark.asyncio
    async def test_export_stores_returns_json(
        self, client: AsyncClient, auth_headers: dict, sample_stores
    ):
        """Test exporting stores returns JSON data."""
        response = await client.get(
            "/api/v1/data/export/stores",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        assert "data" in data
        assert data["count"] > 0


class TestClearDataEndpoint:
    """Tests for the /api/v1/data/clear endpoint."""

    @pytest.mark.asyncio
    async def test_clear_requires_confirmation(
        self, client: AsyncClient, auth_headers: dict
    ):
        """Test that clear requires explicit confirmation."""
        response = await client.delete(
            "/api/v1/data/clear",
            headers=auth_headers,
        )

        # Should fail without confirm=true
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_clear_with_confirmation(
        self, client: AsyncClient, auth_headers: dict, sample_products
    ):
        """Test clearing data with confirmation."""
        response = await client.delete(
            "/api/v1/data/clear",
            params={"confirm": True},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "deleted" in data


class TestDataStatistics:
    """Tests for the /api/v1/data/stats endpoint."""

    @pytest.mark.asyncio
    async def test_get_statistics(
        self,
        client: AsyncClient,
        auth_headers: dict,
        sample_products,
        sample_stores,
        sample_sales,
    ):
        """Test getting data statistics."""
        response = await client.get(
            "/api/v1/data/stats",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "stores" in data
        assert "sales" in data
        assert data["products"]["count"] > 0
        assert data["stores"]["count"] > 0
        assert data["sales"]["count"] > 0
