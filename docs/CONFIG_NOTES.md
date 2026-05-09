# 🔧 Configuration Notes

> Last updated: 2026-05-09

---

## Required Environment Variables

See [docs/DEPLOYMENT.md](DEPLOYMENT.md#environment-variables-reference) for the full list.

### Minimum for local development

```bash
DATABASE_URL=postgresql://hooksniff:hooksniff@localhost:5432/hooksniff?sslmode=disable
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
HMAC_SECRET=dev-hmac-secret-change-in-production-min-32-chars
```

### Minimum for production

```bash
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/hooksniff?sslmode=require
REDIS_URL=rediss://default:token@xxx.upstash.io:6379
JWT_SECRET=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)
APP_ENV=production
LOG_FORMAT=json
```

---

## Optional: AI Center

HookSniff includes an AI Center for automated monitoring and anomaly detection. It runs as a background job every 30 seconds.

### What it does

1. Collects system metrics (CPU, RAM, disk)
2. Checks webhook health status
3. Calculates risk scores (0-100)
4. Scans for attacks (DDoS, spam, injection)
5. Auto-fixes (circuit breaker, retry adjustment)
6. If AI API key is configured: deep analysis via AI

### Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `MIMO_API_KEY` | Optional | MiMo API for log analysis, anomaly detection |
| `OPENAI_API_KEY` | Optional | OpenAI for code review, auto-fix suggestions |

If neither is set, rule-based analysis runs (threshold-based, mathematical).

### Database Tables (auto-created)

- `ai_events` — AI event logs
- `risk_scores` — Risk score history
- `ai_actions` — Action records (approve/reject/rollback)
- `ai_blocklist` — IP/customer/endpoint block list
- `ai_config` — AI configuration

### API Endpoints

```
GET  /v1/ai/status          — AI Center status
GET  /v1/ai/events          — Event logs
GET  /v1/ai/risks           — Risk scores
GET  /v1/ai/actions         — Action queue
POST /v1/ai/actions/{id}/approve   — Approve action
POST /v1/ai/actions/{id}/reject    — Reject action
POST /v1/ai/actions/{id}/rollback  — Rollback action
GET  /v1/ai/blocklist       — Block list
POST /v1/ai/blocklist       — Add to block list
DELETE /v1/ai/blocklist/{id} — Remove from block list
```

### Autonomous Behavior

| Condition | AI Action | Human Required? |
|-----------|-----------|-----------------|
| CPU > 80% | Log event | ❌ |
| CPU > 95% | Critical event + notification | ❌ |
| Error rate > 20% | Increase retry policy | ❌ |
| Error rate > 50% | Circuit break | ❌ |
| DDoS spike detected | Tighten rate limit | ❌ |
| Payload injection | Reject request + log | ❌ |
| Risk score > 80 | **Send notification only** | ✅ |
| Manual intervention | Queue action | ✅ |

---

## Optional: Notifications

### Slack

| Variable | Description |
|----------|-------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL |

### Email

Email is sent via Gmail API (GCP Service Account). See `GCP_SA_JSON` in deployment guide.

| Variable | Description |
|----------|-------------|
| `GCP_SA_JSON` | GCP service account JSON |
| `NOTIFY_FROM_EMAIL` | Sender email |
| `NOTIFY_EMAIL` | Admin notification email |

### Notification Levels

| Level | Sent? |
|-------|-------|
| ℹ️ Info | ❌ (log only) |
| ⚠️ Warning | ✅ Slack + Email |
| 🔴 Critical | ✅ Slack + Email |

---

## Database

- **Engine:** PostgreSQL (Neon serverless in production)
- **Connection:** `sslmode=require` in production
- **Migrations:** Auto-run on API startup (`api/src/db.rs`)
- **Pooling:** Neon pooled connection string recommended for API

### Migration Files

```
migrations/
├── 001_init.sql              # Core tables
├── 002_security_features.sql # Rate limiting, IP allowlisting
├── 003_routing.sql           # Smart routing columns
├── 004_teams.sql             # Team management
├── 005_event_mesh.sql        # Schema registry, delivery targets, fanout
├── 006_fifo_queue.sql        # FIFO ordered delivery
├── 007_retry_policies.sql    # Per-endpoint retry policies
└── 017_ai_center.sql         # AI Center tables
```
