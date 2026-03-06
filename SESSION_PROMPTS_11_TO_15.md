# Session Implementation Prompts (11-15)

---

## SESSION 11: CDT Analysis Component

**Model:** Opus 4.5

```
Build the Consumer Decision Tree (CDT) Analysis tab component.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/components/cdt_analysis.py

Working in: d:/merchandizing-optimizer/

1. Create features/assortment/components/cdt/:
   ├── CDTAnalysis.tsx           # Main container
   ├── SunburstChart.tsx         # Hierarchy visualization
   ├── AttributeImportance.tsx   # Bar chart of decision factors
   ├── SwitchingMatrix.tsx       # Heatmap of substitution
   └── SwitchingBehavior.tsx     # Switching breakdown cards

2. Create SunburstChart:
   - Use @nivo/sunburst or build with D3 + Recharts
   - Hierarchy: Category → Subcategory → Brand → Size
   - Data structure:
     interface CDTNode {
       id: string
       name: string
       value?: number  // revenue or units
       children?: CDTNode[]
       color?: string
     }
   - Interactive drill-down on click
   - Breadcrumb navigation to go back
   - Tooltip showing: name, value, % of parent
   - Color scheme by subcategory

3. Create AttributeImportance:
   - Horizontal bar chart
   - Attributes with importance weights:
     - Subcategory: 36%
     - Brand: 28%
     - Size/Pack: 21%
     - Price: 15%
   - Animated bars
   - Percentage labels
   - Info tooltip explaining each attribute

4. Create SwitchingMatrix:
   - Heatmap visualization
   - Rows: "From" brand/subcategory
   - Columns: "To" brand/subcategory
   - Cell color intensity = probability
   - Values: 0-100% switching probability
   - Tooltip: "X% of Brand A customers switch to Brand B"
   - Toggle between brand-level and subcategory-level

5. Create SwitchingBehavior:
   - Card layout showing what happens when item OOS:
     - Same brand, different flavor: 27%
     - Same brand, different size: 23%
     - Different brand, same category: 20%
     - Different category: 21%
     - Walk away: 9%
   - Visual icons for each behavior
   - Donut chart summary

6. Create CDTAnalysis.tsx:
   - Two-column layout
   - Left: Sunburst (large)
   - Right: Attribute importance + Switching behavior
   - Below: Full-width switching matrix
   - Section headers with "Understanding..." tooltips
   - Use API data to build hierarchy

7. Add API hook features/assortment/api/use-get-cdt-data.ts:
   - Fetch switching matrix from /api/v1/demand/switching-matrix
   - Transform product data into hierarchy

8. Add to page.tsx:
   - Show when activeTab === 'cdt'

The sunburst is the most complex part - ensure smooth animations and proper data transformation.
```

---

## SESSION 12: Optimizer Component

**Model:** Opus 4.5

