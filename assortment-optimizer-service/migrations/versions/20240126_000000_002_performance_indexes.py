"""Add performance indexes for query optimization.

Revision ID: 002
Revises: 001
Create Date: 2024-01-26 00:00:00.000000

This migration adds additional indexes to improve query performance for:
- Sales aggregation queries
- Product filtering by active status
- Store filtering by active status
- Date-based queries for runs
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: str = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add performance indexes."""
    # Covering index for sales aggregation queries
    # This index helps with the common pattern:
    #   SELECT product_id, SUM(units_sold), SUM(revenue), AVG(facings)
    #   FROM assortment_sales WHERE store_id = ? GROUP BY product_id
    op.create_index(
        "ix_sales_store_product_covering",
        "assortment_sales",
        ["store_id", "product_id", "units_sold", "revenue", "facings"],
        postgresql_using="btree",
    )

    # Index for filtering active products with subcategory
    op.create_index(
        "ix_products_active_subcategory",
        "assortment_products",
        ["is_active", "subcategory"],
        postgresql_where="is_active = true",
    )

    # Index for filtering active stores
    op.create_index(
        "ix_stores_active",
        "assortment_stores",
        ["is_active"],
        postgresql_where="is_active = true",
    )

    # Index for optimization runs by date range
    op.create_index(
        "ix_optimization_runs_date",
        "optimization_runs",
        ["run_date"],
    )

    # Index for simulation runs by creation date
    op.create_index(
        "ix_simulation_runs_date",
        "simulation_runs",
        ["created_at"],
    )

    # Index for clustering runs by creation date
    op.create_index(
        "ix_clustering_runs_date",
        "clustering_runs",
        ["created_at"],
    )

    # Index for sales year filtering (for time-series analysis)
    op.create_index(
        "ix_sales_year",
        "assortment_sales",
        ["year"],
    )

    # Partial index for recent sales (last year) - commonly queried subset
    op.create_index(
        "ix_sales_recent",
        "assortment_sales",
        ["product_id", "store_id", "week_number"],
        postgresql_where="year >= 2024",
    )


def downgrade() -> None:
    """Remove performance indexes."""
    op.drop_index("ix_sales_recent", table_name="assortment_sales")
    op.drop_index("ix_sales_year", table_name="assortment_sales")
    op.drop_index("ix_clustering_runs_date", table_name="clustering_runs")
    op.drop_index("ix_simulation_runs_date", table_name="simulation_runs")
    op.drop_index("ix_optimization_runs_date", table_name="optimization_runs")
    op.drop_index("ix_stores_active", table_name="assortment_stores")
    op.drop_index("ix_products_active_subcategory", table_name="assortment_products")
    op.drop_index("ix_sales_store_product_covering", table_name="assortment_sales")
