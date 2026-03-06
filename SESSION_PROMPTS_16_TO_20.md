# Session Implementation Prompts (16-20)

---

## SESSION 16: Integration Testing - Frontend
**Model:** Sonnet 4.5

```
Write component and integration tests for the frontend.

Working in: d:/merchandizing-optimizer/

1. Set up testing infrastructure:
   - Install: @testing-library/react, @testing-library/jest-dom, vitest, @vitejs/plugin-react, msw
   - Create vitest.config.ts
   - Create tests/setup.ts with testing-library setup

2. Create MSW handlers for API mocking (tests/mocks/handlers.ts):
   - Mock all /api/assortment/* endpoints
   - Return realistic sample data
   - Support error scenarios

3. Create test utilities (tests/utils.tsx):
   - Custom render with providers (QueryClient, Zustand, etc.)
   - Mock data generators
   - Common assertions

4. Create component tests for Dashboard:
   tests/components/dashboard/
   ├── KPICard.test.tsx
   ├── SalesTrendChart.test.tsx
   ├── TopPerformersChart.test.tsx
   └── Dashboard.test.tsx

   Test cases:
   - KPICard displays value with correct formatting
   - KPICard shows trend indicator
   - SalesTrendChart renders with data
   - TopPerformersChart shows top 10 products
   - Dashboard shows loading skeleton initially
   - Dashboard displays all KPIs after loading

5. Create component tests for Optimizer:
   tests/components/optimizer/
   ├── ConstraintForm.test.tsx
   ├── ComparisonTable.test.tsx
   └── Optimizer.test.tsx

   Test cases:
   - ConstraintForm validates input ranges
   - ConstraintForm submits correct values
   - MustCarrySelector prevents duplicates with ExcludeSelector
   - ComparisonTable renders before/after data
   - Optimizer shows empty state initially
   - Optimizer displays results after run

6. Create component tests for Simulation:
   tests/components/simulation/
   ├── ScenarioSelector.test.tsx
   ├── DistributionChart.test.tsx
   └── Simulation.test.tsx

   Test cases:
   - ScenarioSelector switches between types
   - Each scenario form validates inputs
   - DistributionChart renders histogram
   - ConfidenceInterval shows correct percentiles
   - Simulation handles errors gracefully

7. Create component tests for CDT, Clustering, Planogram:
   - CDT: Sunburst renders, drill-down works
   - Clustering: Scatter plot renders, profiles display
   - Planogram: Shelf grid renders, products positioned correctly

8. Create integration tests (tests/integration/):
   test_optimization_flow.test.tsx:
   - User configures constraints
   - User clicks run
   - Loading state shown
   - Results displayed
   - User can compare with previous

   test_simulation_flow.test.tsx:
   - User selects scenario type
   - User configures parameters
   - User runs simulation
   - Distribution chart displayed
   - User can save scenario

9. Create hook tests (tests/hooks/):
   - test useGetProducts fetches and caches
   - test useRunOptimization handles success/error
   - test useAssortmentStore state updates

10. Run accessibility audit:
    - Install @axe-core/react
    - Add axe checks to component tests
    - Fix any accessibility violations

11. Configure coverage reporting:
    - Aim for >70% coverage
    - Generate HTML report
    - Add to CI pipeline

Run all tests: pnpm test
Generate coverage: pnpm test:coverage
```

---

## SESSION 17: End-to-End Testing
**Model:** Opus 4.5