```
Build the Optimizer tab component for running assortment optimization.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/components/optimization.py

Working in: d:/merchandizing-optimizer/

1. Create features/assortment/components/optimizer/:
   ├── Optimizer.tsx              # Main container
   ├── ConstraintForm.tsx         # Configuration form
   ├── MustCarrySelector.tsx      # Multi-select for must-carry SKUs
   ├── ExcludeSelector.tsx        # Multi-select for excluded SKUs
   ├── ComparisonTable.tsx        # Before/after comparison
   ├── ProfitLiftCard.tsx         # Profit improvement display
   ├── SpaceAllocationChart.tsx   # Category space allocation
   └── OptimizationHistory.tsx    # Past runs list

2. Create ConstraintForm using react-hook-form + zod:
   const constraintSchema = z.object({
     totalFacings: z.number().min(50).max(200),
     minFacingsPerSku: z.number().min(1).max(6),
     maxFacingsPerSku: z.number().min(1).max(10),
     minSkusPerSubcategory: z.number().min(1).max(10),
     minSkusPerPriceTier: z.number().min(1).max(5),
     minSkusPerBrand: z.number().min(0).max(10),
     maxSkusPerBrand: z.number().min(1).max(15),
   })
   - Slider inputs for numeric constraints
   - Real-time validation
   - Preset buttons: "Conservative", "Balanced", "Aggressive"
   - Reset to defaults button

3. Create MustCarrySelector and ExcludeSelector:
   - Searchable multi-select dropdown
   - Show product name, brand, subcategory
   - Chip display for selected items
   - Clear all button
   - Mutual exclusivity (can't be in both)

4. Create ComparisonTable:
   - AG-Grid or Kendo Grid
   - Columns: SKU, Brand, Subcategory, Current Facings, Optimized Facings, Change, Current Profit, Optimized Profit
   - Highlight rows: green for added facings, red for reduced, yellow for new
   - Sortable columns
   - Filter by change type
   - Export to CSV

5. Create ProfitLiftCard:
   - Large display of profit improvement
   - Current profit → Optimized profit
   - Percentage lift (highlighted)
   - Absolute dollar lift
   - Animated counter on load
   - Breakdown by source (space reallocation, assortment change)

6. Create SpaceAllocationChart:
   - Stacked bar chart
   - Current vs Optimized side by side
   - Segments for each subcategory
   - Show % of total space
   - Highlight changes

7. Create OptimizationHistory:
   - List of past optimization runs
   - Show: date, store, profit lift, status
   - Click to load results
   - Delete option

8. Create Optimizer.tsx:
   - Left panel: ConstraintForm + selectors
   - Right panel: Results (initially empty state)
   - "Run Optimization" button with loading state
   - Progress indicator during optimization
   - Results appear after completion
   - Tabs to switch between Comparison, Space Allocation, History

9. Add mutation hook features/assortment/api/use-run-optimization.ts:
   - POST to /api/v1/optimize/run
   - Handle loading, error, success states
   - Invalidate queries on success

10. Add to page.tsx when activeTab === 'optimizer'

Include proper loading states and error handling throughout.
```

---

## SESSION 13: Simulation Component

**Model:** Opus 4.5

```
Build the What-If Simulation tab component.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/components/simulation.py

Working in: d:/merchandizing-optimizer/

1. Create features/assortment/components/simulation/:
   ├── Simulation.tsx              # Main container
   ├── ScenarioSelector.tsx        # Scenario type tabs
   ├── RemoveSkuForm.tsx           # Remove SKU scenario config
   ├── AddSkuForm.tsx              # Add new SKU scenario config
   ├── ChangeFacingsForm.tsx       # Change facings scenario config
   ├── ChangePriceForm.tsx         # Price change scenario config
   ├── SimulationConfig.tsx        # Advanced config (trials, etc.)
   ├── DistributionChart.tsx       # Histogram/violin plot
   ├── ConfidenceInterval.tsx      # CI display
   ├── SimulationResults.tsx       # Results summary
   └── ScenarioComparison.tsx      # Compare multiple scenarios

2. Create ScenarioSelector:
   - Tab-style buttons for 4 scenario types:
     - Remove SKU(s): "What if we delist these products?"
     - Add New SKU: "What if we introduce a new product?"
     - Change Facings: "What if we reallocate shelf space?"
     - Change Price: "What if we adjust pricing?"
   - Icon for each type
   - Description text

3. Create scenario-specific forms:

   RemoveSkuForm:
   - Multi-select for SKUs to remove
   - Show current revenue/profit for selected
   - Preview estimated impact

   AddSkuForm:
   - Form fields: name, brand, subcategory, size, price, cost
   - "Similar to" dropdown to base estimates on existing product
   - Estimated cannibalization preview

   ChangeFacingsForm:
   - SKU selector
   - Current facings display
   - New facings slider
   - Show space elasticity for selected product

   ChangePriceForm:
   - SKU selector
   - Current price display
   - New price input or % change slider
   - Show price elasticity

4. Create SimulationConfig (collapsible advanced section):
   - Number of trials (slider: 1000-10000, default 5000)
   - Demand variability (CV: 0.05-0.30)
   - Show "Understanding Monte Carlo" tooltip

5. Create DistributionChart:
   - Histogram of simulation results
   - Overlay with KDE curve
   - Vertical lines for percentiles (5th, 50th, 95th)
   - Shaded regions for confidence intervals
   - X-axis: Profit/Revenue impact
   - Y-axis: Frequency
   - Toggle between revenue and profit view

6. Create ConfidenceInterval:
   - Visual range display
   - 5th percentile (pessimistic)
   - 50th percentile (expected)
   - 95th percentile (optimistic)
   - Color coding (red/yellow/green)
   - Probability badges: "X% chance positive", "Y% chance negative"

7. Create SimulationResults:
   - Summary cards:
     - Mean impact (revenue, profit)
     - Standard deviation
     - Probability of positive outcome
     - Probability of break-even or better
   - Risk assessment: Low/Medium/High based on variance

8. Create ScenarioComparison:
   - Side-by-side comparison of 2-3 scenarios
   - Table with key metrics
   - Overlay distributions on same chart
   - Recommendation: "Scenario A has higher expected value but more risk"

9. Create Simulation.tsx:
   - Scenario selector at top
   - Left: Scenario configuration form
   - Right: Results (empty state initially)
   - "Run Simulation" button with progress bar
   - Results panel with tabs: Distribution, Summary, Compare
   - Save scenario button

10. Add mutation hook features/assortment/api/use-run-simulation.ts

11. Add to page.tsx when activeTab === 'simulation'

Show real-time progress during simulation (poll status endpoint).
```

