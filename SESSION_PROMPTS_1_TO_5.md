# Session Implementation Prompts (1-5)

Use these prompts directly with Claude Code for each session.

---

## SESSION 1: Project Setup & Infrastructure
**Model:** Sonnet 4.5

```
I need to set up a Python FastAPI microservice for the Assortment Optimizer.

Create the following project structure at d:/merchandizing-optimizer/assortment-optimizer-service/:

1. Create directory structure:
   - app/ (main application)
   - app/api/v1/ (API routes)
   - app/core/ (security, logging, config)
   - app/models/ (Pydantic models)
   - app/schemas/ (request/response schemas)
   - app/services/ (business logic)
   - app/db/ (database layer)
   - tests/unit/
   - tests/integration/

2. Create these files:
   - app/main.py - FastAPI app with CORS, error handling, health endpoint
   - app/config.py - Pydantic Settings for environment config
   - app/dependencies.py - Dependency injection setup
   - app/api/v1/router.py - Main API router
   - app/core/logging.py - Structured logging setup
   - pyproject.toml - Project config with dependencies
   - requirements.txt - Pin versions: fastapi>=0.109.0, uvicorn, pydantic>=2.0, python-dotenv
   - Dockerfile - Multi-stage build for production
   - docker-compose.yml - Local dev with PostgreSQL and Redis
   - .env.example - Template for environment variables
   - README.md - Setup instructions

3. The health endpoint should return: {"status": "healthy", "service": "assortment-optimizer", "version": "1.0.0"}

4. Configure CORS to allow requests from http://localhost:3000

5. Add pre-commit config for black, ruff, and mypy

Make sure all files are production-ready with proper error handling.
```

---

## SESSION 2: Database Schema & Data Models
**Model:** Sonnet 4.5

```
Working in d:/merchandizing-optimizer/assortment-optimizer-service/

Set up the database layer with SQLAlchemy and Alembic:

1. Install and configure: sqlalchemy>=2.0, alembic, asyncpg, psycopg2-binary

2. Create app/db/database.py:
   - Async database engine setup
   - Session factory
   - Base model class

3. Create app/db/models.py with these SQLAlchemy models:
   - AssortmentProduct: id (UUID), sku, name, brand, brand_tier (Premium/National A/National B/Store Brand), subcategory, size, pack_type, price, cost, width_inches, space_elasticity, created_at, updated_at
   - AssortmentStore: id, store_code, name, format (Express/Standard/Superstore), location_type, income_index, total_facings, weekly_traffic, created_at
   - AssortmentSale: id, product_id (FK), store_id (FK), week_number, year, units_sold, revenue, facings, on_promotion, created_at
   - SwitchingMatrix: id, from_brand, to_brand, switching_probability, created_at
   - OptimizationRun: id, store_id (FK), run_date, constraints (JSONB), results (JSONB), profit_lift_pct, status
   - SimulationRun: id, optimization_run_id (FK), scenario_type, parameters (JSONB), results (JSONB), num_trials, created_at

4. Create app/schemas/ with Pydantic schemas:
   - product.py: ProductCreate, ProductUpdate, ProductResponse
   - store.py: StoreCreate, StoreUpdate, StoreResponse
   - sale.py: SaleCreate, SaleResponse
   - optimization.py: OptimizationRequest, OptimizationResponse
   - simulation.py: SimulationRequest, SimulationResponse

5. Create app/db/repository.py with async CRUD operations using repository pattern

6. Set up Alembic:
   - alembic init alembic
   - Configure alembic/env.py for async
   - Create initial migration

Add proper indexes on foreign keys and frequently queried columns.
```

---

## SESSION 3: Authentication & API Gateway Integration
**Model:** Opus 4.5

```
I need to integrate authentication between the parent Next.js app and the FastAPI microservice.

PART 1 - FastAPI (d:/merchandizing-optimizer/assortment-optimizer-service/):

1. Install: pyjwt, cryptography, httpx

2. Create app/core/security.py:
   - Function to fetch JWKS
   - JWT token verification using public keys
   - Extract user_id and session claims from token
   - Cache JWKS with TTL (refresh every hour)

3. Create app/core/auth.py:
   - FastAPI dependency: get_current_user() that validates Authorization header
   - Returns user dict with user_id, email, etc.
   - Raises HTTPException 401 if invalid

4. Create app/api/v1/endpoints/protected.py:
   - Example protected endpoint using Depends(get_current_user)

PART 2 - Parent App (d:/merchandizing-optimizer/):

5. Create app/api/[[...route]]/assortment.ts:
   - Hono routes that proxy to the microservice
   - Use auth middleware
   - Forward Authorization header to microservice
   - Add X-User-Id header from auth session
   - Handle all HTTP methods (GET, POST, PATCH, DELETE)
   - Proper error handling and response forwarding

6. Update app/api/[[...route]]/route.ts to include the assortment routes

7. Add ASSORTMENT_SERVICE_URL to .env.example

8. Create a simple test endpoint to verify the auth flow works end-to-end

Include proper error messages for: missing token, expired token, invalid signature.
```

