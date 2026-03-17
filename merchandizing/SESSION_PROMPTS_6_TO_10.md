# Session Implementation Prompts (6-10)

---

## SESSION 6: Migrate Optimization Engine
**Model:** Opus 4.5

```
Migrate the greedy assortment optimizer from Streamlit to FastAPI.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/models/optimizer.py

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Create app/schemas/optimization.py:

   class OptimizationConstraints(BaseModel):
       total_facings: int = Field(100, ge=50, le=200)
       min_facings_per_sku: int = Field(1, ge=1, le=6)
       max_facings_per_sku: int = Field(6, ge=1, le=10)
       min_skus_per_subcategory: int = Field(3, ge=1)
       min_skus_per_price_tier: int = Field(1, ge=1)
       min_skus_per_brand: int = Field(2, ge=0)
       max_skus_per_brand: int = Field(6, ge=1)
       must_carry: List[str] = []  # SKU IDs
       exclude: List[str] = []  # SKU IDs

   class OptimizationResult(BaseModel):
       run_id: UUID
       optimized_assortment: List[ProductAllocation]
       current_profit: float
       optimized_profit: float
       profit_lift_pct: float
       profit_lift_absolute: float
       space_allocation: Dict[str, int]  # subcategory -> facings
       constraint_satisfaction: Dict[str, bool]
       execution_time_ms: int

2. Create app/services/optimizer.py:

   class AssortmentOptimizerService:
       def __init__(self, demand_service: DemandModelService)

       async def optimize(store_id, products, sales_data, constraints) -> OptimizationResult:
           # Greedy algorithm:
           # 1. Calculate avg weekly profit per SKU (with space elasticity)
           # 2. Add must-carry items first
           # 3. Ensure subcategory coverage (min 3 per subcategory)
           # 4. Ensure price tier coverage (min 1 per tier)
           # 5. Fill remaining space with highest profit SKUs
           # 6. Allocate extra facings to top performers
           # 7. Calculate profit lift with elasticity effects

       def _calculate_profit_per_facing(product, sales) -> float
       def _apply_space_elasticity(base_profit, old_facings, new_facings, elasticity) -> float
       def _check_constraints(selected_products, constraints) -> Dict[str, bool]
       def _allocate_extra_facings(products, remaining_space) -> List[ProductAllocation]

3. Create app/api/v1/endpoints/optimization.py:
   - POST /api/v1/optimize/run - Start optimization (returns run_id)
   - GET /api/v1/optimize/{run_id} - Get optimization results
   - GET /api/v1/optimize/history - List past runs (paginated)
   - POST /api/v1/optimize/compare - Compare two optimization runs
   - DELETE /api/v1/optimize/{run_id} - Delete a run

4. Implement background task processing for long-running optimizations:
   - Use FastAPI BackgroundTasks or Celery
   - Store intermediate status in database
   - Support progress polling

5. Write tests:
   - Test all constraints are respected
   - Test must-carry items are always included
   - Test exclude items are never included
   - Test profit lift calculation accuracy
   - Test with edge cases (empty data, all same profit)

Match the exact algorithm logic from the original optimizer.py.
```

---

## SESSION 7: Migrate Monte Carlo Simulation
**Model:** Opus 4.5

```
Migrate the Monte Carlo simulation engine from Streamlit to FastAPI.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/models/simulation.py

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Create app/schemas/simulation.py:

   class ScenarioType(str, Enum):
       REMOVE_SKU = "remove_sku"
       ADD_SKU = "add_sku"
       CHANGE_FACINGS = "change_facings"
       CHANGE_PRICE = "change_price"

   class SimulationConfig(BaseModel):
       num_trials: int = Field(5000, ge=100, le=50000)
       demand_cv: float = Field(0.15, ge=0.01, le=0.5)
       price_elasticity_mean: float = Field(-1.8, le=0)
       price_elasticity_std: float = Field(0.3, ge=0)
       walk_rate_mean: float = Field(0.09, ge=0, le=1)
       walk_rate_std: float = Field(0.02, ge=0)

   class SimulationResult(BaseModel):
       run_id: UUID
       scenario_type: ScenarioType
       parameters: dict
       revenue_stats: DistributionStats
       profit_stats: DistributionStats
       percentiles: Dict[str, float]  # p5, p25, p50, p75, p95
       probability_positive: float
       probability_negative: float
       confidence_interval_95: Tuple[float, float]
       execution_time_ms: int
       trials_completed: int

2. Create app/services/simulation.py:

   class SimulationService:
       def __init__(self, demand_service: DemandModelService, config: SimulationConfig)

       async def run_simulation(scenario_type, parameters, products, sales) -> SimulationResult

       def _simulate_remove_sku(sku_ids, products, sales, num_trials) -> np.ndarray:
           # For each trial:
           # 1. Sample demand uncertainty (normal distribution with CV)
           # 2. Calculate demand transfer to substitutes
           # 3. Apply walk-away rate (sampled)
           # 4. Calculate revenue/profit impact

       def _simulate_add_sku(new_sku, products, sales, num_trials) -> np.ndarray:
           # For each trial:
           # 1. Sample demand for new SKU (based on similar products)
           # 2. Calculate cannibalization from existing products
           # 3. Calculate net revenue/profit impact

       def _simulate_change_facings(sku_id, new_facings, products, sales, num_trials) -> np.ndarray:
           # Apply space elasticity with uncertainty

       def _simulate_change_price(sku_id, new_price, products, sales, num_trials) -> np.ndarray:
           # Apply price elasticity with uncertainty

3. Implement VECTORIZED computation using NumPy:
   - Pre-compute similarity matrices
   - Batch random sampling
   - Avoid Python loops for simulation trials

4. Create app/api/v1/endpoints/simulation.py:
   - POST /api/v1/simulate/run - Start simulation
   - GET /api/v1/simulate/{run_id} - Get results
   - POST /api/v1/simulate/batch - Run multiple scenarios in parallel
   - GET /api/v1/simulate/compare/{run_id_1}/{run_id_2} - Compare two scenarios
   - WebSocket /api/v1/simulate/stream/{run_id} - Stream progress updates

5. Add progress tracking:
   - Report % complete during long simulations
   - Allow cancellation

6. Write tests:
   - Test distributions have correct mean/std
   - Test confidence intervals are valid
   - Test vectorized matches sequential results
   - Test 5000 trials completes in < 5 seconds

Ensure numerical results match the original simulation.py exactly.
```