---

## SESSION 14: Clustering & Planogram Components

**Model:** Sonnet 4.5

```
Build the Store Clustering and Planogram tab components.

Reference:
- d:/merchandizing-optimizer/assortment-optimizer-main/components/clustering.py
- d:/merchandizing-optimizer/assortment-optimizer-main/components/planogram.py

Working in: d:/merchandizing-optimizer/

PART 1 - Clustering Component:

1. Create features/assortment/components/clustering/:
   ├── Clustering.tsx           # Main container
   ├── ClusterConfig.tsx        # Configuration form
   ├── ClusterScatter.tsx       # PCA scatter plot
   ├── ClusterProfiles.tsx      # Profile cards grid
   └── ClusterRecommendations.tsx  # Strategy recommendations

2. Create ClusterConfig:
   - Method selector: K-Means / GMM radio buttons
   - Number of clusters: Auto-detect checkbox or manual slider (2-10)
   - Feature selection: checkboxes for revenue, traffic, premium share, etc.
   - "Run Clustering" button

3. Create ClusterScatter:
   - 2D scatter plot using Recharts ScatterChart
   - X: PCA Component 1
   - Y: PCA Component 2
   - Color by cluster assignment
   - Point size by store revenue
   - Tooltip: store name, cluster, key metrics
   - Legend with cluster colors
   - Show silhouette score badge

4. Create ClusterProfiles:
   - Card grid (1 card per cluster)
   - Each card shows:
     - Cluster name/number with color
     - Store count
     - Avg revenue
     - Avg traffic
     - Premium share bar
     - Private label share bar
     - Dominant format badge
     - Dominant location badge

5. Create ClusterRecommendations:
   - Accordion or tabs per cluster
   - Recommendations list:
     - "Focus on premium brands" or "Emphasize value options"
     - "Increase energy drink facings" or "Reduce water SKUs"
     - Specific brand suggestions
   - Based on cluster characteristics

6. Create Clustering.tsx:
   - Config panel at top
   - Two-column layout below:
     - Left: Scatter plot (larger)
     - Right: Cluster profiles
   - Full-width recommendations section below

PART 2 - Planogram Component:

7. Create features/assortment/components/planogram/:
   ├── Planogram.tsx            # Main container
   ├── ShelfConfig.tsx          # Shelf configuration
   ├── ShelfDisplay.tsx         # Visual shelf grid
   ├── ProductTile.tsx          # Individual product on shelf
   └── SpaceMetrics.tsx         # Utilization metrics

8. Create ShelfConfig:
   - Shelf width slider (48-96 inches)
   - Number of shelves slider (3-6)
   - Apply button
   - Reset to default

9. Create ProductTile:
   interface ProductTileProps {
     product: Product
     facings: number
     width: number  // calculated from product.width_inches * facings
   }
   - Colored by subcategory:
     - Soft Drinks: Blue
     - Juices: Orange
     - Water: Light Blue
     - Energy Drinks: Green
   - Opacity/shade by brand tier (Premium darker)
   - Show product name (truncated)
   - Tooltip: full name, brand, size, facings, revenue

10. Create ShelfDisplay:
    - CSS Grid layout
    - Rows = shelves (numbered 1-N from top)
    - Products placed left-to-right based on facings width
    - Visual gaps between products
    - Shelf edge borders
    - Click product to see details

11. Create SpaceMetrics:
    - Total linear feet
    - Space utilization %
    - Revenue per linear foot
    - By subcategory breakdown table

12. Create Planogram.tsx:
    - ShelfConfig at top
    - ShelfDisplay (main visual)
    - SpaceMetrics sidebar or below
    - Toggle to show/hide labels
    - Export as image button (optional)

13. Add API hook features/assortment/api/use-get-planogram-data.ts:
    - Get optimized assortment with facings
    - Calculate shelf positions

14. Add both to page.tsx:
    - Show Clustering when activeTab === 'clustering'
    - Show Planogram when activeTab === 'planogram'

Make the planogram visually appealing and realistic.
```