---

## SESSION 4: Migrate Core Data Layer
**Model:** Sonnet 4.5

```
Migrate the data generator from the Streamlit app to the FastAPI microservice.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/data/generator.py

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Create app/services/data_generator.py:
   - DataGeneratorService class
   - generate_products(count=80) - Create beverage products across 4 subcategories (Soft Drinks, Juices, Water, Energy Drinks) with brands (Coca-Cola, Pepsi, Tropicana, Red Bull, etc.)
   - generate_stores(count=25) - Create stores with format, location, income attributes
   - generate_sales(weeks=52) - Create sales data with seasonality
   - generate_switching_matrix() - Consumer switching probabilities
   - Use the exact same logic and data distributions from generator.py

2. Create app/api/v1/endpoints/data.py with endpoints:
   - POST /api/v1/data/seed - Generate and save synthetic data
   - POST /api/v1/data/import/products - Import from CSV/JSON
   - POST /api/v1/data/import/stores - Import from CSV/JSON
   - POST /api/v1/data/import/sales - Import from CSV/JSON
   - GET /api/v1/data/export/products - Export to JSON
   - GET /api/v1/data/export/stores - Export to JSON

3. Create app/utils/file_parser.py:
   - parse_csv() - Handle CSV uploads
   - parse_json() - Handle JSON uploads
   - validate_schema() - Validate imported data

4. Add batch insert support for large datasets (use executemany)

5. Write unit tests in tests/unit/test_data_generator.py:
   - Test product generation produces correct distributions
   - Test store generation has correct attributes
   - Test sales data has seasonality patterns

Ensure the generated data matches the original Streamlit app exactly.
```

---

## SESSION 5: Migrate Demand Model
**Model:** Opus 4.5

```
Migrate the Multinomial Logit demand model from Streamlit to FastAPI.

Reference: d:/merchandizing-optimizer/assortment-optimizer-main/models/demand.py

Working in: d:/merchandizing-optimizer/assortment-optimizer-service/

1. Create app/services/demand_model.py:

   class DemandModelConfig(BaseModel):
       brand_utilities: dict = {"Premium": 0.8, "National A": 0.6, "National B": 0.3, "Store Brand": 0.0}
       size_utilities: dict = {"12oz": 0.3, "20oz": 0.5, "1L": 0.4, "2L": 0.2}
       price_sensitivity: float = -0.5
       promotion_boost: float = 0.8
       price_elasticity: float = -1.8

   class DemandModelService:
       - calculate_utility(brand_tier, price, size, on_promotion) -> float
       - predict_choice_probabilities(products: List[Product]) -> Dict[str, float]
       - calculate_substitution_matrix(products: List[Product]) -> np.ndarray
       - estimate_demand_transfer(removed_sku_id, products, sales) -> Dict[str, float]
       - calculate_price_elasticity(product, price_change_pct) -> float
       - calculate_space_elasticity(product, facing_change) -> float
       - calculate_cannibalization(new_product, existing_products) -> Dict[str, float]

2. Implement the MNL formula exactly as in the original:
   U_i = β₀ + β_brand[tier] + β_price × (price/5) + β_size[size] + β_promo × promo
   P(choose i) = exp(U_i) / Σexp(U_j)

3. Implement similarity scoring for substitution:
   - Brand similarity: 0.30 weight
   - Size similarity: 0.20 weight
   - Price tier similarity: 0.20 weight
   - Subcategory similarity: 0.20 weight
   - Flavor similarity: 0.10 weight

4. Create app/api/v1/endpoints/demand.py:
   - POST /api/v1/demand/predict - Predict demand for products
   - POST /api/v1/demand/substitution - Get substitution matrix
   - POST /api/v1/demand/transfer - Estimate demand transfer
   - POST /api/v1/demand/elasticity - Calculate elasticities
   - GET /api/v1/demand/switching-matrix - Get switching probabilities

5. Add Redis caching for expensive matrix calculations (TTL 1 hour)

6. Write comprehensive unit tests:
   - Test MNL probabilities sum to 1.0
   - Test higher utility = higher probability
   - Test substitution transfers are valid (sum <= removed demand)
   - Test elasticity signs are correct (negative for price, positive for space)

Ensure numerical accuracy matches the original implementation.
```

---

## Quick Reference

| Session | Model | Main Deliverable |
|---------|-------|------------------|
| 1 | Sonnet 4.5 | FastAPI skeleton + Docker |
| 2 | Sonnet 4.5 | Database schema + migrations |
| 3 | Opus 4.5 | Auth integration |
| 4 | Sonnet 4.5 | Data generator service |
| 5 | Opus 4.5 | MNL demand model service |
