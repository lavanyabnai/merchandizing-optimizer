"""API v1 router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, clustering, data, demand, health, optimization, simulation

# Main API router for v1
api_router = APIRouter(prefix="/api/v1")

# Include endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(data.router, prefix="/data", tags=["Data"])
api_router.include_router(demand.router, prefix="/demand", tags=["Demand"])
api_router.include_router(optimization.router, prefix="/optimize", tags=["Optimization"])
api_router.include_router(simulation.router, prefix="/simulate", tags=["Simulation"])

api_router.include_router(clustering.router, prefix="/cluster", tags=["Clustering"])

# Future endpoint routers will be added here:
# api_router.include_router(products.router, prefix="/products", tags=["Products"])
# api_router.include_router(stores.router, prefix="/stores", tags=["Stores"])
