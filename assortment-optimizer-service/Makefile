# Assortment Optimizer Service - Makefile
# ========================================
#
# Common commands for development and data management.
#
# Usage:
#   make help           - Show this help message
#   make install        - Install dependencies
#   make dev            - Run development server
#   make test           - Run tests
#   make seed           - Seed database with demo data
#   make migrate        - Run database migrations

.PHONY: help install dev test lint format clean \
        db-migrate db-upgrade db-downgrade db-revision \
        seed seed-small seed-medium seed-large \
        data-import data-export data-backup data-restore data-clear data-validate data-stats \
        docker-build docker-run docker-up docker-down

# Default target
.DEFAULT_GOAL := help

# Python and UV settings
PYTHON := python
UV := uv
CLI := $(PYTHON) -m scripts.cli

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

# =============================================================================
# Help
# =============================================================================

help:
	@echo ""
	@echo "$(BLUE)Assortment Optimizer Service$(NC)"
	@echo "============================="
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make install         Install dependencies with UV"
	@echo "  make dev             Run development server"
	@echo "  make test            Run test suite"
	@echo "  make lint            Run linting"
	@echo "  make format          Format code"
	@echo "  make clean           Clean build artifacts"
	@echo ""
	@echo "$(GREEN)Database Migrations:$(NC)"
	@echo "  make db-migrate      Run pending migrations"
	@echo "  make db-upgrade      Alias for db-migrate"
	@echo "  make db-downgrade    Rollback last migration"
	@echo "  make db-revision     Create new migration (MSG required)"
	@echo ""
	@echo "$(GREEN)Data Seeding:$(NC)"
	@echo "  make seed            Seed database (default: small)"
	@echo "  make seed-small      Seed with small dataset (~36 products, 20 stores)"
	@echo "  make seed-medium     Seed with medium dataset (~80 products, 50 stores)"
	@echo "  make seed-large      Seed with large dataset (~150 products, 100 stores)"
	@echo ""
	@echo "$(GREEN)Data Management:$(NC)"
	@echo "  make data-import     Import data from files (ENTITY, FILE required)"
	@echo "  make data-export     Export data to file (ENTITY, FILE required)"
	@echo "  make data-backup     Backup all data to directory"
	@echo "  make data-restore    Restore data from backup directory"
	@echo "  make data-clear      Clear database (CONFIRM=yes required)"
	@echo "  make data-validate   Validate data files"
	@echo "  make data-stats      Show database statistics"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@echo "  make docker-build    Build Docker image"
	@echo "  make docker-run      Run Docker container"
	@echo "  make docker-up       Start with docker-compose"
	@echo "  make docker-down     Stop docker-compose"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make seed-medium"
	@echo "  make data-import ENTITY=products FILE=products.csv"
	@echo "  make data-export ENTITY=stores FILE=stores.json FORMAT=json"
	@echo "  make data-backup DIR=./backups/2024-01-15"
	@echo "  make db-revision MSG=\"add_new_column\""
	@echo ""

# =============================================================================
# Development
# =============================================================================

install:
	$(UV) sync

dev:
	$(UV) run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	$(UV) run pytest tests/ -v

test-cov:
	$(UV) run pytest tests/ -v --cov=app --cov-report=term-missing

lint:
	$(UV) run ruff check app/ tests/ scripts/

format:
	$(UV) run ruff format app/ tests/ scripts/
	$(UV) run ruff check --fix app/ tests/ scripts/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

# =============================================================================
# Database Migrations
# =============================================================================

db-migrate:
	$(UV) run alembic upgrade head

db-upgrade: db-migrate

db-downgrade:
	$(UV) run alembic downgrade -1

db-revision:
ifndef MSG
	$(error MSG is required. Usage: make db-revision MSG="description")
endif
	$(UV) run alembic revision --autogenerate -m "$(MSG)"

db-history:
	$(UV) run alembic history

db-current:
	$(UV) run alembic current

# =============================================================================
# Data Seeding
# =============================================================================

seed: seed-small

seed-small:
	$(UV) run $(CLI) seed --size small

seed-medium:
	$(UV) run $(CLI) seed --size medium

seed-large:
	$(UV) run $(CLI) seed --size large

# =============================================================================
# Data Management
# =============================================================================

data-import:
ifndef ENTITY
	$(error ENTITY is required (products, stores, sales))
endif
ifndef FILE
	$(error FILE is required)
endif
	$(UV) run $(CLI) import-data $(ENTITY) $(FILE)

data-export:
ifndef ENTITY
	$(error ENTITY is required (products, stores, sales))
endif
ifndef FILE
	$(error FILE is required)
endif
ifdef FORMAT
	$(UV) run $(CLI) export-data $(ENTITY) $(FILE) --format $(FORMAT)
else
	$(UV) run $(CLI) export-data $(ENTITY) $(FILE)
endif

data-backup:
ifdef DIR
	$(UV) run $(CLI) backup $(DIR)
else
	$(UV) run $(CLI) backup ./backups/$$(date +%Y-%m-%d_%H%M%S)
endif

data-restore:
ifndef DIR
	$(error DIR is required. Usage: make data-restore DIR=./backups/2024-01-15)
endif
	$(UV) run $(CLI) restore $(DIR)

data-clear:
ifndef CONFIRM
	$(error CONFIRM=yes is required to clear database)
endif
ifneq ($(CONFIRM),yes)
	$(error CONFIRM must be 'yes' to clear database)
endif
	$(UV) run $(CLI) clear --yes

data-validate:
ifndef FILE
	$(error FILE is required)
endif
ifdef ENTITY
	$(UV) run $(CLI) validate $(FILE) --entity $(ENTITY)
else
	$(UV) run $(CLI) validate $(FILE)
endif

data-stats:
	$(UV) run $(CLI) stats

# =============================================================================
# Docker
# =============================================================================

docker-build:
	docker build -t assortment-optimizer-service .

docker-run:
	docker run -p 8000:8000 \
		-e DATABASE_URL="$(DATABASE_URL)" \
		-e RUN_MIGRATIONS=true \
		assortment-optimizer-service

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f assortment-optimizer-service
