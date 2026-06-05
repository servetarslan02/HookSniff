# HookSniff — Disaster Recovery Plan

## Overview
This document outlines the disaster recovery procedures for HookSniff platform.

## Infrastructure Components

| Component | Provider | Backup Strategy | RTO | RPO |
|-----------|----------|-----------------|-----|-----|
| **Database** | Neon PostgreSQL | Auto-backup (point-in-time recovery) | 5 min | 0 (PITR) |
| **API** | GCP Cloud Run | Auto-scaling, multi-region | 2 min | 0 |
| **Worker** | GCP Cloud Run | Auto-scaling | 2 min | 0 |
| **Dashboard** | Vercel | Git-based deploy | 1 min | 0 |
| **Cache** | Upstash Redis | Auto-replication | 1 min | 0 |

## Recovery Procedures

### 1. Database Failure
**Severity**: Critical
**RTO**: 5 minutes
**RPO**: 0 (point-in-time recovery)

**Steps**:
1. Check Neon dashboard for status
2. If Neon is down, restore from latest backup
3. Update DATABASE_URL in Cloud Run environment
4. Verify API connectivity

**Command**:
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Neon restore (via dashboard)
# https://console.neon.tech → Backups → Restore
```

### 2. API Service Failure
**Severity**: Critical
**RTO**: 2 minutes
**RPO**: 0

**Steps**:
1. Check Cloud Run logs: `gcloud run services logs read hooksniff-api`
2. Check for OOM kills or timeout errors
3. If service is down, redeploy: `gcloud builds submit --config=cloudbuild.yaml`
4. Verify health endpoint: `curl https://hooksniff-api-*.run.app/v1/health`

### 3. Worker Service Failure
**Severity**: High
**RTO**: 2 minutes
**RPO**: 0

**Steps**:
1. Check worker logs: `gcloud run services logs read hooksniff-worker`
2. Worker auto-recovers from crashes
3. If persistent failure, redeploy worker separately
4. Verify webhook delivery: check `deliveries` table for recent entries

### 4. Dashboard Failure
**Severity**: Low
**RTO**: 1 minute
**RPO**: 0

**Steps**:
1. Check Vercel dashboard for deployment status
2. If build failed, fix and push to main
3. Vercel auto-deploys on push
4. Verify: `curl -I https://hooksniff.vercel.app`

### 5. Redis Cache Failure
**Severity**: Medium
**RTO**: 1 minute
**RPO**: N/A (cache)

**Steps**:
1. API falls back to in-memory caching
2. Performance degrades but service continues
3. Check Upstash dashboard
4. If persistent, restart Redis instance

## Communication Plan

### Internal Notification
1. **Slack/Discord**: Post in #incidents channel
2. **Email**: Notify team@hooksniff.com
3. **Status Page**: Update status.json

### External Communication
1. **Status Page**: https://hooksniff.vercel.app/status
2. **Twitter/X**: @hooksniff
3. **Email**: Send to affected customers

## Monitoring & Alerts

### Critical Alerts (immediate response)
- API health check fails 3x
- Database connection pool exhausted
- Error rate > 5% for 5 minutes
- P95 latency > 5 seconds

### Warning Alerts (investigate within 1 hour)
- Disk usage > 80%
- Memory usage > 80%
- Unusual traffic patterns
- Failed webhook deliveries > 10%

## Testing Schedule

| Test | Frequency | Last Run |
|------|-----------|----------|
| Database backup restore | Monthly | - |
| API failover test | Quarterly | - |
| Full DR drill | Annually | - |

## Contact Information

| Role | Contact | Phone |
|------|---------|-------|
| **Primary** | Servet Arslan | - |
| **Backup** | - | - |
| **Neon Support** | support@neon.tech | - |
| **GCP Support** | Cloud Console | - |
| **Vercel Support** | vercel.com/help | - |

## Recovery Time Objectives

| Scenario | Target RTO | Actual RTO |
|----------|------------|------------|
| Single service failure | 5 min | 2 min |
| Database failure | 15 min | 5 min |
| Full platform outage | 30 min | 10 min |
| Region failure | 1 hour | 15 min |

## Post-Incident

1. **Root Cause Analysis**: Within 24 hours
2. **Incident Report**: Within 48 hours
3. **Preventive Measures**: Within 1 week
4. **Customer Communication**: Within 4 hours of resolution
