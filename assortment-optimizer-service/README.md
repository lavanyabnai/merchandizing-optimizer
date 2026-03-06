# Assortment Optimizer Microservice

A FastAPI-based microservice for retail assortment optimization using Multinomial Logit (MNL) demand models and Monte Carlo simulation.

## Features

- **Demand Modeling**: MNL-based demand prediction and substitution analysis
- **Optimization Engine**: Greedy algorithm for profit-maximizing assortment selection
- **Monte Carlo Simulation**: What-if scenario analysis with uncertainty quantification
- **Store Clustering**: K-Means and GMM-based store segmentation
- **RESTful API**: Well-documented API with OpenAPI/Swagger support

## Tech Stack

- **Framework**: FastAPI 0.109+
- **Database**: PostgreSQL 16 with SQLAlchemy 2.0
- **Cache**: Redis 7
- **Authentication**: JWT validation
- **Scientific Computing**: NumPy, Pandas, scikit-learn, SciPy

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   cd merchandizing-optimizer
   ```

2. **Set up environment variables**
   ```bash
   cd assortment-optimizer-service
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   # Start all services (API, PostgreSQL, Redis)
   docker-compose up -d

   # View logs
   docker-compose logs -f api

   # Stop services
   docker-compose down
   ```

4. **Or run locally without Docker**
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements-dev.txt

   # Run the application
   uvicorn app.main:app --reload --port 8000
   ```

### Access the Application

- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/api/v1/health

## Project Structure

```
assortment-optimizer-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Configuration management
│   ├── dependencies.py      # Dependency injection
│   ├── api/
│   │   └── v1/
│   │       ├── router.py    # API router
│   │       └── endpoints/   # API endpoints
│   ├── core/
│   │   ├── logging.py       # Structured logging
│   │   └── exceptions.py    # Custom exceptions
│   ├── models/              # Pydantic models
│   ├── schemas/             # Request/Response schemas
│   ├── services/            # Business logic
│   └── db/                  # Database layer
├── tests/
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
├── scripts/
│   └── init-db.sql         # Database initialization
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── requirements.txt
└── README.md
```

## API Endpoints

### Health
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/ready` - Readiness check with dependency status
- `GET /api/v1/health/live` - Liveness probe

### Data (Coming in Session 4)
- `POST /api/v1/data/seed` - Generate synthetic data
- `POST /api/v1/data/import/products` - Import products
- `GET /api/v1/data/export/products` - Export products

### Demand (Coming in Session 5)
- `POST /api/v1/demand/predict` - Predict demand
- `POST /api/v1/demand/substitution` - Calculate substitution matrix

### Optimization (Coming in Session 6)
- `POST /api/v1/optimize/run` - Run optimization
- `GET /api/v1/optimize/{run_id}` - Get results

### Simulation (Coming in Session 7)
- `POST /api/v1/simulate/run` - Run simulation
- `GET /api/v1/simulate/{run_id}` - Get results

### Clustering (Coming in Session 8)
- `POST /api/v1/cluster/run` - Run clustering
- `GET /api/v1/cluster/{run_id}` - Get results

## Development

### Code Quality

```bash
# Format code
black app tests

# Lint code
ruff check app tests

# Type check
mypy app

# Run all checks
pre-commit run --all-files
```

### Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_health.py

# Run integration tests only
pytest -m integration
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Run migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Configuration

All configuration is done via environment variables. See `.env.example` for available options.

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment name | `development` |
| `DATABASE_URL` | PostgreSQL connection URL | - |
| `REDIS_URL` | Redis connection URL | - |
| `JWT_SECRET_KEY` | JWT authentication secret key | - |
| `LOG_LEVEL` | Logging level | `INFO` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## Docker Commands

```bash
# Build image
docker build -t assortment-optimizer:latest .

# Run production container
docker run -p 8000:8000 --env-file .env assortment-optimizer:latest

# Start with optional tools (pgAdmin, Redis Commander)
docker-compose --profile tools up -d

# View container logs
docker-compose logs -f api

# Execute command in container
docker-compose exec api python -m pytest
```

## Monitoring

### Health Endpoints

- `/api/v1/health` - Returns service status
- `/api/v1/health/ready` - Checks database and Redis connectivity
- `/api/v1/health/live` - Simple liveness check

### Metrics (Coming in Session 20)

Prometheus metrics will be available at `/metrics`.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request
