"""Optimization endpoints for assortment optimization."""

from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from pydantic import Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import CurrentUser
from app.core.exceptions import NotFoundError, ValidationError
from app.core.logging import get_logger
from app.db.database import get_db_session
from app.db.models import OptimizationStatus
from app.schemas.common import BaseSchema, PaginatedResponse
from app.schemas.optimization import (
    ConstraintSatisfaction,
    OptimizationConstraints,
    OptimizationRequest,
    OptimizationResponse,
    OptimizationResult,
    OptimizationSummary,
    ProductAllocation,
    SpaceAllocation,
)
from app.services.optimizer import AssortmentOptimizerService

logger = get_logger(__name__)
router = APIRouter()


# =============================================================================
# Request/Response Schemas
# =============================================================================


class OptimizationRunResponse(BaseSchema):
    """Response when starting an optimization run."""

    run_id: UUID
    status: OptimizationStatus
    message: str


class OptimizationStatusResponse(BaseSchema):
    """Response for optimization status check."""

    run_id: UUID
    status: OptimizationStatus
    progress_pct: int | None = None
    error_message: str | None = None
    estimated_completion: datetime | None = None


class CompareRequest(BaseSchema):
    """Request to compare two optimization runs."""

    run_id_1: UUID = Field(..., description="First optimization run ID")
    run_id_2: UUID = Field(..., description="Second optimization run ID")


class CompareResponse(BaseSchema):
    """Response for optimization comparison."""

    run_id_1: UUID
    run_id_2: UUID
    profit_lift_pct_1: float
    profit_lift_pct_2: float
    profit_lift_diff: float
    products_diff: list[dict]
    total_products_changed: int


# =============================================================================
# Background Task Functions
# =============================================================================


async def run_optimization_background(
    run_id: UUID,
    store_id: UUID | None,
    constraints: OptimizationConstraints,
    user_id: str | None,
    subcategories: list[str] | None,
):
    """Background task to run optimization.

    This function runs in a background thread and updates the database
    with progress and results.
    """
    from app.db.database import async_session_factory

    async with async_session_factory() as session:
        try:
            optimizer = AssortmentOptimizerService(session)

            # The optimize method handles its own status updates
            await optimizer.optimize(
                store_id=store_id,
                constraints=constraints,
                user_id=user_id,
                subcategories=subcategories,
            )

        except Exception as e:
            logger.error("Background optimization failed", run_id=str(run_id), error=str(e))
            # The optimizer service handles error status updates


# =============================================================================
# Endpoints
# =============================================================================