---

## SESSION 8: Migrate Clustering Service
**Model:** Sonnet 4.5

```
Migrate the store clustering from Streamlit to FastAPI.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/models/clustering.py

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Create app/schemas/clustering.py:

   class ClusteringMethod(str, Enum):
       KMEANS = "kmeans"
       GMM = "gmm"

   class ClusteringRequest(BaseModel):
       method: ClusteringMethod = ClusteringMethod.KMEANS
       n_clusters: Optional[int] = None  # Auto-detect if None
       max_clusters: int = Field(10, ge=2, le=20)
       features: List[str] = ["revenue", "premium_share", "traffic"]

   class ClusterProfile(BaseModel):
       cluster_id: int
       store_count: int
       avg_revenue: float
       avg_traffic: float
       premium_share: float
       private_label_share: float
       dominant_format: str
       dominant_location: str
       dominant_income: str
       recommendations: List[str]

   class ClusteringResult(BaseModel):
       run_id: UUID
       method: ClusteringMethod
       n_clusters: int
       silhouette_score: float
       store_assignments: Dict[str, int]  # store_id -> cluster
       cluster_profiles: List[ClusterProfile]
       pca_coordinates: List[Dict]  # For visualization

2. Create app/services/clustering.py:

   class ClusteringService:
       def __init__(self)

       async def cluster_stores(stores, sales_data, request: ClusteringRequest) -> ClusteringResult:
           # 1. Extract features from stores and sales
           # 2. Standardize features
           # 3. Find optimal K (if not specified)
           # 4. Run clustering
           # 5. Generate profiles
           # 6. Generate recommendations

       def _extract_features(stores, sales) -> np.ndarray
       def _find_optimal_k(features, max_k) -> int:
           # Use silhouette score
       def _run_kmeans(features, n_clusters) -> np.ndarray
       def _run_gmm(features, n_clusters) -> np.ndarray
       def _generate_profiles(stores, sales, labels) -> List[ClusterProfile]
       def _generate_recommendations(profile: ClusterProfile) -> List[str]:
           # Premium-focused vs value-focused strategies
       def _compute_pca(features, labels) -> List[Dict]:
           # 2D projection for visualization

3. Create app/api/v1/endpoints/clustering.py:
   - POST /api/v1/cluster/run - Run clustering
   - GET /api/v1/cluster/{run_id} - Get results
   - GET /api/v1/cluster/{run_id}/profiles - Get cluster profiles
   - GET /api/v1/cluster/{run_id}/recommendations - Get recommendations
   - GET /api/v1/cluster/{run_id}/visualization - Get PCA data

4. Write tests:
   - Test optimal K selection
   - Test cluster assignments are valid
   - Test silhouette score calculation
   - Test profiles are accurate
   - Test with various store counts

Use scikit-learn for K-Means, GMM, PCA, and StandardScaler.
```

---

## SESSION 9: Frontend Setup & Architecture
**Model:** Sonnet 4.5

