# HookSniff — Incident Response Procedures

> Son güncelleme: 2026-05-12

---

## Severity Levels

| Level | Name | Description | Response Time | Examples |
|-------|------|-------------|---------------|----------|
| **P0** | Critical | Service completely down, data loss risk | ≤ 15 min | API returns 500 for all requests, database unreachable, payment processing broken |
| **P1** | High | Major feature degraded, many users affected | ≤ 1 hour | Webhook delivery failing for >20% of traffic, auth broken, dashboard unreachable |
| **P2** | Medium | Minor feature degraded, workaround exists | ≤ 4 hours | Single SDK broken, analytics delayed, email delivery slow |
| **P3** | Low | Cosmetic or non-blocking issue | ≤ 24 hours | UI rendering issue, minor i18n error, non-critical log noise |

---

## On-Call Rotation

> **⚠️ Placeholder** — Currently single-person (Servet + AI Agent). Update when team grows.

| Week | Primary | Secondary | Notes |
|------|---------|-----------|-------|
| W1 | Servet | AI Agent | — |
| W2 | AI Agent | Servet | — |

**Escalation after hours:** If primary doesn't respond within SLA, escalate to secondary via all channels (Discord, email, phone).

---

## Incident Triage Checklist

When an incident is detected (monitoring alert, user report, or self-discovery):

### 1. Acknowledge (0-2 min)
- [ ] Acknowledge the alert/incident
- [ ] Open incident channel (Discord thread or dedicated channel)
- [ ] Note the time of detection

### 2. Assess (2-10 min)
- [ ] Determine severity level (P0-P3)
- [ ] Identify affected services (API, Worker, Dashboard, DB, Redis)
- [ ] Check if it's a single-user or system-wide issue
- [ ] Review recent deployments (`git log --oneline -10`)
- [ ] Check Grafana dashboards for anomalies
- [ ] Check Neon DB status page
- [ ] Check Upstash Redis status page
- [ ] Check Google Cloud Run status

### 3. Mitigate (10-30 min)
- [ ] Apply immediate mitigation (rollback, scale up, failover)
- [ ] Update status page if public-facing
- [ ] Notify affected users if necessary
- [ ] Document mitigation steps in real-time

### 4. Resolve
- [ ] Identify root cause
- [ ] Apply permanent fix
- [ ] Verify fix in production
- [ ] Close incident

### 5. Post-Mortem (within 48h)
- [ ] Write post-mortem document
- [ ] Schedule review meeting (if team exists)
- [ ] Track action items to completion

---

## Communication Templates

### Status Page Update (Investigating)

```
[Investigating] Webhook Delivery Delays

We are currently investigating reports of delayed webhook deliveries.
Some customers may experience increased latency for webhook events.

Our team is actively working to identify and resolve the issue.

Started: [YYYY-MM-DD HH:MM UTC]
Affected: Webhook delivery service
Impact: Increased delivery latency

We will provide updates every 30 minutes.
```

### Status Page Update (Identified)

```
[Identified] Webhook Delivery Delays — Root Cause Found

We have identified the cause of the delivery delays: [brief description].

A fix is being implemented. We expect resolution within [timeframe].

Started: [YYYY-MM-DD HH:MM UTC]
Identified: [YYYY-MM-DD HH:MM UTC]
Affected: Webhook delivery service
Root Cause: [1-2 sentence description]
```

### Status Page Update (Resolved)

```
[Resolved] Webhook Delivery Delays

The webhook delivery issue has been resolved. All systems are operating normally.

Started: [YYYY-MM-DD HH:MM UTC]
Resolved: [YYYY-MM-DD HH:MM UTC]
Duration: [X hours Y minutes]
Root Cause: [brief description]
Impact: [X] deliveries delayed, [Y] failed and retried

A full post-mortem will be published within 48 hours.
We apologize for the inconvenience.
```

### Customer Email (Critical Incident)

```
Subject: [HookSniff] Service Disruption — [Date]

Hi [Name],

We experienced a service disruption on [date] that affected [describe impact].

What happened:
[2-3 sentence description of the incident]

What we did:
[2-3 sentence description of the resolution]

What we're doing to prevent it:
[1-2 bullet points of preventive actions]

Your data is safe. [If applicable: All queued webhooks have been re-delivered.]

If you have any questions, please reply to this email or join our Discord: [link]

Best regards,
HookSniff Team
```