---

## SESSION 15: Integration Testing - Backend

**Model:** Opus 4.5

```
Write comprehensive integration tests for the FastAPI microservice.

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Set up test infrastructure:
   - tests/conftest.py:
     - pytest fixtures for test database (use testcontainers or sqlite)
     - Test client fixture (httpx AsyncClient)
     - Auth token fixture (mock JWT)
     - Sample data fixtures (products, stores, sales)
   - Install: pytest, pytest-asyncio, httpx, testcontainers, factory-boy

2. Create tests/integration/test_data_endpoints.py:
   - test_seed_data_creates_products_stores_sales()
   - test_import_products_csv()
   - test_import_products_json()
   - test_import_invalid_data_returns_422()
   - test_export_products_returns_json()
   - test_unauthenticated_request_returns_401()

3. Create tests/integration/test_demand_endpoints.py:
   - test_predict_demand_returns_probabilities()
   - test_probabilities_sum_to_one()
   - test_substitution_matrix_shape()
   - test_demand_transfer_sums_correctly()
   - test_elasticity_calculations()

4. Create tests/integration/test_optimization_endpoints.py:
   - test_run_optimization_success()
   - test_optimization_respects_total_facings()
   - test_optimization_includes_must_carry()
   - test_optimization_excludes_excluded()
   - test_optimization_covers_subcategories()
   - test_optimization_covers_price_tiers()
   - test_get_optimization_results()
   - test_optimization_history_pagination()
   - test_compare_optimizations()

5. Create tests/integration/test_simulation_endpoints.py:
   - test_remove_sku_simulation()
   - test_add_sku_simulation()
   - test_change_facings_simulation()
   - test_change_price_simulation()
   - test_simulation_returns_distribution_stats()
   - test_simulation_confidence_intervals()
   - test_batch_simulation()

6. Create tests/integration/test_clustering_endpoints.py:
   - test_kmeans_clustering()
   - test_gmm_clustering()
   - test_auto_k_selection()
   - test_cluster_profiles_generated()
   - test_recommendations_generated()
   - test_pca_coordinates_returned()

7. Create tests/integration/test_auth_flow.py:
   - test_valid_token_passes()
   - test_expired_token_returns_401()
   - test_invalid_signature_returns_401()
   - test_missing_token_returns_401()
   - test_user_id_extracted_correctly()

8. Create tests/integration/test_full_workflow.py:
   - test_complete_optimization_workflow():
     # 1. Seed data
     # 2. Verify products/stores created
     # 3. Run optimization
     # 4. Verify results
     # 5. Run simulation on optimized assortment
     # 6. Run clustering
     # 7. Verify all results consistent

9. Add performance benchmarks in tests/integration/test_performance.py:
   - test_optimization_completes_under_5_seconds()
   - test_simulation_5000_trials_under_10_seconds()
   - test_clustering_25_stores_under_2_seconds()
   - test_api_response_time_under_200ms()

10. Configure pytest:
    - pytest.ini with async mode, markers
    - Coverage configuration (aim for >80%)
    - CI/CD integration (GitHub Actions)

11. Create tests/factories.py with factory-boy:
    - ProductFactory
    - StoreFactory
    - SaleFactory

Run all tests and fix any failures. Document any issues found.
```

---

## Quick Reference

| Session | Model      | Main Deliverable                    |
| ------- | ---------- | ----------------------------------- |
| 11      | Opus 4.5   | CDT sunburst + switching analysis   |
| 12      | Opus 4.5   | Optimization UI + comparison        |
| 13      | Opus 4.5   | Monte Carlo simulation UI           |
| 14      | Sonnet 4.5 | Clustering scatter + planogram grid |
| 15      | Opus 4.5   | Backend integration test suite      |