```
Write end-to-end tests covering complete user journeys.

Working in: d:/merchandizing-optimizer/

1. Set up Playwright:
   - pnpm create playwright
   - Configure playwright.config.ts:
     - Base URL: http://localhost:3000
     - Projects: chromium, firefox, webkit
     - Retries: 2 on CI
     - Screenshots on failure

2. Create test fixtures (e2e/fixtures/):
   - auth.fixture.ts: Handle authentication
   - data.fixture.ts: Seed test data via API

3. Create page objects (e2e/pages/):
   AssortmentOptimizerPage.ts:
   class AssortmentOptimizerPage {
     constructor(page: Page)
     async goto()
     async selectStore(storeName: string)
     async selectTab(tab: string)
     async waitForDataLoad()
     // Dashboard
     async getKPIValue(metric: string): Promise<string>
     // Optimizer
     async setConstraint(name: string, value: number)
     async addMustCarry(sku: string)
     async runOptimization()
     async getOptimizationResult(): Promise<{profitLift: number}>
     // Simulation
     async selectScenario(type: string)
     async runSimulation()
     async getSimulationResult(): Promise<SimulationResult>
     // Clustering
     async runClustering()
     async getClusterCount(): Promise<number>
   }

4. Create E2E test: Complete optimization journey
   e2e/assortment/optimization-journey.spec.ts:

   test('complete optimization journey', async ({ page }) => {
     const assortment = new AssortmentOptimizerPage(page)

     // Navigate
     await assortment.goto()
     await assortment.waitForDataLoad()

     // View dashboard
     await assortment.selectTab('dashboard')
     const revenue = await assortment.getKPIValue('Total Revenue')
     expect(revenue).toMatch(/\$[\d,]+/)

     // Run optimization
     await assortment.selectTab('optimizer')
     await assortment.setConstraint('totalFacings', 100)
     await assortment.addMustCarry('SKU-001')
     await assortment.runOptimization()

     const result = await assortment.getOptimizationResult()
     expect(result.profitLift).toBeGreaterThan(0)
   })

5. Create E2E test: Simulation workflow
   e2e/assortment/simulation-workflow.spec.ts:

   test('run remove SKU simulation', async ({ page }) => {
     // Navigate to simulation tab
     // Select "Remove SKU" scenario
     // Select products to remove
     // Configure simulation parameters
     // Run simulation
     // Verify distribution chart appears
     // Verify confidence intervals displayed
     // Verify probability metrics shown
   })

   test('compare multiple scenarios', async ({ page }) => {
     // Run scenario 1
     // Save results
     // Run scenario 2
     // Compare results
     // Verify comparison table
   })

6. Create E2E test: Clustering analysis
   e2e/assortment/clustering-analysis.spec.ts:

   test('run store clustering', async ({ page }) => {
     // Navigate to clustering tab
     // Select K-Means method
     // Run clustering
     // Verify scatter plot renders
     // Verify cluster profiles appear
     // Verify recommendations generated
   })

7. Create E2E test: Cross-tab workflow
   e2e/assortment/cross-tab-workflow.spec.ts:

   test('optimization informs simulation', async ({ page }) => {
     // Run optimization
     // Note suggested changes
     // Go to simulation
     // Test removing suggested low-profit SKU
     // Verify simulation aligns with optimization
   })

8. Create E2E test: Error handling
   e2e/assortment/error-handling.spec.ts:

   test('handles API errors gracefully', async ({ page }) => {
     // Mock API to return 500
     // Navigate to page
     // Verify error message displayed
     // Verify retry option available
   })

   test('handles network timeout', async ({ page }) => {
     // Simulate slow network
     // Verify loading state persists
     // Verify timeout message
   })

9. Create E2E test: Data filtering
   e2e/assortment/filtering.spec.ts:

   test('store filter affects all tabs', async ({ page }) => {
     // Select specific store
     // Verify dashboard shows store data
     // Verify optimization uses store data
     // Verify planogram shows store layout
   })

   test('subcategory filter works', async ({ page }) => {
     // Deselect some subcategories
     // Verify filtered data in dashboard
     // Verify filtered options in optimizer
   })

10. Configure CI/CD:
    - Add Playwright to GitHub Actions
    - Run on PR and main branch
    - Upload test artifacts (screenshots, videos)
    - Require passing E2E for merge

Run: pnpm exec playwright test
Report: pnpm exec playwright show-report
```

---

## SESSION 18: Data Migration & Seeding
**Model:** Sonnet 4.5

