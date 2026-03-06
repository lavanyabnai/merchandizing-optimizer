# Assortment Optimizer Microservice Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to convert the Streamlit-based Assortment Optimizer MVP into a microservice integrated with the parent Merchandizing Optimizer application.

---

## Architecture Decision: Full-Stack Microservice Approach

### Recommendation: **Keep the entire assortment app as a separate microservice**

#### Rationale:

| Factor | Frontend-Only Integration | Full Microservice (Recommended) |
|--------|---------------------------|--------------------------------|
| **Deployment** | Mixed dependencies (Python + Node) | Clean separation, independent scaling |
| **Development** | Tightly coupled, complex builds | Independent teams/releases |
| **Technology** | Forced tech alignment | Best tool for each domain |
| **Testing** | Integration complexity | Isolated testing, clearer boundaries |
| **Scalability** | Shared resources | Independent horizontal scaling |
| **Maintenance** | Version conflicts | Clean upgrades, separate concerns |

#### Architecture Diagram:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MERCHANDIZING OPTIMIZER (Next.js)                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  /risk/assortment-optimizer (Next.js Route)                 │   │
│  │  ┌───────────────────────────────────────────────────────┐  │   │
│  │  │  React Frontend (Recharts/AG-Grid)                    │  │   │
│  │  │  - Dashboard Component                                │  │   │
│  │  │  - CDT Analysis Component                             │  │   │
│  │  │  - Optimizer Component                                │  │   │
│  │  │  - Simulation Component                               │  │   │
│  │  │  - Clustering Component                               │  │   │
│  │  │  - Planogram Component                                │  │   │
│  │  └───────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  API Gateway (/api/assortment/*)                            │   │
│  │  - Authentication                                           │   │
│  │  - Request routing                                          │   │
│  │  - Response formatting                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────┐
│              ASSORTMENT OPTIMIZER MICROSERVICE (Python/FastAPI)     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  FastAPI Application                                        │   │
│  │  ├── /api/v1/products      - Product data endpoints        │   │
│  │  ├── /api/v1/stores        - Store data endpoints          │   │
│  │  ├── /api/v1/sales         - Sales data endpoints          │   │
│  │  ├── /api/v1/optimize      - Optimization endpoints        │   │
│  │  ├── /api/v1/simulate      - Simulation endpoints          │   │
│  │  ├── /api/v1/cluster       - Clustering endpoints          │   │
│  │  ├── /api/v1/cdt           - CDT analysis endpoints        │   │
│  │  └── /api/v1/metrics       - KPI/metrics endpoints         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Core Business Logic                                        │   │
│  │  ├── models/optimizer.py   - Greedy optimization engine    │   │
│  │  ├── models/demand.py      - MNL demand model              │   │
│  │  ├── models/simulation.py  - Monte Carlo simulation        │   │
│  │  └── models/clustering.py  - K-Means/GMM clustering        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Data Layer                                                 │   │
│  │  ├── PostgreSQL (shared with parent or separate)           │   │
│  │  └── Redis (caching for expensive computations)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Session Breakdown

### Phase 1: Foundation & Infrastructure (Sessions 1-3)

### Phase 2: Core Backend Development (Sessions 4-8)

### Phase 3: Frontend Development (Sessions 9-14)

### Phase 4: Integration & Testing (Sessions 15-18)

### Phase 5: Optimization & Production (Sessions 19-20)

---

## Detailed Session Plan

---

### SESSION 1: Project Setup & Infrastructure
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Set up Python microservice project structure
- Configure FastAPI application skeleton
- Set up development environment with Docker
- Configure CI/CD pipeline basics

#### Tasks:
1. Create microservice directory structure:
   ```
   assortment-optimizer-service/
   ├── app/
   │   ├── __init__.py
   │   ├── main.py              # FastAPI app entry
   │   ├── config.py            # Configuration management
   │   ├── dependencies.py      # Dependency injection
   │   ├── api/
   │   │   ├── __init__.py
   │   │   ├── v1/
   │   │   │   ├── __init__.py
   │   │   │   └── router.py    # API version router
   │   ├── core/
   │   │   ├── __init__.py
   │   │   ├── security.py      # Auth utilities
   │   │   └── logging.py       # Logging configuration
   │   ├── models/              # Pydantic models
   │   ├── schemas/             # Request/Response schemas
   │   ├── services/            # Business logic (migrated)
   │   └── db/                  # Database layer
   ├── tests/
   │   ├── unit/
   │   ├── integration/
   │   └── conftest.py
   ├── Dockerfile
   ├── docker-compose.yml
   ├── pyproject.toml
   ├── requirements.txt
   └── README.md
   ```

2. Configure FastAPI with:
   - CORS middleware
   - Request validation
   - Error handling
   - OpenAPI documentation
   - Health check endpoint

3. Set up Docker:
   - Multi-stage build for optimization
   - Docker Compose for local development
   - Environment variable management

4. Configure development tools:
   - pytest for testing
   - black/ruff for formatting
   - mypy for type checking
   - pre-commit hooks

#### Deliverables:
- [ ] Working FastAPI skeleton with health endpoint
- [ ] Docker setup for local development
- [ ] Basic CI/CD configuration
- [ ] Development environment documentation

#### Testing:
- Health endpoint returns 200 OK
- Docker container builds successfully
- All dev tools configured and running

---

### SESSION 2: Database Schema & Data Models
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Design database schema for assortment data
- Create SQLAlchemy/Drizzle models
- Set up database migrations
- Implement data validation schemas

#### Tasks:
1. Design PostgreSQL schema:
   ```sql
   -- Core entities
   CREATE TABLE assortment_products (
     id UUID PRIMARY KEY,
     sku VARCHAR(50) UNIQUE NOT NULL,
     name VARCHAR(255) NOT NULL,
     brand VARCHAR(100),
     brand_tier VARCHAR(50),  -- Premium, National A/B, Store Brand
     subcategory VARCHAR(100),
     size VARCHAR(50),
     pack_type VARCHAR(50),
     price DECIMAL(10,2),
     cost DECIMAL(10,2),
     width_inches DECIMAL(5,2),
     space_elasticity DECIMAL(5,4),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE assortment_stores (
     id UUID PRIMARY KEY,
     store_code VARCHAR(50) UNIQUE NOT NULL,
     name VARCHAR(255),
     format VARCHAR(50),  -- Express, Standard, Superstore
     location_type VARCHAR(50),  -- Urban, Suburban, Rural
     income_index VARCHAR(50),
     total_facings INTEGER,
     weekly_traffic INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE assortment_sales (
     id UUID PRIMARY KEY,
     product_id UUID REFERENCES assortment_products(id),
     store_id UUID REFERENCES assortment_stores(id),
     week_number INTEGER,
     year INTEGER,
     units_sold INTEGER,
     revenue DECIMAL(12,2),
     facings INTEGER,
     on_promotion BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE assortment_switching_matrix (
     id UUID PRIMARY KEY,
     from_brand VARCHAR(100),
     to_brand VARCHAR(100),
     switching_probability DECIMAL(5,4),
     created_at TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE assortment_optimization_runs (
     id UUID PRIMARY KEY,
     store_id UUID REFERENCES assortment_stores(id),
     run_date TIMESTAMP DEFAULT NOW(),
     constraints JSONB,
     results JSONB,
     profit_lift_pct DECIMAL(8,4),
     status VARCHAR(50)
   );

   CREATE TABLE assortment_simulation_runs (
     id UUID PRIMARY KEY,
     optimization_run_id UUID REFERENCES assortment_optimization_runs(id),
     scenario_type VARCHAR(50),
     parameters JSONB,
     results JSONB,
     num_trials INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. Create Pydantic schemas for validation
3. Set up Alembic for migrations
4. Implement repository pattern for data access

#### Deliverables:
- [ ] Complete database schema
- [ ] SQLAlchemy models
- [ ] Pydantic request/response schemas
- [ ] Migration scripts
- [ ] Data access layer

#### Testing:
- Schema migrations run successfully
- CRUD operations work correctly
- Validation catches invalid data

---

### SESSION 3: Authentication & API Gateway Integration
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Integrate authentication
- Set up API gateway in parent app
- Configure secure communication
- Implement rate limiting

#### Tasks:
1. JWT validation in FastAPI:
   ```python
   from fastapi import Depends, HTTPException, Security
   from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
   import jwt

   security = HTTPBearer()

   async def verify_token(
       credentials: HTTPAuthorizationCredentials = Security(security)
   ) -> dict:
       """Verify JWT token and return user claims."""
       token = credentials.credentials
       try:
           payload = jwt.decode(token, options={"verify_signature": True})
           return payload
       except Exception as e:
           raise HTTPException(status_code=401, detail="Invalid token")
   ```

2. Create API gateway routes in parent (Hono):
   ```typescript
   // app/api/[[...route]]/assortment.ts
   import { Hono } from 'hono'

   const app = new Hono()
     .all('/*', async (c) => {
       const auth = c.get('auth')
       if (!auth?.userId) {
         return c.json({ error: 'Unauthorized' }, 401)
       }

       // Forward to microservice with auth header
       const response = await fetch(
         `${process.env.ASSORTMENT_SERVICE_URL}${c.req.path}`,
         {
           method: c.req.method,
           headers: {
             'Authorization': c.req.header('Authorization'),
             'Content-Type': 'application/json',
             'X-User-Id': auth.userId,
           },
           body: c.req.method !== 'GET' ? await c.req.text() : undefined,
         }
       )

       return c.json(await response.json(), response.status)
     })

   export default app
   ```

3. Configure service-to-service authentication
4. Implement rate limiting with Redis
5. Set up request logging and tracing

#### Deliverables:
- [ ] JWT validation in FastAPI
- [ ] API gateway routes in parent app
- [ ] Rate limiting configuration
- [ ] Request logging
- [ ] Service communication security

#### Testing:
- Valid tokens pass validation
- Invalid tokens return 401
- Rate limiting triggers correctly
- Requests are properly logged

---

### SESSION 4: Migrate Core Data Layer
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Migrate data generator to service format
- Implement data import endpoints
- Create data seeding utilities
- Build data export functionality

#### Tasks:
1. Convert `data/generator.py` to service layer:
   ```python
   # app/services/data_generator.py
   from typing import List
   import pandas as pd
   from app.models import Product, Store, Sale
   from app.db.repository import ProductRepository, StoreRepository

   class DataGeneratorService:
       def __init__(
           self,
           product_repo: ProductRepository,
           store_repo: StoreRepository
       ):
           self.product_repo = product_repo
           self.store_repo = store_repo

       async def generate_products(self, count: int = 80) -> List[Product]:
           """Generate synthetic product data."""
           # Migrated logic from generator.py
           pass

       async def generate_stores(self, count: int = 25) -> List[Store]:
           """Generate synthetic store data."""
           pass

       async def generate_sales(
           self, weeks: int = 52
       ) -> List[Sale]:
           """Generate synthetic sales data."""
           pass
   ```

2. Create data import API endpoints:
   - POST `/api/v1/data/import/products` (CSV/JSON)
   - POST `/api/v1/data/import/stores` (CSV/JSON)
   - POST `/api/v1/data/import/sales` (CSV/JSON)
   - POST `/api/v1/data/seed` (generate synthetic data)

3. Create data export endpoints:
   - GET `/api/v1/data/export/products`
   - GET `/api/v1/data/export/optimization-results`

4. Implement batch operations for large datasets

#### Deliverables:
- [ ] Data generator service
- [ ] Import/export API endpoints
- [ ] CSV/JSON parsing utilities
- [ ] Batch operation handlers
- [ ] Data validation

#### Testing:
- Data generation produces valid records
- Import handles various file formats
- Export produces correct output
- Large batch operations perform adequately

---

### SESSION 5: Migrate Demand Model
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Migrate MNL demand model to FastAPI service
- Implement demand prediction endpoints
- Create substitution analysis API
- Build price/space elasticity calculations

#### Tasks:
1. Migrate `models/demand.py`:
   ```python
   # app/services/demand_model.py
   import numpy as np
   from typing import Dict, List, Optional
   from pydantic import BaseModel

   class DemandModelConfig(BaseModel):
       brand_utilities: Dict[str, float] = {
           "Premium": 0.8,
           "National A": 0.6,
           "National B": 0.3,
           "Store Brand": 0.0
       }
       price_sensitivity: float = -0.5
       promotion_boost: float = 0.8
       price_elasticity: float = -1.8
       space_elasticity_range: tuple = (0.10, 0.25)

   class DemandModelService:
       def __init__(self, config: DemandModelConfig = None):
           self.config = config or DemandModelConfig()

       def calculate_utility(
           self,
           brand_tier: str,
           price: float,
           size: str,
           on_promotion: bool
       ) -> float:
           """Calculate MNL utility for a product."""
           pass

       def predict_choice_probability(
           self,
           products: List[dict],
           target_product_id: str
       ) -> float:
           """Calculate probability of choosing target product."""
           pass

       def calculate_substitution_matrix(
           self,
           products: List[dict]
       ) -> np.ndarray:
           """Build product substitution probability matrix."""
           pass

       def estimate_demand_transfer(
           self,
           removed_product: dict,
           remaining_products: List[dict]
       ) -> Dict[str, float]:
           """Estimate demand transfer when product removed."""
           pass
   ```

2. Create API endpoints:
   - POST `/api/v1/demand/predict` - Predict demand
   - POST `/api/v1/demand/substitution` - Calculate substitution
   - POST `/api/v1/demand/elasticity` - Calculate elasticities
   - GET `/api/v1/demand/switching-matrix` - Get switching matrix

3. Implement caching for expensive calculations
4. Add async support for batch predictions

#### Deliverables:
- [ ] Demand model service
- [ ] API endpoints with validation
- [ ] Redis caching layer
- [ ] Batch prediction support
- [ ] Unit tests for model accuracy

#### Testing:
- MNL probabilities sum to 1
- Substitution transfers are valid
- Elasticity calculations match expected ranges
- Cache improves repeated query performance

---

### SESSION 6: Migrate Optimization Engine
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Migrate greedy optimizer to FastAPI service
- Implement constraint handling
- Create optimization run management
- Build result persistence

#### Tasks:
1. Migrate `models/optimizer.py`:
   ```python
   # app/services/optimizer.py
   from typing import List, Dict, Optional
   from pydantic import BaseModel
   import numpy as np

   class OptimizationConstraints(BaseModel):
       total_facings: int = 100
       min_facings_per_sku: int = 1
       max_facings_per_sku: int = 6
       min_skus_per_subcategory: int = 3
       min_skus_per_price_tier: int = 1
       min_skus_per_brand: int = 2
       max_skus_per_brand: int = 6
       must_carry: List[str] = []
       exclude: List[str] = []

   class OptimizationResult(BaseModel):
       optimized_assortment: List[dict]
       current_profit: float
       optimized_profit: float
       profit_lift_pct: float
       space_allocation: Dict[str, int]
       constraint_satisfaction: Dict[str, bool]

   class AssortmentOptimizerService:
       def __init__(
           self,
           demand_service: DemandModelService,
           config: OptimizationConstraints = None
       ):
           self.demand_service = demand_service
           self.constraints = config or OptimizationConstraints()

       async def optimize(
           self,
           products: List[dict],
           sales_data: List[dict],
           store_id: str,
           constraints: OptimizationConstraints
       ) -> OptimizationResult:
           """Run greedy optimization algorithm."""
           pass

       def _calculate_profit_per_facing(
           self,
           product: dict,
           sales: List[dict]
       ) -> float:
           """Calculate profit per facing with elasticity."""
           pass

       def _apply_constraints(
           self,
           selected: List[dict],
           remaining: List[dict]
       ) -> List[dict]:
           """Ensure all constraints are satisfied."""
           pass
   ```

2. Create API endpoints:
   - POST `/api/v1/optimize/run` - Start optimization
   - GET `/api/v1/optimize/{run_id}` - Get results
   - GET `/api/v1/optimize/history` - List past runs
   - POST `/api/v1/optimize/compare` - Compare scenarios

3. Implement background job processing for long runs
4. Add optimization progress tracking

#### Deliverables:
- [ ] Optimizer service
- [ ] Constraint handling
- [ ] API endpoints
- [ ] Background job processing
- [ ] Result persistence

#### Testing:
- Optimizer respects all constraints
- Profit lift calculations are accurate
- Background jobs complete successfully
- Results persist correctly

---

### SESSION 7: Migrate Monte Carlo Simulation
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Migrate simulation engine to FastAPI
- Implement scenario handlers
- Create simulation result analysis
- Build confidence interval calculations

#### Tasks:
1. Migrate `models/simulation.py`:
   ```python
   # app/services/simulation.py
   from typing import List, Dict, Optional
   from enum import Enum
   import numpy as np
   from pydantic import BaseModel

   class ScenarioType(str, Enum):
       REMOVE_SKU = "remove_sku"
       ADD_SKU = "add_sku"
       CHANGE_FACINGS = "change_facings"
       CHANGE_PRICE = "change_price"

   class SimulationConfig(BaseModel):
       num_trials: int = 5000
       demand_cv: float = 0.15
       price_elasticity_std: float = 0.3
       walk_rate_std: float = 0.02

   class SimulationResult(BaseModel):
       scenario_type: ScenarioType
       mean_revenue: float
       std_revenue: float
       mean_profit: float
       std_profit: float
       percentile_5: float
       percentile_50: float
       percentile_95: float
       probability_positive: float
       probability_negative: float

   class SimulationService:
       def __init__(
           self,
           demand_service: DemandModelService,
           config: SimulationConfig = None
       ):
           self.demand_service = demand_service
           self.config = config or SimulationConfig()

       async def run_simulation(
           self,
           scenario_type: ScenarioType,
           parameters: dict,
           products: List[dict],
           sales_data: List[dict]
       ) -> SimulationResult:
           """Run Monte Carlo simulation for scenario."""
           pass

       def _simulate_remove_sku(
           self,
           sku_ids: List[str],
           products: List[dict],
           sales: List[dict]
       ) -> np.ndarray:
           """Simulate removing SKUs with demand transfer."""
           pass

       def _simulate_add_sku(
           self,
           new_sku: dict,
           products: List[dict],
           sales: List[dict]
       ) -> np.ndarray:
           """Simulate adding new SKU with cannibalization."""
           pass
   ```

2. Create API endpoints:
   - POST `/api/v1/simulate/run` - Start simulation
   - GET `/api/v1/simulate/{run_id}` - Get results
   - POST `/api/v1/simulate/batch` - Run multiple scenarios
   - GET `/api/v1/simulate/compare` - Compare scenarios

3. Implement vectorized computation for performance
4. Add progress streaming for long simulations

#### Deliverables:
- [ ] Simulation service
- [ ] All scenario type handlers
- [ ] API endpoints
- [ ] Vectorized calculations
- [ ] Progress streaming

#### Testing:
- Simulations produce valid distributions
- Confidence intervals are accurate
- Vectorized code matches sequential results
- Large simulations complete in reasonable time

---

### SESSION 8: Migrate Clustering Service
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Migrate K-Means/GMM clustering
- Implement cluster profiling
- Create cluster recommendation engine
- Build visualization data endpoints

#### Tasks:
1. Migrate `models/clustering.py`:
   ```python
   # app/services/clustering.py
   from typing import List, Dict, Optional
   from sklearn.cluster import KMeans
   from sklearn.mixture import GaussianMixture
   from sklearn.preprocessing import StandardScaler
   from sklearn.metrics import silhouette_score
   import numpy as np

   class ClusteringService:
       def __init__(self):
           self.scaler = StandardScaler()

       async def cluster_stores(
           self,
           stores: List[dict],
           sales_data: List[dict],
           method: str = "kmeans",
           n_clusters: Optional[int] = None
       ) -> Dict:
           """Cluster stores based on characteristics."""
           pass

       def _find_optimal_k(
           self,
           features: np.ndarray,
           max_k: int = 10
       ) -> int:
           """Find optimal number of clusters."""
           pass

       def _generate_cluster_profiles(
           self,
           stores: List[dict],
           labels: np.ndarray
       ) -> List[Dict]:
           """Generate descriptive profiles for clusters."""
           pass

       def _generate_recommendations(
           self,
           cluster_profiles: List[Dict]
       ) -> List[Dict]:
           """Generate assortment recommendations per cluster."""
           pass
   ```

2. Create API endpoints:
   - POST `/api/v1/cluster/run` - Run clustering
   - GET `/api/v1/cluster/{run_id}` - Get results
   - GET `/api/v1/cluster/profiles` - Get cluster profiles
   - GET `/api/v1/cluster/recommendations` - Get recommendations

3. Implement PCA for visualization data
4. Add cluster comparison analytics

#### Deliverables:
- [ ] Clustering service
- [ ] K-Means and GMM support
- [ ] Cluster profiling
- [ ] Recommendation engine
- [ ] API endpoints

#### Testing:
- Clustering produces valid assignments
- Silhouette scores are computed correctly
- Profiles accurately describe clusters
- Recommendations are actionable

---

### SESSION 9: Frontend Setup & Architecture
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Create route structure in parent app
- Set up component architecture
- Configure state management
- Build API client hooks

#### Tasks:
1. Create route structure:
   ```
   app/(inventory)/risk/merchandizing-optimizer/
   ├── page.tsx                    # Main page with tabs
   ├── layout.tsx                  # Layout with sidebar
   ├── loading.tsx                 # Loading state
   ├── error.tsx                   # Error boundary
   └── components/
       ├── AssortmentTabs.tsx      # Tab navigation
       ├── StoreSelector.tsx       # Store filter
       └── SubcategoryFilter.tsx   # Category filter
   ```

2. Set up React Query hooks:
   ```typescript
   // features/assortment/api/use-get-products.ts
   import { useQuery } from '@tanstack/react-query'
   import { client } from '@/lib/hono'

   export const useGetAssortmentProducts = (storeId?: string) => {
     return useQuery({
       queryKey: ['assortment-products', storeId],
       queryFn: async () => {
         const response = await client.api.assortment.products.$get({
           query: { store_id: storeId }
         })
         if (!response.ok) throw new Error('Failed to fetch')
         return response.json()
       }
     })
   }
   ```

3. Create Zustand store for UI state:
   ```typescript
   // features/assortment/store/use-assortment-store.ts
   import { create } from 'zustand'

   interface AssortmentState {
     selectedStore: string | null
     selectedSubcategories: string[]
     activeTab: string
     setSelectedStore: (store: string | null) => void
     toggleSubcategory: (subcategory: string) => void
     setActiveTab: (tab: string) => void
   }
   ```

4. Set up component library integration

#### Deliverables:
- [ ] Route structure
- [ ] API client hooks
- [ ] State management store
- [ ] Base layout components
- [ ] Type definitions

#### Testing:
- Routes render correctly
- API hooks fetch data
- State updates propagate
- Types are complete

---

### SESSION 10: Dashboard Component
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Build KPI dashboard component
- Create metric cards
- Implement visualization charts
- Add filtering and interactivity

#### Tasks:
1. Build KPI metric cards:
   ```typescript
   // components/assortment/dashboard/KPICard.tsx
   interface KPICardProps {
     title: string
     value: number | string
     change?: number
     format?: 'currency' | 'percent' | 'number'
     icon?: React.ReactNode
   }
   ```

2. Create dashboard visualizations:
   - Weekly sales trend (line chart)
   - Top performers (bar chart)
   - Category mix (pie/donut chart)
   - Brand tier performance (grouped bar)

3. Implement responsive grid layout
4. Add export functionality

#### Deliverables:
- [ ] KPI card components
- [ ] Sales trend chart
- [ ] Top performers chart
- [ ] Category mix chart
- [ ] Brand performance chart
- [ ] Export functionality

#### Testing:
- Charts render correctly with data
- Filters update visualizations
- Responsive on all screen sizes
- Export produces valid files

---

### SESSION 11: CDT Analysis Component
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Build Consumer Decision Tree visualization
- Implement sunburst chart
- Create attribute importance display
- Add switching behavior analysis

#### Tasks:
1. Build sunburst hierarchy:
   ```typescript
   // components/assortment/cdt/SunburstChart.tsx
   import { ResponsiveSunburst } from '@nivo/sunburst'
   // or custom implementation with D3/Recharts

   interface CDTNode {
     id: string
     name: string
     value?: number
     children?: CDTNode[]
   }
   ```

2. Create attribute importance visualization
3. Build switching matrix heatmap
4. Implement drill-down interactions

#### Deliverables:
- [ ] Sunburst chart component
- [ ] Attribute importance display
- [ ] Switching matrix heatmap
- [ ] Interactive drill-down
- [ ] Tooltips and legends

#### Testing:
- Sunburst renders hierarchy correctly
- Drill-down updates views
- Switching matrix shows probabilities
- Interactions are responsive

---

### SESSION 12: Optimizer Component
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Build optimization configuration UI
- Create constraint input forms
- Implement before/after comparison
- Add optimization progress tracking

#### Tasks:
1. Build constraint configuration:
   ```typescript
   // components/assortment/optimizer/ConstraintForm.tsx
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'

   const constraintSchema = z.object({
     totalFacings: z.number().min(50).max(200),
     minFacingsPerSku: z.number().min(1).max(6),
     // ... other constraints
   })
   ```

2. Create must-carry/exclude selection
3. Build comparison table (current vs optimized)
4. Implement profit lift visualization
5. Add optimization run history

#### Deliverables:
- [ ] Constraint configuration form
- [ ] Must-carry/exclude selector
- [ ] Comparison table
- [ ] Profit lift visualization
- [ ] Run history display

#### Testing:
- Form validation works correctly
- Optimization runs successfully
- Comparison shows accurate data
- History displays past runs

---

### SESSION 13: Simulation Component
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Build what-if scenario interface
- Create scenario type selection
- Implement result distribution visualization
- Add confidence interval display

#### Tasks:
1. Build scenario configuration:
   ```typescript
   // components/assortment/simulation/ScenarioBuilder.tsx
   type ScenarioType =
     | 'remove_sku'
     | 'add_sku'
     | 'change_facings'
     | 'change_price'

   interface ScenarioConfig {
     type: ScenarioType
     parameters: Record<string, any>
   }
   ```

2. Create SKU selection interface
3. Build distribution plot (histogram/violin)
4. Implement confidence interval display
5. Add scenario comparison view

#### Deliverables:
- [ ] Scenario type selector
- [ ] Parameter configuration forms
- [ ] Distribution visualization
- [ ] Confidence interval display
- [ ] Scenario comparison

#### Testing:
- All scenario types configure correctly
- Simulations run and display results
- Distributions render accurately
- Comparisons show differences

---

### SESSION 14: Clustering & Planogram Components
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Build store clustering visualization
- Create cluster profile cards
- Implement planogram shelf display
- Add interactive adjustments

#### Tasks:
1. Build clustering visualization:
   ```typescript
   // components/assortment/clustering/ClusterScatter.tsx
   // PCA scatter plot with cluster coloring
   ```

2. Create cluster profile cards
3. Build recommendation display
4. Implement planogram grid:
   ```typescript
   // components/assortment/planogram/ShelfDisplay.tsx
   interface ShelfConfig {
     width: number
     numShelves: number
   }

   interface ProductPlacement {
     productId: string
     shelf: number
     position: number
     facings: number
   }
   ```

5. Add drag-and-drop adjustments

#### Deliverables:
- [ ] Cluster scatter plot
- [ ] Cluster profile cards
- [ ] Recommendation display
- [ ] Planogram shelf grid
- [ ] Drag-and-drop editing

#### Testing:
- Clusters visualize correctly
- Profiles display accurate data
- Planogram renders products
- Drag-and-drop updates state

---

### SESSION 15: Integration Testing - Backend
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Write comprehensive API integration tests
- Test authentication flow
- Validate data consistency
- Performance testing

#### Tasks:
1. Write API integration tests:
   ```python
   # tests/integration/test_optimization_flow.py
   import pytest
   from httpx import AsyncClient

   @pytest.mark.asyncio
   async def test_full_optimization_flow(client: AsyncClient, auth_token: str):
       # 1. Create/import products
       # 2. Create/import stores
       # 3. Import sales data
       # 4. Run optimization
       # 5. Verify results
       pass
   ```

2. Test authentication scenarios
3. Test error handling
4. Performance benchmarking

#### Deliverables:
- [ ] API integration test suite
- [ ] Auth flow tests
- [ ] Error handling tests
- [ ] Performance benchmarks
- [ ] CI integration

#### Testing:
- All integration tests pass
- Auth flows work correctly
- Errors return proper responses
- Performance meets SLAs

---

### SESSION 16: Integration Testing - Frontend
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Write component tests
- Test user interaction flows
- Validate data display
- Accessibility testing

#### Tasks:
1. Write component tests:
   ```typescript
   // __tests__/assortment/Dashboard.test.tsx
   import { render, screen } from '@testing-library/react'
   import { Dashboard } from '@/components/assortment/Dashboard'

   describe('Dashboard', () => {
     it('displays KPI cards with correct values', () => {
       // Test implementation
     })
   })
   ```

2. Test user interaction flows
3. Mock API responses
4. Accessibility audit

#### Deliverables:
- [ ] Component test suite
- [ ] Interaction flow tests
- [ ] API mocking setup
- [ ] Accessibility report

#### Testing:
- All component tests pass
- Interactions work correctly
- Mocks behave as expected
- Accessibility issues resolved

---

### SESSION 17: End-to-End Testing
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Write E2E test scenarios
- Test complete user journeys
- Validate cross-service communication
- Test error recovery

#### Tasks:
1. Set up Playwright/Cypress:
   ```typescript
   // e2e/assortment-optimizer.spec.ts
   import { test, expect } from '@playwright/test'

   test.describe('Assortment Optimizer', () => {
     test('complete optimization journey', async ({ page }) => {
       await page.goto('/risk/merchandizing-optimizer')
       // 1. Select store
       // 2. Configure constraints
       // 3. Run optimization
       // 4. Verify results
       // 5. Run simulation
       // 6. Compare scenarios
     })
   })
   ```

2. Test all user journeys
3. Test error states
4. Test loading states

#### Deliverables:
- [ ] E2E test suite
- [ ] User journey coverage
- [ ] Error state tests
- [ ] CI/CD integration

#### Testing:
- All E2E tests pass
- Journeys complete successfully
- Errors handled gracefully
- Tests run in CI

---

### SESSION 18: Data Migration & Seeding
**Complexity:** Medium | **Recommended Model:** Sonnet 4.5

#### Objectives:
- Create data migration scripts
- Build seeding utilities
- Implement data validation
- Create backup/restore procedures

#### Tasks:
1. Create migration scripts for existing data
2. Build data seeding CLI:
   ```python
   # scripts/seed_data.py
   import click
   from app.services.data_generator import DataGeneratorService

   @click.command()
   @click.option('--products', default=80)
   @click.option('--stores', default=25)
   @click.option('--weeks', default=52)
   def seed(products: int, stores: int, weeks: int):
       """Seed database with synthetic data."""
       pass
   ```

3. Implement data validation checks
4. Create backup procedures

#### Deliverables:
- [ ] Migration scripts
- [ ] Seeding CLI
- [ ] Data validation
- [ ] Backup/restore procedures

#### Testing:
- Migrations run cleanly
- Seeding produces valid data
- Validation catches issues
- Backup/restore works

---

### SESSION 19: Performance Optimization
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Optimize API response times
- Implement caching strategies
- Optimize database queries
- Frontend performance tuning

#### Tasks:
1. Implement Redis caching:
   ```python
   # app/core/cache.py
   from redis import Redis
   from functools import wraps

   def cache_result(ttl: int = 3600):
       def decorator(func):
           @wraps(func)
           async def wrapper(*args, **kwargs):
               cache_key = f"{func.__name__}:{hash(args)}"
               cached = redis.get(cache_key)
               if cached:
                   return json.loads(cached)
               result = await func(*args, **kwargs)
               redis.setex(cache_key, ttl, json.dumps(result))
               return result
           return wrapper
       return decorator
   ```

2. Optimize database queries (indexes, query plans)
3. Implement connection pooling
4. Frontend code splitting and lazy loading
5. Add compression and CDN

#### Deliverables:
- [ ] Redis caching layer
- [ ] Optimized queries
- [ ] Connection pooling
- [ ] Frontend optimization
- [ ] Performance benchmarks

#### Testing:
- API response times < 200ms (p95)
- Cache hit rates > 80%
- Database query times < 50ms
- Frontend LCP < 2.5s

---

### SESSION 20: Production Deployment & Monitoring
**Complexity:** High | **Recommended Model:** Opus 4.5

#### Objectives:
- Configure production deployment
- Set up monitoring and alerting
- Implement logging aggregation
- Create runbooks and documentation

#### Tasks:
1. Production Docker configuration:
   ```dockerfile
   # Dockerfile.prod
   FROM python:3.11-slim as builder
   # Multi-stage build for smaller image
   ```

2. Kubernetes/Docker Compose production config
3. Set up monitoring:
   - Prometheus metrics
   - Grafana dashboards
   - Error tracking (Sentry)
   - Log aggregation

4. Create runbooks:
   - Deployment procedures
   - Rollback procedures
   - Incident response
   - Scaling guidelines

#### Deliverables:
- [ ] Production deployment config
- [ ] Monitoring dashboards
- [ ] Alerting rules
- [ ] Log aggregation
- [ ] Runbooks and documentation

#### Testing:
- Deployment completes successfully
- Monitoring captures all metrics
- Alerts trigger correctly
- Logs are searchable

---

## Summary: Model Recommendations by Session

| Session | Title | Complexity | Model |
|---------|-------|------------|-------|
| 1 | Project Setup & Infrastructure | Medium | Sonnet 4.5 |
| 2 | Database Schema & Data Models | Medium | Sonnet 4.5 |
| 3 | Authentication & API Gateway | High | **Opus 4.5** |
| 4 | Migrate Core Data Layer | Medium | Sonnet 4.5 |
| 5 | Migrate Demand Model | High | **Opus 4.5** |
| 6 | Migrate Optimization Engine | High | **Opus 4.5** |
| 7 | Migrate Monte Carlo Simulation | High | **Opus 4.5** |
| 8 | Migrate Clustering Service | Medium | Sonnet 4.5 |
| 9 | Frontend Setup & Architecture | Medium | Sonnet 4.5 |
| 10 | Dashboard Component | Medium | Sonnet 4.5 |
| 11 | CDT Analysis Component | High | **Opus 4.5** |
| 12 | Optimizer Component | High | **Opus 4.5** |
| 13 | Simulation Component | High | **Opus 4.5** |
| 14 | Clustering & Planogram | Medium | Sonnet 4.5 |
| 15 | Integration Testing - Backend | High | **Opus 4.5** |
| 16 | Integration Testing - Frontend | Medium | Sonnet 4.5 |
| 17 | End-to-End Testing | High | **Opus 4.5** |
| 18 | Data Migration & Seeding | Medium | Sonnet 4.5 |
| 19 | Performance Optimization | High | **Opus 4.5** |
| 20 | Production Deployment | High | **Opus 4.5** |

**Total Sessions:** 20
- **Opus 4.5 Sessions:** 11 (High complexity - architectural decisions, algorithm migration, testing strategy)
- **Sonnet 4.5 Sessions:** 9 (Medium complexity - standard implementation, UI components)

---

## Dependencies & Prerequisites

### Before Starting:
- [ ] Python 3.11+ installed
- [ ] Docker Desktop installed
- [ ] PostgreSQL access (Neon or local)
- [ ] Redis instance (local or cloud)
- [ ] Node.js 18+ for frontend

### Environment Variables Required:
```env
# Microservice
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
# Parent App (additional)
ASSORTMENT_SERVICE_URL=http://localhost:8000
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Algorithm accuracy loss during migration | Comprehensive unit tests comparing outputs |
| Performance degradation | Benchmark early, optimize continuously |
| Auth integration complexity | Test auth flows thoroughly in session 3 |
| Data consistency issues | Implement validation at all boundaries |
| Frontend state complexity | Use established patterns (React Query + Zustand) |

---

## Success Criteria

1. **Functional Parity**: All Streamlit features available in new interface
2. **Performance**: API response times < 200ms (p95)
3. **Reliability**: 99.9% uptime
4. **Security**: All endpoints authenticated, no vulnerabilities
5. **Maintainability**: >80% test coverage, comprehensive documentation
6. **User Experience**: Responsive UI, intuitive navigation

---

## Next Steps

1. Review and approve this plan
2. Set up development environment (Session 1 prerequisites)
3. Begin Session 1: Project Setup & Infrastructure
4. Track progress using project management tool
5. Conduct weekly reviews after each session

---

*Document Version: 1.0*
*Created: January 2026*
*Author: Claude Code Assistant*