```
Set up the frontend route structure for Assortment Optimizer in the parent Next.js app.

Working in: d:/merchandizing-optimizer/

1. Create the route structure:
   app/(inventory)/risk/merchandizing-optimizer/
   ├── page.tsx           # Main page with tab navigation
   ├── layout.tsx         # Layout with title
   ├── loading.tsx        # Loading skeleton
   ├── error.tsx          # Error boundary
   └── _components/       # Route-specific components
       ├── AssortmentTabs.tsx
       ├── StoreSelector.tsx
       └── SubcategoryFilter.tsx

2. Create features/assortment/ structure:
   features/assortment/
   ├── api/
   │   ├── use-get-products.ts
   │   ├── use-get-stores.ts
   │   ├── use-get-sales.ts
   │   ├── use-run-optimization.ts
   │   ├── use-run-simulation.ts
   │   └── use-run-clustering.ts
   ├── components/
   │   └── (will be added in later sessions)
   ├── hooks/
   │   └── use-assortment-filters.ts
   ├── store/
   │   └── use-assortment-store.ts
   └── types/
       └── index.ts

3. Create the Zustand store (features/assortment/store/use-assortment-store.ts):
   interface AssortmentState {
     selectedStore: string | null
     selectedSubcategories: string[]
     activeTab: 'dashboard' | 'cdt' | 'optimizer' | 'simulation' | 'clustering' | 'planogram'
     optimizationConstraints: OptimizationConstraints
     // Actions
     setSelectedStore: (store: string | null) => void
     toggleSubcategory: (subcategory: string) => void
     setActiveTab: (tab: string) => void
     setConstraints: (constraints: Partial<OptimizationConstraints>) => void
     reset: () => void
   }

4. Create React Query hooks (features/assortment/api/):
   - Each hook should use the client from lib/hono.ts
   - Handle loading, error states
   - Include proper TypeScript types

5. Create TypeScript types (features/assortment/types/index.ts):
   - Product, Store, Sale interfaces
   - OptimizationConstraints, OptimizationResult
   - SimulationConfig, SimulationResult
   - ClusteringResult, ClusterProfile

6. Create the main page (app/(inventory)/risk/merchandizing-optimizer/page.tsx):
   - Tab navigation using existing UI components
   - Store selector in sidebar area
   - Subcategory filter chips
   - Content area for each tab (placeholder for now)

7. Add route to sidebar navigation (update components/SidebarDemo.tsx):
   - Add "Assortment Optimizer" under Risk section
   - Use appropriate icon

Style using Tailwind CSS and existing UI components from components/ui/.
```

---

## SESSION 10: Dashboard Component
**Model:** Sonnet 4.5

```
Build the Dashboard tab component for Assortment Optimizer.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/components/dashboard.py

Working in: d:/merchandizing-optimizer/

1. Create features/assortment/components/dashboard/:
   ├── Dashboard.tsx           # Main dashboard container
   ├── KPICard.tsx            # Metric card component
   ├── KPIGrid.tsx            # Grid of KPI cards
   ├── SalesTrendChart.tsx    # Weekly sales line chart
   ├── TopPerformersChart.tsx # Bar chart for top SKUs
   ├── CategoryMixChart.tsx   # Pie/donut chart
   └── BrandTierChart.tsx     # Grouped bar chart

2. Create KPICard component:
   interface KPICardProps {
     title: string
     value: number
     previousValue?: number
     format: 'currency' | 'percent' | 'number' | 'decimal'
     icon?: React.ReactNode
     trend?: 'up' | 'down' | 'neutral'
   }
   - Show value with proper formatting
   - Show change percentage if previousValue provided
   - Color-coded trend indicator

3. Create KPIGrid with these metrics:
   - Total Revenue (currency)
   - Total Profit (currency)
   - Profit Margin (percent)
   - GMROI (decimal)
   - Active SKUs (number)
   - Inventory Turns (decimal)
   - Sales per Linear Foot (currency)
   - Linear Feet (number)

4. Create SalesTrendChart:
   - Line chart using Recharts
   - X-axis: Week number
   - Y-axis: Revenue/Units (toggle)
   - Show trend line
   - Tooltip with details

5. Create TopPerformersChart:
   - Horizontal bar chart
   - Top 10 by Revenue, Profit, or Units (dropdown)
   - Color by subcategory
   - Show value labels

6. Create CategoryMixChart:
   - Donut chart
   - Show subcategory breakdown
   - Percentage labels
   - Legend

7. Create BrandTierChart:
   - Grouped bar chart
   - Group by subcategory
   - Bars for each brand tier
   - Show revenue contribution

8. Create Dashboard.tsx:
   - Responsive grid layout
   - KPI cards at top
   - Charts below in 2x2 grid
   - Use useGetProducts, useGetSales hooks
   - Calculate metrics from data
   - Loading skeletons while fetching

9. Add to page.tsx:
   - Import Dashboard
   - Show when activeTab === 'dashboard'

Use Recharts for all visualizations. Match the metrics from the Streamlit dashboard.
```

---

## Quick Reference

| Session | Model | Main Deliverable |
|---------|-------|------------------|
| 6 | Opus 4.5 | Greedy optimizer service |
| 7 | Opus 4.5 | Monte Carlo simulation service |
| 8 | Sonnet 4.5 | K-Means/GMM clustering service |
| 9 | Sonnet 4.5 | Frontend route + state setup |
| 10 | Sonnet 4.5 | KPI dashboard with charts |