```
Create data migration and seeding tools for the microservice.

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Create CLI tool (scripts/cli.py):
   Install: click, rich (for pretty output)

   @click.group()
   def cli():
       """Assortment Optimizer CLI"""
       pass

   @cli.command()
   @click.option('--products', default=80, help='Number of products')
   @click.option('--stores', default=25, help='Number of stores')
   @click.option('--weeks', default=52, help='Weeks of sales data')
   def seed(products, stores, weeks):
       """Seed database with synthetic data"""
       pass

   @cli.command()
   @click.argument('file_path')
   @click.option('--type', type=click.Choice(['products', 'stores', 'sales']))
   def import_data(file_path, type):
       """Import data from CSV/JSON file"""
       pass

   @cli.command()
   @click.option('--type', type=click.Choice(['products', 'stores', 'sales', 'all']))
   @click.option('--output', default='./export')
   def export_data(type, output):
       """Export data to JSON files"""
       pass

   @cli.command()
   def clear():
       """Clear all data (with confirmation)"""
       pass

   @cli.command()
   def validate():
       """Validate data integrity"""
       pass

2. Create data validation (app/utils/data_validator.py):
   class DataValidator:
       def validate_products(products: List[dict]) -> ValidationResult:
           # Check required fields
           # Check brand_tier is valid enum
           # Check price > cost
           # Check no duplicate SKUs

       def validate_stores(stores: List[dict]) -> ValidationResult:
           # Check required fields
           # Check format is valid enum
           # Check no duplicate store codes

       def validate_sales(sales: List[dict]) -> ValidationResult:
           # Check product_id exists
           # Check store_id exists
           # Check week_number 1-52
           # Check units_sold >= 0

       def validate_referential_integrity() -> ValidationResult:
           # All sales reference valid products
           # All sales reference valid stores

3. Create migration scripts (scripts/migrations/):
   migrate_from_streamlit.py:
   - Read data from Streamlit app's generated data
   - Transform to new schema format
   - Insert into database
   - Verify migration success

4. Create backup/restore (scripts/backup.py):
   @cli.command()
   @click.option('--output', default='./backups')
   def backup(output):
       """Create database backup"""
       # Export all tables to JSON
       # Include metadata (timestamp, version)
       # Compress to zip

   @cli.command()
   @click.argument('backup_file')
   def restore(backup_file):
       """Restore from backup"""
       # Verify backup integrity
       # Clear existing data
       # Import from backup
       # Validate restored data

5. Create sample data files (scripts/sample_data/):
   - products_sample.csv
   - stores_sample.csv
   - sales_sample.csv
   With headers and example rows

6. Create data transformation utilities (app/utils/transformers.py):
   - csv_to_products(file) -> List[Product]
   - json_to_products(file) -> List[Product]
   - products_to_csv(products) -> str
   - products_to_json(products) -> str
   Same for stores and sales

7. Add Makefile commands:
   seed:
       python -m scripts.cli seed

   import-sample:
       python -m scripts.cli import-data ./scripts/sample_data/products_sample.csv --type products

   backup:
       python -m scripts.cli backup --output ./backups

   validate:
       python -m scripts.cli validate

8. Create Docker entrypoint script (scripts/entrypoint.sh):
   - Wait for database
   - Run migrations
   - Optionally seed data (if SEED_DATA=true)
   - Start application

9. Write tests (tests/unit/test_data_tools.py):
   - test_seed_creates_correct_counts()
   - test_import_csv_parses_correctly()
   - test_export_produces_valid_json()
   - test_validation_catches_errors()
   - test_backup_restore_roundtrip()

10. Update README with data management instructions

Document all CLI commands with examples.
```

---

## SESSION 19: Performance Optimization
**Model:** Opus 4.5

```
Optimize performance of the microservice and frontend.

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/ and d:/merchandizing-optimizer/

PART 1 - Backend Performance:

1. Implement Redis caching (app/core/cache.py):
   import redis
   from functools import wraps
   import hashlib
   import json

   redis_client = redis.from_url(settings.REDIS_URL)

   def cache_result(ttl: int = 3600, prefix: str = ""):
       def decorator(func):
           @wraps(func)
           async def wrapper(*args, **kwargs):
               # Generate cache key from function name and args
               key = f"{prefix}:{func.__name__}:{hash_args(args, kwargs)}"

               # Check cache
               cached = redis_client.get(key)
               if cached:
                   return json.loads(cached)

               # Execute and cache
               result = await func(*args, **kwargs)
               redis_client.setex(key, ttl, json.dumps(result))
               return result
           return wrapper
       return decorator

   def invalidate_cache(pattern: str):
       """Invalidate all keys matching pattern"""
       for key in redis_client.scan_iter(pattern):
           redis_client.delete(key)

2. Apply caching to expensive operations:
   - Substitution matrix calculation (TTL: 1 hour)
   - Clustering results (TTL: 30 minutes)
   - Aggregated metrics (TTL: 5 minutes)

3. Optimize database queries:
   - Add indexes:
     CREATE INDEX idx_sales_product_store ON assortment_sales(product_id, store_id);
     CREATE INDEX idx_sales_week_year ON assortment_sales(week_number, year);
     CREATE INDEX idx_products_subcategory ON assortment_products(subcategory);

   - Use select_from with joins instead of lazy loading
   - Implement pagination for large result sets
   - Use EXPLAIN ANALYZE to verify query plans

4. Implement connection pooling:
   - Configure SQLAlchemy pool_size, max_overflow
   - Set appropriate pool_recycle time
   - Monitor connection usage

5. Optimize simulation with NumPy vectorization:
   # Before (slow):
   results = []
   for i in range(num_trials):
       result = simulate_single_trial(...)
       results.append(result)

   # After (fast):
   demand_samples = np.random.normal(mean, std, size=(num_trials, num_products))
   elasticity_samples = np.random.normal(e_mean, e_std, size=num_trials)
   results = vectorized_simulation(demand_samples, elasticity_samples, ...)

6. Add response compression:
   from fastapi.middleware.gzip import GZipMiddleware
   app.add_middleware(GZipMiddleware, minimum_size=1000)

7. Implement async database operations:
   - Use asyncpg for async PostgreSQL
   - Ensure all DB calls are awaited
   - Use connection pool properly

PART 2 - Frontend Performance:

8. Implement code splitting (next.config.ts):
   - Dynamic imports for heavy components
   - Lazy load chart libraries
   const SunburstChart = dynamic(() => import('./SunburstChart'), { ssr: false })

9. Optimize React Query:
   - Set appropriate staleTime (60s for most data)
   - Configure gcTime (garbage collection)
   - Use placeholderData for instant UI

10. Implement virtual scrolling for large tables:
    - Use AG-Grid's row virtualization
    - Configure rowBuffer appropriately

11. Optimize chart rendering:
    - Debounce resize handlers
    - Use React.memo for chart components
    - Limit data points for trend charts

12. Add image/asset optimization:
    - Use next/image for any images
    - Preload critical fonts
    - Minimize CSS

PART 3 - Benchmarking:

13. Create performance benchmarks (tests/benchmarks/):
    benchmark_optimization.py:
    - Time optimization with 80 products
    - Time optimization with 200 products
    - Memory usage during optimization

    benchmark_simulation.py:
    - Time 1000 vs 5000 vs 10000 trials
    - Memory usage during simulation

14. Set performance targets:
    - API response time: p50 < 100ms, p95 < 200ms, p99 < 500ms
    - Optimization (80 products): < 2 seconds
    - Simulation (5000 trials): < 5 seconds
    - Frontend LCP: < 2.5 seconds
    - Frontend TTI: < 3.5 seconds

15. Add performance monitoring:
    - Instrument with prometheus_client
    - Track request duration histogram
    - Track cache hit/miss ratio
    - Create Grafana dashboard

Run benchmarks and document results. Fix any operations not meeting targets.
```