@router.post("/run", response_model=OptimizationResult)
async def run_optimization(
    request: OptimizationRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> OptimizationResult:
    """Run assortment optimization synchronously.

    This endpoint runs the optimization immediately and returns the full results.
    For large datasets, consider using POST /run/async for background processing.

    The optimization algorithm:
    1. Adds must-carry items first
    2. Ensures subcategory coverage (min SKUs per subcategory)
    3. Ensures price tier coverage (min SKUs per price tier)
    4. Fills remaining space with highest-profit SKUs
    5. Allocates extra facings to top performers
    6. Calculates profit lift with space elasticity effects

    Returns:
        Complete optimization results including product allocations,
        space allocations, and constraint satisfaction.
    """
    logger.info(
        "Starting optimization",
        user_id=user.user_id,
        store_id=str(request.store_id) if request.store_id else None,
    )

    optimizer = AssortmentOptimizerService(session)

    try:
        result = await optimizer.optimize(
            store_id=request.store_id,
            constraints=request.constraints,
            user_id=user.user_id,
            subcategories=request.include_subcategories,
        )

        return result

    except ValueError as e:
        raise ValidationError(str(e))


@router.post("/run/async", response_model=OptimizationRunResponse)
async def run_optimization_async(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> OptimizationRunResponse:
    """Start an asynchronous optimization run.

    The optimization runs in the background. Use GET /optimize/{run_id}
    to poll for results.

    Returns:
        Run ID and initial status. Poll the status endpoint to check progress.
    """
    from uuid import uuid4

    from app.db.repository import OptimizationRunRepository

    run_id = uuid4()

    logger.info(
        "Starting async optimization",
        run_id=str(run_id),
        user_id=user.user_id,
        store_id=str(request.store_id) if request.store_id else None,
    )

    # Create initial run record
    repo = OptimizationRunRepository(session)
    await repo.create({
        "id": run_id,
        "store_id": request.store_id,
        "status": OptimizationStatus.PENDING,
        "constraints": request.constraints.model_dump(),
        "user_id": user.user_id,
    })
    await session.commit()

    # Schedule background task
    background_tasks.add_task(
        run_optimization_background,
        run_id=run_id,
        store_id=request.store_id,
        constraints=request.constraints,
        user_id=user.user_id,
        subcategories=request.include_subcategories,
    )

    return OptimizationRunResponse(
        run_id=run_id,
        status=OptimizationStatus.PENDING,
        message="Optimization started. Poll GET /optimize/{run_id} for results.",
    )


@router.get("/{run_id}", response_model=OptimizationResult | OptimizationStatusResponse)
async def get_optimization_result(
    run_id: UUID,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> OptimizationResult | OptimizationStatusResponse:
    """Get optimization results or status.

    If the optimization is complete, returns the full results.
    If still running or pending, returns the current status.

    Args:
        run_id: The optimization run ID.

    Returns:
        Full results if completed, or status if still running.
    """
    optimizer = AssortmentOptimizerService(session)
    run = await optimizer.get_optimization_run(run_id)

    if not run:
        raise NotFoundError("OptimizationRun", str(run_id))

    # If not completed, return status
    if run.status in [OptimizationStatus.PENDING, OptimizationStatus.RUNNING]:
        return OptimizationStatusResponse(
            run_id=run_id,
            status=run.status,
            progress_pct=None,  # Could be enhanced with progress tracking
            error_message=None,
        )

    # If failed, return status with error
    if run.status == OptimizationStatus.FAILED:
        return OptimizationStatusResponse(
            run_id=run_id,
            status=run.status,
            progress_pct=100,
            error_message=run.error_message,
        )

    # Build full result from stored data
    results = run.results or {}
    product_allocations = [
        ProductAllocation(**a) for a in results.get("product_allocations", [])
    ]
    space_allocations = [
        SpaceAllocation(**s) for s in results.get("space_allocations", [])
    ]

    # Count changes
    products_added = sum(
        1 for a in product_allocations
        if a.current_facings == 0 and a.optimized_facings > 0
    )
    products_removed = sum(
        1 for a in product_allocations
        if a.current_facings > 0 and a.optimized_facings == 0
    )
    products_unchanged = sum(
        1 for a in product_allocations
        if a.current_facings == a.optimized_facings
    )

    return OptimizationResult(
        run_id=run_id,
        store_id=run.store_id,
        status=run.status,
        current_profit=0.0,  # Not stored separately
        optimized_profit=0.0,
        profit_lift_absolute=float(run.profit_lift_absolute or 0),
        profit_lift_pct=float(run.profit_lift_pct or 0),
        product_allocations=product_allocations,
        space_allocations=space_allocations,
        constraint_satisfaction=[],  # Could be stored and retrieved
        products_added=products_added,
        products_removed=products_removed,
        products_unchanged=products_unchanged,
        execution_time_ms=run.execution_time_ms or 0,
        run_date=run.run_date,
    )


@router.get("/history", response_model=list[OptimizationSummary])
async def get_optimization_history(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
    store_id: UUID | None = Query(None, description="Filter by store"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results"),
) -> list[OptimizationSummary]:
    """Get optimization run history.

    Returns a list of past optimization runs, sorted by date descending.

    Args:
        store_id: Optional filter by store.
        limit: Maximum number of results.

    Returns:
        List of optimization run summaries.
    """
    optimizer = AssortmentOptimizerService(session)
    runs = await optimizer.get_optimization_history(
        store_id=store_id,
        user_id=user.user_id,
        limit=limit,
    )

    summaries = []
    for run in runs:
        # Get store name if available
        store_name = None
        if run.store:
            store_name = run.store.name

        summaries.append(
            OptimizationSummary(
                run_id=run.id,
                store_id=run.store_id,
                store_name=store_name,
                status=run.status,
                profit_lift_pct=float(run.profit_lift_pct) if run.profit_lift_pct else None,
                run_date=run.run_date,
                execution_time_ms=run.execution_time_ms,
            )
        )

    return summaries


@router.post("/compare", response_model=CompareResponse)
async def compare_optimization_runs(
    request: CompareRequest,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> CompareResponse:
    """Compare two optimization runs.

    Shows the difference in profit lift and product allocations
    between two optimization runs.

    Args:
        request: The two run IDs to compare.

    Returns:
        Comparison results including profit lift difference and changed products.
    """
    optimizer = AssortmentOptimizerService(session)

    try:
        comparison = await optimizer.compare_runs(
            run_id_1=request.run_id_1,
            run_id_2=request.run_id_2,
        )

        return CompareResponse(**comparison)

    except ValueError as e:
        raise NotFoundError("OptimizationRun", str(e))


@router.delete("/{run_id}")
async def delete_optimization_run(
    run_id: UUID,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Delete an optimization run.

    Removes the optimization run and all associated results from the database.

    Args:
        run_id: The optimization run ID to delete.

    Returns:
        Confirmation message.
    """
    optimizer = AssortmentOptimizerService(session)

    # Check if run exists
    run = await optimizer.get_optimization_run(run_id)
    if not run:
        raise NotFoundError("OptimizationRun", str(run_id))

    deleted = await optimizer.delete_optimization_run(run_id)

    if deleted:
        return {"message": f"Optimization run {run_id} deleted successfully"}
    else:
        raise NotFoundError("OptimizationRun", str(run_id))


@router.get("/constraints/defaults")
async def get_default_constraints(
    user: CurrentUser,
) -> OptimizationConstraints:
    """Get default optimization constraints.

    Returns the default constraint values used when none are specified.
    """
    return OptimizationConstraints()


@router.post("/validate-constraints")
async def validate_constraints(
    constraints: OptimizationConstraints,
    user: CurrentUser,
    session: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """Validate optimization constraints.

    Checks if the provided constraints are valid and feasible
    given the current data in the database.

    Args:
        constraints: The constraints to validate.

    Returns:
        Validation results with any warnings or errors.
    """
    from app.db.repository import ProductRepository

    repo = ProductRepository(session)
    total_products = await repo.count()
    subcategories = await repo.get_subcategories()
    brands = await repo.get_brands()

    issues = []
    warnings = []

    # Check if there are enough products
    if total_products == 0:
        issues.append("No products in database. Please seed data first.")

    # Check subcategory coverage feasibility
    min_products_needed = len(subcategories) * constraints.min_skus_per_subcategory
    if min_products_needed > total_products:
        warnings.append(
            f"Subcategory coverage requires {min_products_needed} SKUs "
            f"but only {total_products} available"
        )

    # Check if total facings can accommodate minimum requirements
    min_facings_needed = min_products_needed * constraints.min_facings_per_sku
    if min_facings_needed > constraints.total_facings:
        issues.append(
            f"Minimum facings needed ({min_facings_needed}) exceeds "
            f"total facings ({constraints.total_facings})"
        )

    # Check must-carry items exist
    if constraints.must_carry:
        products = await repo.get_by_skus(constraints.must_carry)
        found_skus = {p.sku for p in products}
        missing = [sku for sku in constraints.must_carry if sku not in found_skus]
        if missing:
            issues.append(f"Must-carry SKUs not found: {missing}")

    # Check exclude items exist
    if constraints.exclude:
        products = await repo.get_by_skus(constraints.exclude)
        found_skus = {p.sku for p in products}
        missing = [sku for sku in constraints.exclude if sku not in found_skus]
        if missing:
            warnings.append(f"Excluded SKUs not found (will be ignored): {missing}")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings,
        "summary": {
            "total_products": total_products,
            "subcategories": len(subcategories),
            "brands": len(brands),
            "total_facings_available": constraints.total_facings,
        },
    }
