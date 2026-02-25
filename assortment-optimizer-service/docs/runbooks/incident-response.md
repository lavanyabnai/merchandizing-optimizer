# Incident Response Runbook

## Overview

This runbook provides guidance for responding to incidents affecting the Assortment Optimizer Service.

## Severity Levels

### SEV1 - Critical
- Complete service outage
- Data loss or corruption
- Security breach
- **Response time:** Immediate
- **Escalation:** Immediate to on-call and leadership

### SEV2 - High
- Partial service degradation affecting >50% of users
- Core functionality broken (optimization, simulation)
- Database or cache unavailable
- **Response time:** 15 minutes
- **Escalation:** On-call engineer

### SEV3 - Medium
- Performance degradation
- Non-critical feature broken
- Elevated error rates (<5%)
- **Response time:** 1 hour
- **Escalation:** Team queue

### SEV4 - Low
- Minor bugs
- Documentation issues
- Enhancement requests
- **Response time:** Next business day
- **Escalation:** Backlog

## Escalation Paths

```
SEV1/SEV2 Alert
    │
    ├── On-Call Engineer (0-15 min)
    │   └── Acknowledge, initial triage
    │
    ├── Team Lead (15-30 min)
    │   └── If not resolved or escalating
    │
    ├── Engineering Manager (30-60 min)
    │   └── If customer impact or extended outage
    │
    └── VP Engineering (>1 hour)
        └── If major outage or PR/legal implications
```

## Common Issues and Fixes

### 1. Service Unavailable (503)

**Symptoms:**
- Health check failing
- Load balancer returning 503
- No response from API endpoints

**Diagnosis:**
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs api-1 --tail=200 | grep -i error

# Check system resources
docker stats --no-stream
```

**Resolution:**
```bash
# Restart service
docker-compose -f docker-compose.prod.yml restart api-1 api-2

# If persistent, check for resource exhaustion
docker-compose -f docker-compose.prod.yml exec api-1 cat /proc/meminfo

# Scale up if needed
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### 2. High Error Rate (>5%)

**Symptoms:**
- Prometheus alert: HighErrorRate
- Error spikes in Grafana
- Customer complaints

**Diagnosis:**
```bash
# Check error distribution
curl -s http://localhost:9090/api/v1/query?query=sum(rate(http_requests_total{status_code=~\"5..\"}[5m]))by(endpoint)

# Check recent logs for errors
docker-compose -f docker-compose.prod.yml logs api-1 --since=10m | grep -i "error\|exception"

# Check for specific error patterns
docker-compose -f docker-compose.prod.yml logs api-1 --since=10m | grep "status_code=500" | head -20
```

**Resolution:**
- If related to recent deployment → Rollback (see deployment.md)
- If database related → Check database section below
- If external service → Check external dependencies

### 3. High Latency (P95 > 500ms)

**Symptoms:**
- Prometheus alert: HighLatencyP95
- Slow API responses
- Timeouts in client applications

**Diagnosis:**
```bash
# Check latency by endpoint
curl -s 'http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,sum(rate(http_request_duration_seconds_bucket[5m]))by(le,endpoint))'

# Check database query times
curl -s 'http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,sum(rate(db_query_duration_seconds_bucket[5m]))by(le,query_type))'

# Check for slow queries
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle' AND now() - pg_stat_activity.query_start > interval '5 seconds';
"
```

**Resolution:**
```bash
# If database related, check and optimize queries
# Kill long-running queries if necessary
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state != 'idle' AND now() - pg_stat_activity.query_start > interval '30 seconds';
"

# If CPU bound, scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale api=4

# Clear cache if stale data suspected
docker-compose -f docker-compose.prod.yml exec redis redis-cli FLUSHDB
```

### 4. Database Connection Pool Exhausted

**Symptoms:**
- Prometheus alert: DBPoolExhausted
- Connection timeout errors
- Requests hanging

**Diagnosis:**
```bash
# Check pool status
curl -s http://localhost:8000/stats | jq .database.pool

# Check active connections in PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
"

# Check for connection leaks
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "
SELECT pid, usename, application_name, client_addr, state, query_start
FROM pg_stat_activity WHERE state != 'idle' ORDER BY query_start;
"
```

**Resolution:**
```bash
# Terminate idle connections
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE state = 'idle' AND query_start < now() - interval '10 minutes';
"

# Restart API to reset connection pool
docker-compose -f docker-compose.prod.yml restart api-1 api-2

# If persistent, increase pool size (requires restart)
# Edit docker-compose.prod.yml: DATABASE_POOL_SIZE=20
```