### Customer Email (Minor Incident)

```
Subject: [HookSniff] Brief Service Issue — Resolved

Hi [Name],

We had a brief issue today that affected [specific feature] for approximately [duration]. The issue has been resolved and all services are operating normally.

No action is required on your end.

Best regards,
HookSniff Team
```

---

## Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Severity:** P0/P1/P2/P3
**Duration:** X hours Y minutes
**Author:** [Name]
**Reviewers:** [Names]

## Summary

[2-3 sentence executive summary of what happened, impact, and resolution]

## Impact

- **Users affected:** [number or percentage]
- **Requests affected:** [number]
- **Revenue impact:** [if applicable]
- **Data loss:** [yes/no, details]
- **SLA breach:** [yes/no]

## Timeline (UTC)

| Time | Event |
|------|-------|
| HH:MM | [Event detected / first report] |
| HH:MM | [Investigation started] |
| HH:MM | [Root cause identified] |
| HH:MM | [Mitigation applied] |
| HH:MM | [Full resolution] |
| HH:MM | [Monitoring confirmed stable] |

## Root Cause

[Detailed technical explanation of what caused the incident]

### Contributing Factors

- [Factor 1]
- [Factor 2]
- [Factor 3]

## Detection

- **How detected:** [Alert / User report / Self-discovery]
- **Detection time:** [minutes from incident start]
- **Alert that fired:** [name of alert or monitoring check]

## Resolution

[Detailed steps taken to resolve the incident]

## Lessons Learned

### What went well
- [Item 1]
- [Item 2]

### What went wrong
- [Item 1]
- [Item 2]

### Where we got lucky
- [Item 1]

## Action Items

| # | Action | Owner | Priority | Due Date | Status |
|---|--------|-------|----------|----------|--------|
| 1 | [Action item] | [Owner] | P0/P1/P2 | YYYY-MM-DD | Open |
| 2 | [Action item] | [Owner] | P0/P1/P2 | YYYY-MM-DD | Open |

## Appendix

- Grafana dashboard screenshots
- Relevant logs
- Error messages
```

---

## Root Cause Analysis (RCA) Procedure

### 1. Timeline Reconstruction
- Collect all relevant logs (API, Worker, DB, Redis, Cloud Run)
- Correlate timestamps across services
- Identify the first deviation from normal behavior

### 2. The "5 Whys" Method
Ask "why" iteratively until root cause is found:

```
Problem: Webhook deliveries failed for 2 hours
→ Why? Worker couldn't dequeue messages
→ Why? Database connection pool exhausted
→ Why? Long-running query held connections
→ Why? Missing index on webhook_queue table
→ Why? New query pattern wasn't optimized
Root Cause: Missing database index
```

### 3. Data Collection
- [ ] Grafana metrics (latency, error rate, throughput)
- [ ] Application logs (structured JSON, grep for errors)
- [ ] Database slow query log
- [ ] Cloud Run revision history
- [ ] Recent code changes (`git log --since="2 days ago"`)
- [ ] Infrastructure changes (Terraform, Cloud Run config)

### 4. Contributing Factor Analysis
Categorize contributing factors:
- **Code:** Bug, missing validation, race condition
- **Config:** Wrong environment variable, missing secret
- **Infrastructure:** Resource limits, network issue, provider outage
- **Process:** Missing review, insufficient testing, no monitoring
- **External:** Third-party service failure, DNS issue

---

## Escalation Matrix

| Time Elapsed | Action |
|--------------|--------|
| 0 min | On-call acknowledges |
| +15 min | If P0 not mitigated → escalate to secondary |
| +30 min | If P0 still unresolved → all hands |
| +1 hour | If P1 not mitigated → escalate to secondary |
| +2 hours | If P1 still unresolved → all hands |
| +4 hours | Any unresolved P0/P1 → consider external communication |
| +8 hours | Any unresolved P0/P1 → executive notification |

---

## Common Incident Patterns

### Pattern 1: Database Connection Exhaustion

**Symptoms:**
- API returns 503 intermittently
- Grafana: connection pool at max
- Logs: `connection pool timed out`

**Likely Causes:**
- Long-running query holding connections
- Missing index causing sequential scans
- Connection leak (unclosed connection in code)

**Mitigation:**
1. Check Neon dashboard for active connections
2. Kill long-running queries: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'active' AND query_start < now() - interval '5 minutes';`
3. Restart API server (releases connections)
4. Scale Cloud Run instances if needed

