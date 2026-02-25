"""Simulation API endpoints for Monte Carlo what-if analysis."""

from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger
from app.db.database import get_db_session
from app.db.models import OptimizationStatus, ScenarioType
from app.schemas.simulation import (
    AddSkuParams,
    ChangeFacingsParams,
    ChangePriceParams,
    DistributionStats,
    PercentileStats,
    RemoveSkuParams,
    ScenarioComparison,
    SimulationConfig,
    SimulationRequest,
    SimulationResponse,
    SimulationResult,
    SimulationSummary,
)
from app.services.simulation import SimulationService

router = APIRouter()
logger = get_logger(__name__)


# =============================================================================
# In-memory storage for simulation results (would use Redis/DB in production)
# =============================================================================

_simulation_results: dict[UUID, SimulationResult] = {}
_simulation_status: dict[UUID, OptimizationStatus] = {}


def _store_result(result: SimulationResult) -> None:
    """Store simulation result in memory."""
    _simulation_results[result.run_id] = result
    _simulation_status[result.run_id] = result.status


def _get_result(run_id: UUID) -> SimulationResult | None:
    """Get simulation result from memory."""
    return _simulation_results.get(run_id)


# =============================================================================
# Endpoints
# =============================================================================


@router.post("/run", response_model=SimulationResult)
async def run_simulation(
    request: SimulationRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> SimulationResult:
    """Run a Monte Carlo simulation synchronously.

    This endpoint runs the simulation immediately and returns the full results.
    For scenarios with many trials (>10000), consider using the async endpoint.

    **Scenario Types:**
    - `remove_sku`: Simulate removing SKUs from assortment
    - `add_sku`: Simulate adding a new SKU
    - `change_facings`: Simulate changing shelf facings
    - `change_price`: Simulate price changes

    **Simulation Process:**
    1. Sample demand with uncertainty (normal distribution with CV)
    2. Apply scenario-specific logic (transfer, cannibalization, elasticity)
    3. Calculate revenue and profit for each trial
    4. Compute statistics and probabilities

    Returns:
        Complete simulation results with statistics and confidence intervals.
    """
    logger.info(
        "Running simulation",
        scenario_type=request.scenario_type,
        user_id=user.user_id,
    )

    try:
        sim_service = SimulationService(session, config=request.config)
        result = await sim_service.run_simulation(
            scenario_type=request.scenario_type,
            parameters=request.parameters,
            store_id=request.store_id,
        )
        _store_result(result)
        return result

    except ValueError as e:
        logger.warning("Simulation validation error", error=str(e))
        raise ValidationError(str(e))
    except Exception as e:
        logger.error("Simulation failed", error=str(e))
        raise ValidationError(f"Simulation failed: {str(e)}")


@router.post("/run/async", response_model=SimulationResponse)
async def run_simulation_async(
    request: SimulationRequest,
    background_tasks: BackgroundTasks,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> SimulationResponse:
    """Start an asynchronous simulation run.

    The simulation runs in the background. Use GET /simulate/{run_id}
    to poll for results.

    Returns:
        Run ID and initial status. Poll the status endpoint to check progress.
    """
    from uuid import uuid4

    run_id = uuid4()
    _simulation_status[run_id] = OptimizationStatus.PENDING

    logger.info(
        "Starting async simulation",
        run_id=str(run_id),
        scenario_type=request.scenario_type,
        user_id=user.user_id,
    )

    # Note: In production, use Celery or similar for proper background tasks
    # FastAPI BackgroundTasks run in the same process
    async def run_in_background():
        try:
            _simulation_status[run_id] = OptimizationStatus.RUNNING
            sim_service = SimulationService(session, config=request.config)
            result = await sim_service.run_simulation(
                scenario_type=request.scenario_type,
                parameters=request.parameters,
                store_id=request.store_id,
            )
            # Override the auto-generated run_id with our tracked one
            result_dict = result.model_dump()
            result_dict["run_id"] = run_id
            final_result = SimulationResult(**result_dict)
            _store_result(final_result)
        except Exception as e:
            logger.error("Async simulation failed", run_id=str(run_id), error=str(e))
            _simulation_status[run_id] = OptimizationStatus.FAILED

    background_tasks.add_task(run_in_background)

    return SimulationResponse(
        run_id=run_id,
        status=OptimizationStatus.PENDING,
        message="Simulation started. Poll GET /simulate/{run_id} for results.",
    )


@router.get("/{run_id}", response_model=SimulationResult | SimulationResponse)
async def get_simulation_result(
    run_id: UUID,
    user: CurrentUser,
) -> SimulationResult | SimulationResponse:
    """Get simulation results or status.

    If the simulation is complete, returns the full results.
    If still running or pending, returns the current status.

    Args:
        run_id: The simulation run ID.

    Returns:
        Full results if complete, or status if still running.
    """
    result = _get_result(run_id)
    if result is not None:
        return result

    status = _simulation_status.get(run_id)
    if status is None:
        raise NotFoundError("SimulationRun", str(run_id))

    return SimulationResponse(
        run_id=run_id,
        status=status,
        message=f"Simulation is {status.value}",
    )


@router.post("/remove-sku", response_model=SimulationResult)
async def simulate_remove_sku(
    params: RemoveSkuParams,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    store_id: UUID | None = Query(None, description="Store to simulate for"),
    num_trials: int = Query(5000, ge=100, le=50000, description="Number of trials"),
) -> SimulationResult:
    """Simulate removing SKUs from the assortment.

    When SKUs are removed:
    1. Demand is distributed to substitute products based on similarity
    2. A portion (walk_rate) of demand leaves the category entirely
    3. Monte Carlo simulation captures uncertainty in demand and walk rate

    Args:
        params: SKU IDs to remove.
        store_id: Optional store to simulate for.
        num_trials: Number of Monte Carlo trials.

    Returns:
        Simulation results with profit/revenue impact analysis.
    """
    config = SimulationConfig(num_trials=num_trials)
    sim_service = SimulationService(session, config=config)

    # Convert UUID list to string list
    sku_ids = [str(sku_id) for sku_id in params.sku_ids]

    result = await sim_service.simulate_remove_sku(
        sku_ids=sku_ids,
        store_id=store_id,
    )
    _store_result(result)
    return result


@router.post("/add-sku", response_model=SimulationResult)
async def simulate_add_sku(
    params: AddSkuParams,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    store_id: UUID | None = Query(None, description="Store to simulate for"),
    num_trials: int = Query(5000, ge=100, le=50000, description="Number of trials"),
    incremental_pct: float = Query(0.3, ge=0.0, le=1.0, description="Incremental demand %"),
) -> SimulationResult:
    """Simulate adding a new SKU to the assortment.

    When a new SKU is added:
    1. Demand is estimated based on similar existing products
    2. A portion is truly incremental (new category buyers)
    3. The rest cannibalizes from similar products
    4. Monte Carlo captures uncertainty in demand estimation

    Args:
        params: New product attributes.
        store_id: Optional store to simulate for.
        num_trials: Number of Monte Carlo trials.
        incremental_pct: Percentage of demand that is incremental (vs cannibalized).

    Returns:
        Simulation results with profit/revenue impact analysis.
    """
    config = SimulationConfig(num_trials=num_trials)
    sim_service = SimulationService(session, config=config)

    new_product = {
        "name": params.name,
        "brand": params.brand,
        "subcategory": params.subcategory,
        "size": params.size,
        "price": params.price,
        "cost": params.cost,
    }

    result = await sim_service.simulate_add_sku(
        new_product=new_product,
        incremental_pct=incremental_pct,
        store_id=store_id,
    )
    _store_result(result)
    return result


@router.post("/change-facings", response_model=SimulationResult)
async def simulate_change_facings(
    params: ChangeFacingsParams,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    store_id: UUID | None = Query(None, description="Store to simulate for"),
    num_trials: int = Query(5000, ge=100, le=50000, description="Number of trials"),
    current_facings: int | None = Query(None, ge=1, le=20, description="Current facings"),
) -> SimulationResult:
    """Simulate changing shelf facings for a SKU.

    Space elasticity formula:
    new_demand = base_demand × (new_facings / current_facings)^elasticity

    Typical space elasticity is 0.10-0.25:
    - Doubling facings with 0.15 elasticity increases demand by ~11%

    Args:
        params: SKU and new facings count.
        store_id: Optional store to simulate for.
        num_trials: Number of Monte Carlo trials.
        current_facings: Override current facings (auto-detected if not provided).

    Returns:
        Simulation results with profit/revenue impact analysis.
    """
    config = SimulationConfig(num_trials=num_trials)
    sim_service = SimulationService(session, config=config)

    result = await sim_service.simulate_change_facings(
        sku=str(params.sku_id),
        new_facings=params.new_facings,
        current_facings=current_facings,
        store_id=store_id,
    )
    _store_result(result)
    return result


@router.post("/change-price", response_model=SimulationResult)
async def simulate_change_price(
    params: ChangePriceParams,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    store_id: UUID | None = Query(None, description="Store to simulate for"),
    num_trials: int = Query(5000, ge=100, le=50000, description="Number of trials"),
) -> SimulationResult:
    """Simulate changing price for a SKU.

    Price elasticity formula:
    demand_change = 1 + elasticity × price_change_pct
    new_demand = base_demand × demand_change

    Typical price elasticity is -1.5 to -2.5:
    - A 10% price increase with -1.8 elasticity reduces demand by 18%

    Args:
        params: SKU and new price.
        store_id: Optional store to simulate for.
        num_trials: Number of Monte Carlo trials.

    Returns:
        Simulation results with profit/revenue impact analysis.
    """
    config = SimulationConfig(num_trials=num_trials)
    sim_service = SimulationService(session, config=config)

    # Determine new price
    new_price = params.new_price
    if new_price is None and params.price_change_pct is not None:
        # Would need to look up current price - for now require new_price
        raise ValidationError("new_price is required (price_change_pct not yet supported)")

    result = await sim_service.simulate_change_price(
        sku=str(params.sku_id),
        new_price=new_price,
        store_id=store_id,
    )
    _store_result(result)
    return result


@router.post("/batch", response_model=list[SimulationResult])
async def run_batch_simulations(
    scenarios: list[SimulationRequest],
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> list[SimulationResult]:
    """Run multiple simulations in parallel.

    Useful for comparing different scenarios side-by-side.

    Args:
        scenarios: List of simulation requests (max 10).

    Returns:
        List of simulation results in the same order as requests.
    """
    if len(scenarios) > 10:
        raise ValidationError("Maximum 10 scenarios per batch")

    results = []
    for request in scenarios:
        try:
            sim_service = SimulationService(session, config=request.config)
            result = await sim_service.run_simulation(
                scenario_type=request.scenario_type,
                parameters=request.parameters,
                store_id=request.store_id,
            )
            _store_result(result)
            results.append(result)
        except Exception as e:
            logger.error("Batch simulation failed for scenario", error=str(e))
            # Continue with other scenarios
            continue

    return results


@router.get("/compare/{run_id_1}/{run_id_2}", response_model=ScenarioComparison)
async def compare_simulations(
    run_id_1: UUID,
    run_id_2: UUID,
    user: CurrentUser,
) -> ScenarioComparison:
    """Compare two simulation runs.

    Analyzes the difference between two scenarios to help decision-making.

    Args:
        run_id_1: First simulation run ID.
        run_id_2: Second simulation run ID.

    Returns:
        Comparison analysis with recommendation.
    """
    result_1 = _get_result(run_id_1)
    result_2 = _get_result(run_id_2)

    if result_1 is None:
        raise NotFoundError("SimulationRun", str(run_id_1))
    if result_2 is None:
        raise NotFoundError("SimulationRun", str(run_id_2))

    # Create summaries
    summary_1 = SimulationSummary(
        run_id=result_1.run_id,
        scenario_type=result_1.scenario_type,
        status=result_1.status,
        profit_mean=result_1.profit_stats.mean,
        probability_positive=result_1.probability_positive,
        created_at=result_1.created_at,
        execution_time_ms=result_1.execution_time_ms,
    )

    summary_2 = SimulationSummary(
        run_id=result_2.run_id,
        scenario_type=result_2.scenario_type,
        status=result_2.status,
        profit_mean=result_2.profit_stats.mean,
        probability_positive=result_2.probability_positive,
        created_at=result_2.created_at,
        execution_time_ms=result_2.execution_time_ms,
    )

    # Determine best options
    best_expected = run_id_1 if result_1.profit_change > result_2.profit_change else run_id_2
    lowest_risk = run_id_1 if result_1.probability_negative < result_2.probability_negative else run_id_2

    # Generate recommendation
    if result_1.profit_change > result_2.profit_change and result_1.probability_positive > result_2.probability_positive:
        recommendation = f"Scenario 1 ({result_1.scenario_description}) is recommended - higher expected profit and better odds"
    elif result_2.profit_change > result_1.profit_change and result_2.probability_positive > result_1.probability_positive:
        recommendation = f"Scenario 2 ({result_2.scenario_description}) is recommended - higher expected profit and better odds"
    elif result_1.probability_positive > 0.6 and result_1.profit_change > 0:
        recommendation = f"Scenario 1 ({result_1.scenario_description}) offers good risk/reward balance"
    elif result_2.probability_positive > 0.6 and result_2.profit_change > 0:
        recommendation = f"Scenario 2 ({result_2.scenario_description}) offers good risk/reward balance"
    else:
        recommendation = "Both scenarios have significant risk - consider alternative approaches"

    return ScenarioComparison(
        scenarios=[summary_1, summary_2],
        best_expected_value=best_expected,
        lowest_risk=lowest_risk,
        recommendation=recommendation,
    )


@router.get("/history", response_model=list[SimulationSummary])
async def get_simulation_history(
    user: CurrentUser,
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
    scenario_type: ScenarioType | None = Query(None, description="Filter by scenario type"),
) -> list[SimulationSummary]:
    """Get simulation run history.

    Returns a list of past simulation runs, sorted by date descending.

    Args:
        limit: Maximum number of results to return.
        scenario_type: Optional filter by scenario type.

    Returns:
        List of simulation summaries.
    """
    summaries = []
    for result in sorted(
        _simulation_results.values(),
        key=lambda r: r.created_at,
        reverse=True,
    ):
        if scenario_type and result.scenario_type != scenario_type:
            continue

        summaries.append(
            SimulationSummary(
                run_id=result.run_id,
                scenario_type=result.scenario_type,
                status=result.status,
                profit_mean=result.profit_stats.mean,
                probability_positive=result.probability_positive,
                created_at=result.created_at,
                execution_time_ms=result.execution_time_ms,
            )
        )

        if len(summaries) >= limit:
            break

    return summaries


@router.delete("/{run_id}")
async def delete_simulation(
    run_id: UUID,
    user: CurrentUser,
) -> dict[str, Any]:
    """Delete a simulation run from history.

    Args:
        run_id: The simulation run ID to delete.

    Returns:
        Confirmation message.
    """
    if run_id not in _simulation_results and run_id not in _simulation_status:
        raise NotFoundError("SimulationRun", str(run_id))

    _simulation_results.pop(run_id, None)
    _simulation_status.pop(run_id, None)

    return {"message": f"Simulation {run_id} deleted", "deleted": True}


@router.get("/config/defaults", response_model=SimulationConfig)
async def get_default_config(
    user: CurrentUser,
) -> SimulationConfig:
    """Get default simulation configuration.

    Returns the default parameters used for Monte Carlo simulation:
    - Number of trials
    - Demand coefficient of variation
    - Price elasticity parameters
    - Walk-away rate parameters

    These can be overridden in individual simulation requests.
    """
    return SimulationConfig()
