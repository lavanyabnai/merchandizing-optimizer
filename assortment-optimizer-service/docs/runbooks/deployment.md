# Deployment Runbook

## Overview

This runbook covers the deployment process for the Assortment Optimizer Service.

## Pre-Deployment Checklist

### Code Review
- [ ] All changes have been reviewed and approved
- [ ] Tests are passing in CI/CD pipeline
- [ ] No known critical issues in the release

### Environment Verification
- [ ] Staging environment is accessible
- [ ] Production environment is accessible
- [ ] Database migrations are ready (if applicable)
- [ ] Environment variables are configured

### Communication
- [ ] Team has been notified of deployment window
- [ ] Stakeholders are aware of any downtime
- [ ] On-call engineer is available

## Deployment Steps

### 1. Pre-Deployment

```bash
# Pull latest code
cd assortment-optimizer-service
git fetch origin
git checkout main
git pull origin main

# Verify the release tag
git tag -l "v*" --sort=-v:refname | head -5

# Build and test locally (optional)
make test
```

### 2. Deploy to Staging

```bash
# Set environment
export ENVIRONMENT=staging

# Build Docker image
docker build -f Dockerfile.prod -t assortment-optimizer:$VERSION .

# Push to container registry
docker tag assortment-optimizer:$VERSION registry.example.com/assortment-optimizer:$VERSION
docker push registry.example.com/assortment-optimizer:$VERSION

# Deploy to staging
docker-compose -f docker-compose.staging.yml pull
docker-compose -f docker-compose.staging.yml up -d

# Run database migrations
docker-compose -f docker-compose.staging.yml exec api-1 alembic upgrade head
```

### 3. Staging Verification

```bash
# Check service health
curl -s https://staging-api.example.com/health | jq .

# Check metrics endpoint
curl -s https://staging-api.example.com/metrics | head -20

# Run smoke tests
make test-smoke ENVIRONMENT=staging
```

**Manual Verification Checklist:**
- [ ] Health endpoint returns healthy status
- [ ] API documentation loads (/docs)
- [ ] Core endpoints respond correctly:
  - [ ] GET /api/v1/products
  - [ ] GET /api/v1/stores
  - [ ] POST /api/v1/optimize (with sample payload)
- [ ] Metrics are being collected
- [ ] No errors in logs

### 4. Deploy to Production

**Only proceed after staging verification is complete!**

```bash
# Set environment
export ENVIRONMENT=production

# Deploy to production
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d --no-deps api-1

# Wait for health check
sleep 30

# Verify first instance
curl -s http://api-1:8000/health/live

# Deploy second instance
docker-compose -f docker-compose.prod.yml up -d --no-deps api-2

# Wait for health check
sleep 30

# Verify second instance
curl -s http://api-2:8000/health/live

# Run database migrations (if needed)
docker-compose -f docker-compose.prod.yml exec api-1 alembic upgrade head
```

### 5. Production Verification

```bash
# Check service health
curl -s https://api.example.com/health | jq .

# Check load balancer
for i in {1..10}; do
  curl -s https://api.example.com/health | jq .instance
done

# Verify metrics
curl -s https://api.example.com/metrics | grep http_requests_total
```

**Production Verification Checklist:**
- [ ] Both API instances are healthy
- [ ] Load balancer is distributing traffic
- [ ] No error spikes in Grafana
- [ ] Response times are within normal range
- [ ] Database connections are healthy
- [ ] Redis cache is connected

### 6. Post-Deployment

```bash
# Tag the deployment
git tag -a "deploy-$(date +%Y%m%d-%H%M%S)" -m "Production deployment"
git push origin --tags

# Update deployment log
echo "$(date): Deployed $VERSION to production" >> deployments.log
```

**Post-Deployment Actions:**
- [ ] Update deployment tracking (Jira/Linear)
- [ ] Notify team of successful deployment
- [ ] Monitor dashboards for 30 minutes
- [ ] Close deployment ticket

## Rollback Procedure

### Quick Rollback (< 5 minutes)

If issues are detected immediately after deployment:

```bash
# Get previous image version
PREVIOUS_VERSION=$(docker images registry.example.com/assortment-optimizer --format '{{.Tag}}' | sed -n '2p')

# Rollback to previous version
docker-compose -f docker-compose.prod.yml stop api-1 api-2
docker-compose -f docker-compose.prod.yml pull registry.example.com/assortment-optimizer:$PREVIOUS_VERSION
docker-compose -f docker-compose.prod.yml up -d api-1 api-2

# Verify rollback
curl -s https://api.example.com/health | jq .
```

### Database Rollback

If database migrations need to be rolled back:

```bash
# Check current migration
docker-compose -f docker-compose.prod.yml exec api-1 alembic current

# Rollback one migration
docker-compose -f docker-compose.prod.yml exec api-1 alembic downgrade -1

# Rollback to specific revision
docker-compose -f docker-compose.prod.yml exec api-1 alembic downgrade <revision_id>
```

### Full Rollback

For complete service restoration:

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restore from backup (if database changes)
./scripts/restore-backup.sh $BACKUP_DATE

# Start with previous version
export VERSION=$PREVIOUS_VERSION
docker-compose -f docker-compose.prod.yml up -d

# Verify services
curl -s https://api.example.com/health | jq .
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://host:6379/0` |
| `CLERK_SECRET_KEY` | Clerk authentication secret | `sk_live_...` |
| `ENVIRONMENT` | Environment name | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging verbosity | `INFO` |
| `SENTRY_DSN` | Sentry error tracking | - |
| `APP_VERSION` | Application version | `1.0.0` |

## Monitoring During Deployment

### Key Metrics to Watch

1. **Request Rate**: Should remain stable or increase slightly
2. **Error Rate**: Should stay below 1%
3. **P95 Latency**: Should stay below 500ms
4. **Database Connections**: Should not spike
5. **Memory Usage**: Should remain stable

### Grafana Dashboards

- Main Dashboard: `https://grafana.example.com/d/assortment-optimizer-main`
- Infrastructure: `https://grafana.example.com/d/assortment-optimizer-infra`

### Alert Channels

- Slack: #assortment-optimizer-alerts
- PagerDuty: assortment-optimizer service

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api-1 --tail=100

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats
```

### Database Connection Issues

```bash
# Test database connectivity
docker-compose -f docker-compose.prod.yml exec api-1 python -c "
from app.db.database import get_pool_status
import asyncio
asyncio.run(get_pool_status())
"

# Check PostgreSQL status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready
```

### Redis Connection Issues

```bash
# Test Redis connectivity
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check Redis memory
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory
```

## Emergency Contacts

| Role | Contact | Method |
|------|---------|--------|
| On-Call Engineer | PagerDuty | assortment-optimizer service |
| Team Lead | @teamlead | Slack |
| Database Admin | @dba-team | Slack |
| DevOps | @devops-team | Slack |

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2024-01-26 | DevOps Team | Initial version |
