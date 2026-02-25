"""API endpoints for Store Clustering operations."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db_session
from app.db.models import ClusteringRun, OptimizationStatus
from app.schemas.clustering import (
    ClusteringMethod,
    ClusteringRequest,
    ClusteringResponse,
    ClusteringResult,
    ClusteringSummary,
    ClusterProfile,
    ClusterRecommendation,
    OptimalKResult,
    VisualizationData,
)
from app.services.clustering import ClusteringService

router = APIRouter()


@router.post(
    "/run",
    response_model=ClusteringResult,
    status_code=status.HTTP_200_OK,
    summary="Run store clustering",
    description="Run clustering algorithm on stores based on sales patterns and demographics.",
)
async def run_clustering(
    request: ClusteringRequest = ClusteringRequest(),
    session: AsyncSession = Depends(get_db_session),
) -> ClusteringResult:
    """Run store clustering synchronously.

    This endpoint runs the clustering algorithm and returns the complete result.
    For large datasets, consider using the async endpoint.
    """
    try:
        service = ClusteringService(session=session, request=request)
        result = await service.cluster_stores()
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Clustering failed: {str(e)}",
        )


@router.post(
    "/run/async",
    response_model=ClusteringResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Run clustering asynchronously",
    description="Start clustering as a background task and return immediately.",
)
async def run_clustering_async(
    background_tasks: BackgroundTasks,
    request: ClusteringRequest = ClusteringRequest(),
    session: AsyncSession = Depends(get_db_session),
) -> ClusteringResponse:
    """Start clustering as a background task.

    Returns immediately with a run_id that can be used to check status.
    """
    import uuid

    run_id = uuid.uuid4()

    # Create pending run record
    run = ClusteringRun(
        id=run_id,
        method=request.method.value,
        n_clusters=request.n_clusters or 0,
        features_used=request.features,
        status=OptimizationStatus.PENDING,
    )
    session.add(run)
    await session.commit()

    # Note: In production, use a task queue like Celery
    # For now, return the pending status

    return ClusteringResponse(
        run_id=run_id,
        status=OptimizationStatus.PENDING,
        message="Clustering job queued. Use GET /cluster/{run_id} to check status.",
    )


@router.get(
    "/{run_id}",
    response_model=ClusteringResult,
    summary="Get clustering results",
    description="Get the results of a completed clustering run.",
)
async def get_clustering_result(
    run_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> ClusteringResult:
    """Get clustering results by run ID."""
    result = await session.execute(
        select(ClusteringRun).where(ClusteringRun.id == run_id)
    )
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clustering run {run_id} not found",
        )

    if run.status != OptimizationStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Clustering run status is {run.status.value}, not completed",
        )

    # Reconstruct result from stored data
    from app.schemas.clustering import PCACoordinate, StoreClusterAssignment

    # Convert stored assignments
    store_assignments = [
        StoreClusterAssignment(
            store_id=UUID(store_id),
            store_code=f"STORE-{i:03d}",
            store_name=f"Store {store_id[:8]}",
            cluster_id=cluster_id,
            cluster_name=f"Cluster {cluster_id}",
        )
        for i, (store_id, cluster_id) in enumerate(
            (run.cluster_assignments or {}).items()
        )
    ]

    # Convert stored profiles
    cluster_profiles = [
        ClusterProfile(
            cluster_id=p["cluster_id"],
            cluster_name=p.get("cluster_name", f"Cluster {p['cluster_id']}"),
            store_count=p.get("store_count", 0),
            avg_revenue=p.get("avg_revenue", 0.0),
            total_revenue=p.get("total_revenue", 0.0),
            revenue_share_pct=p.get("revenue_share_pct", 0.0),
            avg_traffic=p.get("avg_traffic", 0.0),
            total_traffic=p.get("total_traffic", 0),
            premium_share=p.get("premium_share", 0.0),
            national_a_share=p.get("national_a_share", 0.0),
            national_b_share=p.get("national_b_share", 0.0),
            store_brand_share=p.get("store_brand_share", 0.0),
            avg_basket=p.get("avg_basket", 0.0),
            dominant_format=p.get("dominant_format", "Standard"),
            dominant_location=p.get("dominant_location", "Suburban"),
            dominant_income=p.get("dominant_income", "Medium"),
            is_premium_focused=p.get("is_premium_focused", False),
            is_value_focused=p.get("is_value_focused", False),
            recommendations=p.get("recommendations", []),
        )
        for p in (run.cluster_profiles or [])
    ]

    # Convert PCA coordinates
    pca_coordinates = [
        PCACoordinate(
            store_id=UUID(p["store_id"]),
            store_code=p["store_code"],
            cluster_id=p["cluster_id"],
            pc1=p["pc1"],
            pc2=p["pc2"],
            revenue=p.get("revenue", 0.0),
        )
        for p in (run.pca_coordinates or [])
    ]

    return ClusteringResult(
        run_id=run.id,
        method=ClusteringMethod(run.method),
        n_clusters=run.n_clusters,
        silhouette_score=float(run.silhouette_score) if run.silhouette_score else 0.0,
        inertia=None,
        store_assignments=store_assignments,
        cluster_profiles=cluster_profiles,
        pca_coordinates=pca_coordinates,
        features_used=run.features_used or [],
        status=run.status,
        execution_time_ms=run.execution_time_ms or 0,
        created_at=run.created_at,
    )


@router.get(
    "/{run_id}/profiles",
    response_model=list[ClusterProfile],
    summary="Get cluster profiles",
    description="Get profile summaries for each cluster.",
)
async def get_cluster_profiles(
    run_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[ClusterProfile]:
    """Get cluster profiles for a completed run."""
    result = await session.execute(
        select(ClusteringRun).where(ClusteringRun.id == run_id)
    )
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clustering run {run_id} not found",
        )

    if not run.cluster_profiles:
        return []

    return [
        ClusterProfile(
            cluster_id=p["cluster_id"],
            cluster_name=p.get("cluster_name", f"Cluster {p['cluster_id']}"),
            store_count=p.get("store_count", 0),
            avg_revenue=p.get("avg_revenue", 0.0),
            total_revenue=p.get("total_revenue", 0.0),
            revenue_share_pct=p.get("revenue_share_pct", 0.0),
            avg_traffic=p.get("avg_traffic", 0.0),
            total_traffic=p.get("total_traffic", 0),
            premium_share=p.get("premium_share", 0.0),
            national_a_share=p.get("national_a_share", 0.0),
            national_b_share=p.get("national_b_share", 0.0),
            store_brand_share=p.get("store_brand_share", 0.0),
            avg_basket=p.get("avg_basket", 0.0),
            dominant_format=p.get("dominant_format", "Standard"),
            dominant_location=p.get("dominant_location", "Suburban"),
            dominant_income=p.get("dominant_income", "Medium"),
            is_premium_focused=p.get("is_premium_focused", False),
            is_value_focused=p.get("is_value_focused", False),
            recommendations=p.get("recommendations", []),
        )
        for p in run.cluster_profiles
    ]


@router.get(
    "/{run_id}/recommendations",
    response_model=list[ClusterRecommendation],
    summary="Get cluster recommendations",
    description="Get assortment recommendations for each cluster.",
)
async def get_cluster_recommendations(
    run_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> list[ClusterRecommendation]:
    """Get detailed recommendations for each cluster."""
    result = await session.execute(
        select(ClusteringRun).where(ClusteringRun.id == run_id)
    )
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clustering run {run_id} not found",
        )

    if not run.cluster_profiles:
        return []

    # Generate recommendations for each profile
    service = ClusteringService(session=session)
    recommendations = []

    for p in run.cluster_profiles:
        profile = ClusterProfile(
            cluster_id=p["cluster_id"],
            cluster_name=p.get("cluster_name", f"Cluster {p['cluster_id']}"),
            store_count=p.get("store_count", 0),
            avg_revenue=p.get("avg_revenue", 0.0),
            total_revenue=p.get("total_revenue", 0.0),
            revenue_share_pct=p.get("revenue_share_pct", 0.0),
            avg_traffic=p.get("avg_traffic", 0.0),
            total_traffic=p.get("total_traffic", 0),
            premium_share=p.get("premium_share", 0.0),
            national_a_share=p.get("national_a_share", 0.0),
            national_b_share=p.get("national_b_share", 0.0),
            store_brand_share=p.get("store_brand_share", 0.0),
            avg_basket=p.get("avg_basket", 0.0),
            dominant_format=p.get("dominant_format", "Standard"),
            dominant_location=p.get("dominant_location", "Suburban"),
            dominant_income=p.get("dominant_income", "Medium"),
            is_premium_focused=p.get("is_premium_focused", False),
            is_value_focused=p.get("is_value_focused", False),
            recommendations=p.get("recommendations", []),
        )
        recommendations.append(service.get_recommendations_for_cluster(profile))

    return recommendations


@router.get(
    "/{run_id}/visualization",
    response_model=VisualizationData,
    summary="Get visualization data",
    description="Get PCA coordinates and cluster centers for visualization.",
)
async def get_visualization_data(
    run_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> VisualizationData:
    """Get data for cluster visualization."""
    try:
        service = ClusteringService(session=session)
        return await service.get_visualization_data(run_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/optimal-k",
    response_model=OptimalKResult,
    summary="Find optimal number of clusters",
    description="Analyze silhouette scores to find the optimal number of clusters.",
)
async def find_optimal_k(
    max_k: int = 10,
    session: AsyncSession = Depends(get_db_session),
) -> OptimalKResult:
    """Find the optimal number of clusters for the current data."""
    try:
        service = ClusteringService(session=session)
        return await service.find_optimal_k(max_k=max_k)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/history",
    response_model=list[ClusteringSummary],
    summary="Get clustering history",
    description="Get a list of past clustering runs.",
)
async def get_clustering_history(
    limit: int = 20,
    offset: int = 0,
    session: AsyncSession = Depends(get_db_session),
) -> list[ClusteringSummary]:
    """Get history of clustering runs."""
    result = await session.execute(
        select(ClusteringRun)
        .order_by(ClusteringRun.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    runs = result.scalars().all()

    return [
        ClusteringSummary(
            run_id=run.id,
            method=ClusteringMethod(run.method),
            n_clusters=run.n_clusters,
            silhouette_score=float(run.silhouette_score) if run.silhouette_score else None,
            status=run.status,
            created_at=run.created_at,
        )
        for run in runs
    ]


@router.delete(
    "/{run_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete clustering run",
    description="Delete a clustering run and its results.",
)
async def delete_clustering_run(
    run_id: UUID,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete a clustering run."""
    result = await session.execute(
        select(ClusteringRun).where(ClusteringRun.id == run_id)
    )
    run = result.scalar_one_or_none()

    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clustering run {run_id} not found",
        )

    await session.delete(run)
    await session.commit()