### 5. Redis/Cache Issues

**Symptoms:**
- Low cache hit rate alert
- Cache errors in logs
- Increased database load

**Diagnosis:**
```bash
# Check Redis status
docker-compose -f docker-compose.prod.yml exec redis redis-cli info

# Check memory usage
docker-compose -f docker-compose.prod.yml exec redis redis-cli info memory

# Check for evictions
docker-compose -f docker-compose.prod.yml exec redis redis-cli info stats | grep evicted
```

**Resolution:**
```bash
# If memory full, flush cache
docker-compose -f docker-compose.prod.yml exec redis redis-cli FLUSHDB

# If Redis down, restart
docker-compose -f docker-compose.prod.yml restart redis

# If persistent issues, check AOF file
docker-compose -f docker-compose.prod.yml exec redis redis-cli BGREWRITEAOF
```

### 6. Optimization/Simulation Failures

**Symptoms:**
- High failure rate for optimization endpoints
- Timeouts on simulation requests
- Business metric alerts

**Diagnosis:**
```bash
# Check optimization metrics
curl -s 'http://localhost:9090/api/v1/query?query=sum(rate(optimization_runs_total{status="error"}[5m]))'

# Check for specific errors
docker-compose -f docker-compose.prod.yml logs api-1 --since=30m | grep -i "optimization\|simulation" | grep -i error

# Check resource usage during optimization
docker stats --no-stream
```

**Resolution:**
```bash
# If memory issues, increase container limits
# Edit docker-compose.prod.yml memory limits

# If timeout issues, check input data size
# Consider implementing request size limits

# If algorithmic issues, rollback to previous version
# See deployment.md rollback procedure
```

## Incident Response Process

### 1. Detection & Acknowledgment (0-5 min)

1. Receive alert via PagerDuty/Slack
2. Acknowledge the alert
3. Open incident ticket
4. Join incident Slack channel

### 2. Initial Assessment (5-15 min)

1. Determine severity level
2. Identify affected systems/users
3. Check recent changes (deployments, config)
4. Communicate initial status

**Template:**
```
INCIDENT: [Brief description]
SEVERITY: SEV[1-4]
STATUS: Investigating
IMPACT: [Number of users/requests affected]
STARTED: [Time]
LEAD: [@your-name]
```

### 3. Mitigation (15-60 min)

1. Implement immediate fix or workaround
2. Document actions taken
3. Monitor for improvement
4. Update status regularly

**Template:**
```
UPDATE: [Time]
ACTIONS: [What was done]
STATUS: [Mitigating/Resolved]
NEXT STEPS: [If applicable]
```

### 4. Resolution

1. Confirm service restored
2. Verify metrics normalized
3. Communicate resolution

**Template:**
```
RESOLVED: [Time]
ROOT CAUSE: [Brief explanation]
RESOLUTION: [What fixed it]
DURATION: [Total time]
FOLLOW-UP: [Action items]
```

### 5. Post-Incident

1. Schedule post-mortem (within 48 hours for SEV1/2)
2. Create follow-up tickets
3. Update runbooks if needed
4. Archive incident documentation

## Communication Templates

### Initial Alert (Slack)
```
:rotating_light: INCIDENT ALERT

Service: Assortment Optimizer API
Issue: [Description]
Severity: SEV[X]
Impact: [Estimated impact]
Status: Investigating

Incident Lead: @[name]
Thread for updates only :thread:
```

### Customer Communication (if needed)
```
We are currently investigating an issue with [service].

Impact: [What customers are experiencing]
Status: Our team is actively working on resolution.

We will provide updates every [30 minutes/1 hour].
```

### Resolution Communication
```
:white_check_mark: INCIDENT RESOLVED

Service: Assortment Optimizer API
Duration: [X hours Y minutes]
Root Cause: [Brief explanation]
Resolution: [What was done]

Post-mortem scheduled for: [Date/Time]
```

## Key Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Primary On-Call | Rotates | PagerDuty | 24/7 |
| Secondary On-Call | Rotates | PagerDuty | 24/7 |
| Team Lead | [Name] | @slack | Business hours |
| Database Admin | [Name] | @slack | Business hours |
| Security | [Name] | @slack | 24/7 for SEV1 |

## Useful Links

- **Grafana Dashboards:** https://grafana.example.com
- **Prometheus:** https://prometheus.example.com
- **Sentry:** https://sentry.io/organizations/your-org
- **Logs:** https://logs.example.com
- **PagerDuty:** https://your-org.pagerduty.com
- **Incident Tracker:** https://your-tracker.example.com

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| 2024-01-26 | DevOps Team | Initial version |