**Fix:**
- Add missing index
- Implement connection pool timeout
- Add query timeout to SQLx configuration

### Pattern 2: API 5xx Errors Spike

**Symptoms:**
- Grafana: 5xx error rate > 5%
- Users report "server error"
- Cloud Run logs show panics or unwrap errors

**Likely Causes:**
- Unhandled panic in Rust code
- Database query failure (timeout, connection issue)
- Serialization error (invalid JSON response)
- New deployment introduced bug

**Mitigation:**
1. Check Cloud Run revision — was there a recent deploy?
2. If yes → rollback: `gcloud run services update-traffic hooksniff-api --to-revisions=PREVIOUS=100`
3. Check logs for panic messages
4. If no deploy → check database health

**Fix:**
- Replace `unwrap()` with proper error handling
- Add input validation
- Improve test coverage

### Pattern 3: Webhook Delivery Failures

**Symptoms:**
- Grafana: delivery success rate drops below 95%
- Users report missed webhooks
- Worker logs show HTTP timeouts

**Likely Causes:**
- Customer endpoint is down or slow
- Customer endpoint SSL certificate expired
- SSRF protection blocking legitimate URLs
- Worker overloaded (too many concurrent deliveries)

**Mitigation:**
1. Check worker Grafana dashboard — is it consuming queue?
2. Check if specific endpoints are failing (customer-side issue)
3. If worker stuck → restart worker service
4. If SSRF false positive → check `ssrf.rs` IP allowlist

**Fix:**
- Implement circuit breaker for failing endpoints
- Add dead letter queue for permanently failing deliveries
- Improve retry policy with exponential backoff
- Add endpoint health monitoring

### Pattern 4: Redis Unavailable

**Symptoms:**
- Rate limiting not working (falling back to in-memory)
- Session data lost
- Logs: `Redis connection refused`

**Likely Causes:**
- Upstash free tier limit reached
- Network issue between Cloud Run and Upstash
- Redis instance deleted/rotated

**Mitigation:**
1. Check Upstash dashboard
2. Rate limiter already has in-memory fallback — verify it's active
3. If persistent → restart API with Redis disabled temporarily

**Fix:**
- Monitor Redis connection health
- Implement graceful degradation (already done for rate limiter)
- Consider Redis connection pooling

### Pattern 5: Memory Leak / OOM

**Symptoms:**
- Cloud Run instance restarts frequently
- Response latency increases over time
- Grafana: memory usage climbing

**Likely Causes:**
- Unbounded cache growth
- Connection not being dropped
- Large payload held in memory
- Rust: `Arc<Mutex<...>>` with circular reference

**Mitigation:**
1. Check Cloud Run memory metrics
2. Restart service (immediate relief)
3. Reduce max instances to limit blast radius

**Fix:**
- Profile with `heaptrack` or `dhat`
- Add memory limits to Cloud Run config
- Implement bounded caches with TTL

---

## Incident Drills

**Frequency:** Quarterly (when team grows)

**Scenario Examples:**
1. Simulate database failover
2. Simulate API deployment rollback
3. Simulate worker queue backlog
4. Simulate third-party service outage

**Post-Drill:**
- Document response time
- Identify gaps in runbooks
- Update this document

---

## Key Contacts

| Role | Name | Contact |
|------|------|---------|
| Project Owner | Servet Arslan | servetarslan02@gmail.com |
| AI Agent | OpenClaw | — |
| DB Provider | Neon | https://console.neon.tech |
| Redis Provider | Upstash | https://console.upstash.com |
| Hosting | Google Cloud | https://console.cloud.google.com |
| CDN | Cloudflare | https://dash.cloudflare.com |
| Monitoring | Grafana | https://hookrelay.grafana.net |

---

## Monitoring URLs

| Service | URL |
|---------|-----|
| Grafana Dashboards | https://hookrelay.grafana.net |
| Neon Console | https://console.neon.tech |
| Upstash Console | https://console.upstash.com |
| Cloud Run Console | https://console.cloud.google.com/run |
| Vercel Dashboard | https://vercel.com/dashboard |
