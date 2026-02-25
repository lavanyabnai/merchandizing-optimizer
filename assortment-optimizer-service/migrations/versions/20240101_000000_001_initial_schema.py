"""Initial schema for Assortment Optimizer.

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial database schema."""
    # Create enum types
    op.execute("CREATE TYPE brand_tier_enum AS ENUM ('Premium', 'National A', 'National B', 'Store Brand')")
    op.execute("CREATE TYPE store_format_enum AS ENUM ('Express', 'Standard', 'Superstore')")
    op.execute("CREATE TYPE location_type_enum AS ENUM ('Urban', 'Suburban', 'Rural')")
    op.execute("CREATE TYPE income_index_enum AS ENUM ('Low', 'Medium', 'High')")
    op.execute("CREATE TYPE optimization_status_enum AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled')")
    op.execute("CREATE TYPE scenario_type_enum AS ENUM ('remove_sku', 'add_sku', 'change_facings', 'change_price')")

    # Create assortment_products table
    op.create_table(
        "assortment_products",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sku", sa.String(50), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("brand", sa.String(100), nullable=False),
        sa.Column(
            "brand_tier",
            sa.Enum("Premium", "National A", "National B", "Store Brand", name="brand_tier_enum", create_type=False),
            nullable=False,
        ),
        sa.Column("subcategory", sa.String(100), nullable=False),
        sa.Column("size", sa.String(50), nullable=False),
        sa.Column("pack_type", sa.String(50), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("cost", sa.Numeric(10, 2), nullable=False),
        sa.Column("width_inches", sa.Numeric(5, 2), nullable=False),
        sa.Column("space_elasticity", sa.Numeric(5, 4), nullable=False, server_default="0.15"),
        sa.Column("flavor", sa.String(100), nullable=True),
        sa.Column("price_tier", sa.String(50), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_assortment_products"),
        sa.UniqueConstraint("sku", name="uq_assortment_products_sku"),
    )
    op.create_index("ix_assortment_products_sku", "assortment_products", ["sku"])
    op.create_index("ix_assortment_products_brand", "assortment_products", ["brand"])
    op.create_index("ix_assortment_products_brand_tier", "assortment_products", ["brand_tier"])
    op.create_index("ix_assortment_products_subcategory", "assortment_products", ["subcategory"])
    op.create_index("ix_assortment_products_price_tier", "assortment_products", ["price_tier"])
    op.create_index("ix_products_subcategory_brand", "assortment_products", ["subcategory", "brand"])
    op.create_index("ix_products_brand_tier_subcategory", "assortment_products", ["brand_tier", "subcategory"])

    # Create assortment_stores table
    op.create_table(
        "assortment_stores",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("store_code", sa.String(50), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "format",
            sa.Enum("Express", "Standard", "Superstore", name="store_format_enum", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "location_type",
            sa.Enum("Urban", "Suburban", "Rural", name="location_type_enum", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "income_index",
            sa.Enum("Low", "Medium", "High", name="income_index_enum", create_type=False),
            nullable=False,
        ),
        sa.Column("total_facings", sa.Integer(), nullable=False),
        sa.Column("num_shelves", sa.Integer(), nullable=False, server_default="4"),
        sa.Column("shelf_width_inches", sa.Numeric(6, 2), nullable=False, server_default="48.0"),
        sa.Column("weekly_traffic", sa.Integer(), nullable=False),
        sa.Column("region", sa.String(100), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_assortment_stores"),
        sa.UniqueConstraint("store_code", name="uq_assortment_stores_store_code"),
    )
    op.create_index("ix_assortment_stores_store_code", "assortment_stores", ["store_code"])
    op.create_index("ix_assortment_stores_format", "assortment_stores", ["format"])
    op.create_index("ix_assortment_stores_location_type", "assortment_stores", ["location_type"])
    op.create_index("ix_stores_format_location", "assortment_stores", ["format", "location_type"])

    # Create assortment_sales table
    op.create_table(
        "assortment_sales",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("store_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("week_number", sa.Integer(), nullable=False),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("units_sold", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("revenue", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("facings", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("on_promotion", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_assortment_sales"),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["assortment_products.id"],
            name="fk_assortment_sales_product_id_assortment_products",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["store_id"],
            ["assortment_stores.id"],
            name="fk_assortment_sales_store_id_assortment_stores",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "product_id", "store_id", "week_number", "year",
            name="uq_sales_product_store_week_year",
        ),
    )
    op.create_index("ix_assortment_sales_product_id", "assortment_sales", ["product_id"])
    op.create_index("ix_assortment_sales_store_id", "assortment_sales", ["store_id"])
    op.create_index("ix_sales_product_store", "assortment_sales", ["product_id", "store_id"])
    op.create_index("ix_sales_week_year", "assortment_sales", ["week_number", "year"])
    op.create_index("ix_sales_store_week", "assortment_sales", ["store_id", "week_number", "year"])

    # Create switching_matrix table
    op.create_table(
        "switching_matrix",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_brand", sa.String(100), nullable=False),
        sa.Column("to_brand", sa.String(100), nullable=False),
        sa.Column("switching_probability", sa.Numeric(5, 4), nullable=False),
        sa.Column("subcategory", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_switching_matrix"),
        sa.UniqueConstraint(
            "from_brand", "to_brand", "subcategory",
            name="uq_switching_from_to_subcategory",
        ),
    )
    op.create_index("ix_switching_matrix_from_brand", "switching_matrix", ["from_brand"])
    op.create_index("ix_switching_matrix_to_brand", "switching_matrix", ["to_brand"])
    op.create_index("ix_switching_matrix_subcategory", "switching_matrix", ["subcategory"])
    op.create_index("ix_switching_from_to", "switching_matrix", ["from_brand", "to_brand"])

    # Create optimization_runs table
    op.create_table(
        "optimization_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("store_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("run_date", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column(
            "status",
            sa.Enum("pending", "running", "completed", "failed", "cancelled", name="optimization_status_enum", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("constraints", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("results", postgresql.JSONB(), nullable=True),
        sa.Column("profit_lift_pct", sa.Numeric(8, 4), nullable=True),
        sa.Column("profit_lift_absolute", sa.Numeric(12, 2), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("user_id", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_optimization_runs"),
        sa.ForeignKeyConstraint(
            ["store_id"],
            ["assortment_stores.id"],
            name="fk_optimization_runs_store_id_assortment_stores",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_optimization_runs_store_id", "optimization_runs", ["store_id"])
    op.create_index("ix_optimization_runs_status", "optimization_runs", ["status"])
    op.create_index("ix_optimization_runs_user_id", "optimization_runs", ["user_id"])
    op.create_index("ix_optimization_status_date", "optimization_runs", ["status", "run_date"])

    # Create simulation_runs table
    op.create_table(
        "simulation_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("optimization_run_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "scenario_type",
            sa.Enum("remove_sku", "add_sku", "change_facings", "change_price", name="scenario_type_enum", create_type=False),
            nullable=False,
        ),
        sa.Column("parameters", postgresql.JSONB(), nullable=False, server_default="{}"),
        sa.Column("num_trials", sa.Integer(), nullable=False, server_default="5000"),
        sa.Column("results", postgresql.JSONB(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "running", "completed", "failed", "cancelled", name="optimization_status_enum", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("user_id", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_simulation_runs"),
        sa.ForeignKeyConstraint(
            ["optimization_run_id"],
            ["optimization_runs.id"],
            name="fk_simulation_runs_optimization_run_id_optimization_runs",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_simulation_runs_optimization_run_id", "simulation_runs", ["optimization_run_id"])
    op.create_index("ix_simulation_runs_scenario_type", "simulation_runs", ["scenario_type"])
    op.create_index("ix_simulation_runs_status", "simulation_runs", ["status"])
    op.create_index("ix_simulation_runs_user_id", "simulation_runs", ["user_id"])
    op.create_index("ix_simulation_scenario_status", "simulation_runs", ["scenario_type", "status"])

    # Create clustering_runs table
    op.create_table(
        "clustering_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("method", sa.String(50), nullable=False),
        sa.Column("n_clusters", sa.Integer(), nullable=False),
        sa.Column("features_used", postgresql.JSONB(), nullable=False, server_default="[]"),
        sa.Column("silhouette_score", sa.Numeric(6, 4), nullable=True),
        sa.Column("cluster_assignments", postgresql.JSONB(), nullable=True),
        sa.Column("cluster_profiles", postgresql.JSONB(), nullable=True),
        sa.Column("pca_coordinates", postgresql.JSONB(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("pending", "running", "completed", "failed", "cancelled", name="optimization_status_enum", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("execution_time_ms", sa.Integer(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("user_id", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id", name="pk_clustering_runs"),
    )
    op.create_index("ix_clustering_runs_status", "clustering_runs", ["status"])
    op.create_index("ix_clustering_runs_user_id", "clustering_runs", ["user_id"])


def downgrade() -> None:
    """Drop all tables and types."""
    op.drop_table("clustering_runs")
    op.drop_table("simulation_runs")
    op.drop_table("optimization_runs")
    op.drop_table("switching_matrix")
    op.drop_table("assortment_sales")
    op.drop_table("assortment_stores")
    op.drop_table("assortment_products")

    # Drop enum types
    op.execute("DROP TYPE IF EXISTS scenario_type_enum")
    op.execute("DROP TYPE IF EXISTS optimization_status_enum")
    op.execute("DROP TYPE IF EXISTS income_index_enum")
    op.execute("DROP TYPE IF EXISTS location_type_enum")
    op.execute("DROP TYPE IF EXISTS store_format_enum")
    op.execute("DROP TYPE IF EXISTS brand_tier_enum")
