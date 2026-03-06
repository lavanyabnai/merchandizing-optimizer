# Merchandizing Optimizer - Setup Guide

Complete guide to run the application locally without Docker.

---

## Prerequisites

| Software | Version | Download |
|----------|---------|----------|
| PostgreSQL | 14+ | https://www.postgresql.org/download/windows/ |
| Python | 3.11+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| pnpm | Latest | `npm install -g pnpm` |

> **Note:** Redis is optional. The app works in degraded mode without it.

---

## Step 1: Setup PostgreSQL Database

### Option A: Using psql (Command Line)

```powershell
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE assortment_optimizer;

# Verify database was created
\l

# Exit
\q
```

### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases"
3. Select "Create" → "Database"
4. Enter name: `assortment_optimizer`
5. Click "Save"

---

## Step 2: Backend Setup

Open **PowerShell Terminal 1**:

```powershell
# Navigate to backend directory
cd d:\merchandizing-optimizer\assortment-optimizer-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install uv package manager
pip install uv

# Install all dependencies
uv pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Expected Output

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## Step 3: Frontend Setup

Open **PowerShell Terminal 2**:

```powershell
# Navigate to frontend directory
cd d:\merchandizing-optimizer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Expected Output

```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env

 ✓ Ready in X.Xs
```

---

## Step 4: Verify Installation

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main application |
| Backend API | http://localhost:8000 | REST API |
| API Documentation | http://localhost:8000/docs | Swagger UI |
| Health Check | http://localhost:8000/health | Service status |
| Detailed Health | http://localhost:8000/health/ready | Dependencies status |

### Quick Verification Commands

```powershell
# Check backend health
curl http://localhost:8000/health

# Check detailed health status
curl http://localhost:8000/health/ready

# View API documentation
start http://localhost:8000/docs
```

---

## Environment Configuration

### Backend (.env)

Location: `d:\merchandizing-optimizer\assortment-optimizer-service\.env`

```env
# Application Settings
APP_NAME="Assortment Optimizer"
APP_VERSION=1.0.0
ENVIRONMENT=development
DEBUG=true

# Server Settings
HOST=0.0.0.0
PORT=8000
WORKERS=1

# Database Settings (PostgreSQL)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/assortment_optimizer
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10

# Redis Settings (Optional)
REDIS_URL=redis://localhost:6379/0
REDIS_TTL_DEFAULT=3600

# Logging
LOG_LEVEL=DEBUG
LOG_FORMAT=text
```

### Frontend (.env)

Location: `d:\merchandizing-optimizer\.env`

```env
# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Backend Service
ASSORTMENT_SERVICE_URL="http://localhost:8000"
```

---

## Troubleshooting

### PostgreSQL Issues

#### Connection Refused

```powershell
# Check if PostgreSQL service is running
Get-Service postgresql*

# Start the service (adjust version number)
Start-Service postgresql-x64-16
```

#### Authentication Failed

```powershell
# Reset postgres password
psql -U postgres
ALTER USER postgres PASSWORD 'postgres';
\q
```

### Backend Issues

#### Port Already in Use

```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace <PID> with actual number)
taskkill /PID <PID> /F
```

#### Virtual Environment Issues

```powershell
# Remove and recreate
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install uv
uv pip install -r requirements.txt
```

#### Migration Errors

```powershell
# Reset migrations (WARNING: deletes data)
alembic downgrade base
alembic upgrade head
```

### Frontend Issues

#### pnpm Install Fails

```powershell
# Clear pnpm cache
pnpm store prune

# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

#### Port 3000 Already in Use

```powershell
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Running Without Redis

The application will run in **degraded mode** without Redis:

- Caching is disabled
- All core functionality works
- You'll see this warning in logs (safe to ignore):

```
WARNING: Failed to initialize Redis - caching disabled
```

### Optional: Install Redis on Windows

```powershell
# Using Chocolatey
choco install redis-64

# Start Redis
redis-server

# Or use Windows Subsystem for Linux (WSL)
wsl --install
sudo apt update && sudo apt install redis-server
sudo service redis-server start
```

---

## Daily Development Workflow

### Starting the Application

**Terminal 1 - Backend:**
```powershell
cd d:\merchandizing-optimizer\assortment-optimizer-service
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```powershell
cd d:\merchandizing-optimizer
pnpm dev
```

### Stopping the Application

Press `Ctrl+C` in each terminal.

---

## Useful Commands

### Backend

```powershell
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Format code
black app/
isort app/

# Type checking
mypy app/

# Linting
ruff check app/
```

### Frontend

```powershell
# Run tests
pnpm test

# Build for production
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

### Database

```powershell
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current migration
alembic current
```

---

## Project Structure

```
d:\merchandizing-optimizer\
├── .env                          # Frontend environment variables
├── package.json                  # Frontend dependencies
├── pnpm-lock.yaml               # Frontend lock file
├── src/                         # Frontend source code
│   ├── app/                     # Next.js app router
│   ├── components/              # React components
│   └── lib/                     # Utilities
│
└── assortment-optimizer-service/ # Backend service
    ├── .env                      # Backend environment variables
    ├── requirements.txt          # Python dependencies
    ├── alembic/                  # Database migrations
    └── app/                      # FastAPI application
        ├── api/                  # API endpoints
        ├── core/                 # Core utilities
        ├── db/                   # Database models
        └── services/             # Business logic
```

---

## Support

- **Backend API Docs:** http://localhost:8000/docs
- **Health Status:** http://localhost:8000/health/ready
- **Logs:** Check terminal output for real-time logs
