"""Pydantic schemas for Simulation operations."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import Field, field_validator

from app.db.models import OptimizationStatus, ScenarioType
from app.schemas.common import BaseSchema


class SimulationConfig(BaseSchema):
    """Configuration for Monte Carlo simulation."""

    num_trials: int = Field(
        default=5000,
        ge=100,
        le=50000,
        description="Number of simulation trials",
    )
    demand_cv: float = Field(
        default=0.15,
        ge=0.01,
        le=0.5,
        description="Demand coefficient of variation",
    )
    price_elasticity_mean: float = Field(
        default=-1.8,
        le=0,
        description="Mean price elasticity",
    )
    price_elasticity_std: float = Field(
        default=0.3,
        ge=0,
        le=1,
        description="Price elasticity standard deviation",
    )
    space_elasticity_std: float = Field(
        default=0.03,
        ge=0,
        le=0.2,
        description="Space elasticity standard deviation",
    )
    walk_rate_mean: float = Field(
        default=0.09,
        ge=0,
        le=1,
        description="Mean walk-away rate when item unavailable",
    )
    walk_rate_std: float = Field(
        default=0.02,
        ge=0,
        le=0.1,
        description="Walk-away rate standard deviation",
    )
    random_seed: int | None = Field(
        default=None,
        description="Random seed for reproducibility (None for random)",
    )


class RemoveSkuParams(BaseSchema):
    """Parameters for remove SKU scenario."""

    sku_ids: list[UUID] = Field(
        ...,
        min_length=1,
        description="SKUs to remove",
    )


class AddSkuParams(BaseSchema):
    """Parameters for add new SKU scenario."""

    name: str = Field(..., description="New product name")
    brand: str = Field(..., description="Brand name")
    subcategory: str = Field(..., description="Subcategory")
    size: str = Field(..., description="Size")
    price: float = Field(..., gt=0, description="Price")
    cost: float = Field(..., gt=0, description="Cost")
    similar_to_sku: UUID | None = Field(
        None,
        description="Base demand estimates on this similar SKU",
    )
    initial_facings: int = Field(default=2, ge=1, le=10, description="Initial facings")


class ChangeFacingsParams(BaseSchema):
    """Parameters for change facings scenario."""

    sku_id: UUID = Field(..., description="SKU to change facings for")
    new_facings: int = Field(..., ge=0, le=20, description="New number of facings")


class ChangePriceParams(BaseSchema):
    """Parameters for change price scenario."""

    sku_id: UUID = Field(..., description="SKU to change price for")
    new_price: float | None = Field(None, gt=0, description="New price")
    price_change_pct: float | None = Field(
        None,
        ge=-50,
        le=100,
        description="Price change percentage",
    )

    @field_validator("price_change_pct")
    @classmethod
    def require_one_price_param(cls, v: float | None, info) -> float | None:
        """Require either new_price or price_change_pct."""
        new_price = info.data.get("new_price")
        if v is None and new_price is None:
            raise ValueError("Either new_price or price_change_pct must be provided")
        return v


class SimulationRequest(BaseSchema):
    """Request to run a simulation."""

    scenario_type: ScenarioType = Field(..., description="Type of scenario to simulate")
    parameters: dict[str, Any] = Field(..., description="Scenario-specific parameters")
    config: SimulationConfig = Field(
        default_factory=SimulationConfig,
        description="Simulation configuration",
    )
    store_id: UUID | None = Field(
        None,
        description="Store to simulate for (None = all stores)",
    )
    optimization_run_id: UUID | None = Field(
        None,
        description="Link to parent optimization run",
    )


class DistributionStats(BaseSchema):
    """Statistical summary of a distribution."""

    mean: float
    std: float
    min: float
    max: float
    median: float


class PercentileStats(BaseSchema):
    """Percentile statistics."""

    p5: float
    p10: float
    p25: float
    p50: float
    p75: float
    p90: float
    p95: float


class SimulationResult(BaseSchema):
    """Complete simulation result."""

    run_id: UUID
    scenario_type: ScenarioType
    scenario_description: str
    status: OptimizationStatus

    # Parameters used
    parameters: dict[str, Any]
    config: SimulationConfig

    # Baseline values
    baseline_revenue: float
    baseline_profit: float

    # Revenue impact
    revenue_stats: DistributionStats
    revenue_percentiles: PercentileStats
    revenue_change: float = Field(..., description="Mean revenue change from baseline")
    revenue_change_pct: float = Field(..., description="Percentage revenue change")

    # Profit impact
    profit_stats: DistributionStats
    profit_percentiles: PercentileStats
    profit_change: float = Field(..., description="Mean profit change from baseline")
    profit_change_pct: float = Field(..., description="Percentage profit change")

    # Probability metrics
    probability_positive: float = Field(
        ...,
        ge=0,
        le=1,
        description="Probability of positive profit impact",
    )
    probability_negative: float = Field(
        ...,
        ge=0,
        le=1,
        description="Probability of negative profit impact",
    )
    probability_breakeven: float = Field(
        ...,
        ge=0,
        le=1,
        description="Probability of break-even or better",
    )
    probability_exceed_target: float | None = Field(
        None,
        ge=0,
        le=1,
        description="Probability of exceeding target (if specified)",
    )

    # Confidence intervals
    profit_ci_90: tuple[float, float] = Field(
        ...,
        description="90% confidence interval for profit",
    )
    profit_ci_95: tuple[float, float] = Field(
        ...,
        description="95% confidence interval for profit",
    )
    revenue_ci_95: tuple[float, float] = Field(
        ...,
        description="95% confidence interval for revenue",
    )

    # Execution metadata
    trials_completed: int
    execution_time_ms: int
    created_at: datetime


class SimulationResponse(BaseSchema):
    """Response when starting a simulation."""

    run_id: UUID
    status: OptimizationStatus
    message: str


class SimulationSummary(BaseSchema):
    """Summary of a simulation run for listing."""

    run_id: UUID
    scenario_type: ScenarioType
    status: OptimizationStatus
    profit_mean: float | None
    probability_positive: float | None
    created_at: datetime
    execution_time_ms: int | None


class ScenarioComparison(BaseSchema):
    """Comparison between multiple scenarios."""

    scenarios: list[SimulationSummary]
    best_expected_value: UUID
    lowest_risk: UUID
    recommendation: str