---

## SESSION 20: Production Deployment & Monitoring
**Model:** Opus 4.5

```
Configure production deployment and monitoring.

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

PART 1 - Production Docker Configuration:

1. Create optimized Dockerfile (Dockerfile.prod):
   # Build stage
   FROM python:3.11-slim as builder
   WORKDIR /app
   RUN pip install --no-cache-dir poetry
   COPY pyproject.toml poetry.lock ./
   RUN poetry export -f requirements.txt -o requirements.txt --without-hashes
   RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

   # Production stage
   FROM python:3.11-slim
   WORKDIR /app
   COPY --from=builder /wheels /wheels
   RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels
   COPY app ./app
   COPY scripts ./scripts

   # Non-root user
   RUN useradd -m appuser && chown -R appuser:appuser /app
   USER appuser

   EXPOSE 8000
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

2. Create docker-compose.prod.yml:
   - Service: assortment-api (replicas: 2)
   - Service: postgres (with volume)
   - Service: redis (with persistence)
   - Service: nginx (reverse proxy, load balancer)
   - Health checks for all services
   - Resource limits

3. Create nginx.conf:
   - Load balancing to API replicas
   - SSL termination
   - Rate limiting
   - Gzip compression
   - Security headers

PART 2 - Monitoring Setup:

4. Add Prometheus metrics (app/core/metrics.py):
   from prometheus_client import Counter, Histogram, Gauge

   REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
   REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])
   OPTIMIZATION_DURATION = Histogram('optimization_duration_seconds', 'Optimization run duration')
   SIMULATION_DURATION = Histogram('simulation_duration_seconds', 'Simulation run duration')
   ACTIVE_OPTIMIZATIONS = Gauge('active_optimizations', 'Currently running optimizations')
   CACHE_HITS = Counter('cache_hits_total', 'Cache hit count', ['cache_name'])
   CACHE_MISSES = Counter('cache_misses_total', 'Cache miss count', ['cache_name'])

5. Create metrics middleware:
   @app.middleware("http")
   async def metrics_middleware(request, call_next):
       start_time = time.time()
       response = await call_next(request)
       duration = time.time() - start_time

       REQUEST_COUNT.labels(
           method=request.method,
           endpoint=request.url.path,
           status=response.status_code
       ).inc()

       REQUEST_LATENCY.labels(
           method=request.method,
           endpoint=request.url.path
       ).observe(duration)

       return response

6. Add /metrics endpoint:
   from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

   @app.get("/metrics")
   async def metrics():
       return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

7. Create Grafana dashboard (monitoring/grafana/dashboards/):
   assortment-optimizer.json:
   - Request rate panel
   - Error rate panel
   - Latency percentiles panel
   - Optimization duration panel
   - Cache hit ratio panel
   - Database connection pool panel

PART 3 - Logging & Error Tracking:

8. Configure structured logging (app/core/logging.py):
   import structlog

   structlog.configure(
       processors=[
           structlog.stdlib.add_log_level,
           structlog.stdlib.add_logger_name,
           structlog.processors.TimeStamper(fmt="iso"),
           structlog.processors.JSONRenderer()
       ]
   )

9. Add Sentry integration:
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration

   sentry_sdk.init(
       dsn=settings.SENTRY_DSN,
       integrations=[FastApiIntegration()],
       traces_sample_rate=0.1,
       environment=settings.ENVIRONMENT
   )

10. Create alerting rules (monitoring/prometheus/alerts.yml):
    - High error rate (>5% in 5 minutes)
    - High latency (p95 > 500ms for 5 minutes)
    - Service down (no requests for 1 minute)
    - High memory usage (>80%)
    - Database connection pool exhausted

PART 4 - Runbooks & Documentation:

11. Create runbooks (docs/runbooks/):
    deployment.md:
    - Pre-deployment checklist
    - Deployment steps
    - Rollback procedure
    - Post-deployment verification

    incident-response.md:
    - Severity levels
    - Escalation paths
    - Common issues and fixes
    - Contact information

    scaling.md:
    - Horizontal scaling procedure
    - Vertical scaling procedure
    - Auto-scaling configuration

12. Create API documentation:
    - Ensure OpenAPI spec is complete
    - Add examples for all endpoints
    - Document error responses
    - Add authentication instructions

13. Create architecture diagram (docs/architecture.md):
    - System components
    - Data flow
    - External dependencies
    - Failure modes

PART 5 - CI/CD Pipeline:

14. Create GitHub Actions workflow (.github/workflows/):
    deploy.yml:
    - Build Docker image
    - Run tests
    - Push to container registry
    - Deploy to staging
    - Run smoke tests
    - Deploy to production (manual approval)

15. Create health check endpoint:
    @app.get("/health")
    async def health():
        # Check database
        # Check Redis
        # Check external services
        return {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "version": settings.VERSION
        }

Final deliverables:
- Production-ready Docker setup
- Monitoring with Prometheus/Grafana
- Structured logging with Sentry
- Alerting rules
- Complete documentation
- CI/CD pipeline
```

