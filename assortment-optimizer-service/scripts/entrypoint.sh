#!/bin/bash
# Docker entrypoint script for Assortment Optimizer Service
#
# This script handles:
# - Database migration
# - Optional data seeding
# - Application startup
#
# Environment variables:
#   RUN_MIGRATIONS: Set to "true" to run migrations on startup (default: true)
#   SEED_DATABASE: Set to "true" to seed with demo data if empty (default: false)
#   SEED_SIZE: small, medium, or large (default: small)
#   WAIT_FOR_DB: Set to "true" to wait for database availability (default: true)
#   DB_WAIT_TIMEOUT: Seconds to wait for database (default: 30)

set -e

# Configuration
RUN_MIGRATIONS="${RUN_MIGRATIONS:-true}"
SEED_DATABASE="${SEED_DATABASE:-false}"
SEED_SIZE="${SEED_SIZE:-small}"
WAIT_FOR_DB="${WAIT_FOR_DB:-true}"
DB_WAIT_TIMEOUT="${DB_WAIT_TIMEOUT:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Wait for database to be available
wait_for_database() {
    if [ "$WAIT_FOR_DB" != "true" ]; then
        log_info "Skipping database wait (WAIT_FOR_DB=$WAIT_FOR_DB)"
        return 0
    fi

    log_info "Waiting for database to be available..."

    # Extract database host and port from DATABASE_URL
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL environment variable is not set"
        exit 1
    fi

    # Parse DATABASE_URL for host and port
    # Format: postgresql+asyncpg://user:password@host:port/dbname
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

    if [ -z "$DB_HOST" ]; then
        DB_HOST="localhost"
    fi
    if [ -z "$DB_PORT" ]; then
        DB_PORT="5432"
    fi

    log_info "Checking database at $DB_HOST:$DB_PORT"

    # Wait for database using Python
    python3 << EOF
import socket
import time
import sys

host = "$DB_HOST"
port = int("$DB_PORT")
timeout = int("$DB_WAIT_TIMEOUT")

start_time = time.time()
while time.time() - start_time < timeout:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            print(f"Database is available at {host}:{port}")
            sys.exit(0)
    except socket.error:
        pass
    time.sleep(1)

print(f"Timeout waiting for database at {host}:{port}")
sys.exit(1)
EOF

    if [ $? -ne 0 ]; then
        log_error "Failed to connect to database within ${DB_WAIT_TIMEOUT} seconds"
        exit 1
    fi

    log_info "Database is available"
}

# Run database migrations
run_migrations() {
    if [ "$RUN_MIGRATIONS" != "true" ]; then
        log_info "Skipping migrations (RUN_MIGRATIONS=$RUN_MIGRATIONS)"
        return 0
    fi

    log_info "Running database migrations..."

    # Check if alembic is available
    if ! command -v alembic &> /dev/null; then
        log_error "Alembic is not installed"
        exit 1
    fi

    # Run migrations
    alembic upgrade head

    if [ $? -eq 0 ]; then
        log_info "Migrations completed successfully"
    else
        log_error "Migration failed"
        exit 1
    fi
}

# Seed database with demo data
seed_database() {
    if [ "$SEED_DATABASE" != "true" ]; then
        log_info "Skipping database seeding (SEED_DATABASE=$SEED_DATABASE)"
        return 0
    fi

    log_info "Checking if database needs seeding..."

    # Check if database has data using CLI
    STATS=$(python -m scripts.cli stats 2>/dev/null || echo "")

    if echo "$STATS" | grep -q "Products.*0"; then
        log_info "Database is empty, seeding with $SEED_SIZE dataset..."
        python -m scripts.cli seed --size "$SEED_SIZE"

        if [ $? -eq 0 ]; then
            log_info "Database seeded successfully"
        else
            log_warn "Database seeding failed (non-critical)"
        fi
    else
        log_info "Database already has data, skipping seeding"
    fi
}

# Main entrypoint
main() {
    log_info "Starting Assortment Optimizer Service..."
    log_info "Configuration:"
    log_info "  RUN_MIGRATIONS: $RUN_MIGRATIONS"
    log_info "  SEED_DATABASE: $SEED_DATABASE"
    log_info "  SEED_SIZE: $SEED_SIZE"
    log_info "  WAIT_FOR_DB: $WAIT_FOR_DB"

    # Wait for database
    wait_for_database

    # Run migrations
    run_migrations

    # Seed database if requested
    seed_database

    log_info "Starting application..."

    # Execute the main command
    exec "$@"
}

# Run main function with all arguments
main "$@"