---

## Quick Reference

| Session | Model | Main Deliverable |
|---------|-------|------------------|
| 16 | Sonnet 4.5 | Frontend test suite |
| 17 | Opus 4.5 | Playwright E2E tests |
| 18 | Sonnet 4.5 | Data CLI + migration tools |
| 19 | Opus 4.5 | Performance optimization |
| 20 | Opus 4.5 | Production deployment |

---

## Complete Session Summary

| # | Session | Model | Deliverable |
|---|---------|-------|-------------|
| 1 | Project Setup | Sonnet 4.5 | FastAPI skeleton + Docker |
| 2 | Database Schema | Sonnet 4.5 | SQLAlchemy models + migrations |
| 3 | Auth Integration | Opus 4.5 | JWT + API gateway |
| 4 | Data Layer | Sonnet 4.5 | Data generator service |
| 5 | Demand Model | Opus 4.5 | MNL demand service |
| 6 | Optimizer | Opus 4.5 | Greedy optimizer service |
| 7 | Simulation | Opus 4.5 | Monte Carlo service |
| 8 | Clustering | Sonnet 4.5 | K-Means/GMM service |
| 9 | Frontend Setup | Sonnet 4.5 | Routes + state management |
| 10 | Dashboard | Sonnet 4.5 | KPI cards + charts |
| 11 | CDT Analysis | Opus 4.5 | Sunburst + switching |
| 12 | Optimizer UI | Opus 4.5 | Constraint form + comparison |
| 13 | Simulation UI | Opus 4.5 | Scenario builder + distribution |
| 14 | Clustering/Planogram | Sonnet 4.5 | Scatter plot + shelf grid |
| 15 | Backend Tests | Opus 4.5 | Integration test suite |
| 16 | Frontend Tests | Sonnet 4.5 | Component tests |
| 17 | E2E Tests | Opus 4.5 | Playwright test suite |
| 18 | Data Tools | Sonnet 4.5 | CLI + migration |
| 19 | Performance | Opus 4.5 | Caching + optimization |
| 20 | Production | Opus 4.5 | Docker + monitoring |
