# HookSniff Deep Infrastructure Review

**Reviewer:** AI Subagent (deep-infra)
**Date:** 2026-05-10
**Scope:** Docker, CI/CD, IaC, Monitoring, Security, Performance

---

## Executive Summary

HookSniff has a **surprisingly mature infrastructure** for an early-stage project. Multi-stage Docker builds, proper CI/CD pipelines, Terraform provider, Helm charts, monitoring stack, and multiple deployment targets (Render, GCP Cloud Run, Oracle Cloud, Vercel) are all present. However, there are significant inconsistencies, hardcoded secrets, missing production hardening, and several "almost there" configurations that need attention before real production traffic.

**Overall Grade: B-** — Good bones, needs production rigor.

---

## 1. Docker Configuration

### 1.1 Dockerfile.api ✅ Mostly Good

**What's done well:**
- Multi-stage build (rust:1-bookworm → debian:bookworm-slim)
- Non-root user (`hooksniff`)
- Binary stripped in builder stage
- HEALTHCHECK defined (15s interval, 5s timeout, 3 retries)
- Minimal runtime deps (ca-certificates, curl only)
- Using rustls (no OpenSSL dependency)

**Issues:**

#### 🔴 CRITICAL — No `--start-period` in dev HEALTHCHECK
```dockerfile
# Current (Dockerfile.api):
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1
```
Rust release builds take time to start. Without `--start-period`, Docker will kill the container during startup.

**Fix:**
```dockerfile
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:3000/health || exit 1
```
Note: The prod Dockerfile (`deploy/Dockerfile.api.prod`) correctly has `--start-period=10s`. Apply this to dev too.

#### 🟡 MEDIUM — Dev Dockerfile missing dependency caching optimization
The dev `Dockerfile.api` copies everything at once. The prod version (`deploy/Dockerfile.api.prod`) has a proper dependency cache layer:
```dockerfile
# Prod does this (good):
RUN mkdir -p api/src && echo "fn main() {}" > api/src/main.rs && ...
cargo build --release -p hooksniff-api 2>/dev/null || true && ...
rm -rf api/src worker/src
COPY api/src/ api/src/
```
**Fix:** Apply the same dependency caching pattern to `Dockerfile.api` and `Dockerfile.worker`.

#### 🟡 MEDIUM — Worker Dockerfile has no HEALTHCHECK
```dockerfile
# Dockerfile.worker — no HEALTHCHECK
CMD ["hooksniff-worker"]
```
Workers are harder to health-check, but you should expose a liveness endpoint (even a simple `/healthz` that returns 200 if the process is alive).

**Fix:** Add a health check endpoint to the worker binary, or use a process-level check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD pgrep -x hooksniff-worker || exit 1
```

#### 🟡 MEDIUM — Base image not pinned to digest
Both `debian:bookworm-slim` and `node:20-alpine` use tag-only pinning. A `docker pull` at different times gets different images.

**Fix:** Pin to SHA256 digest:
```dockerfile
FROM debian:bookworm-slim@sha256:<specific-hash>
```

### 1.2 Dockerfile.dashboard ✅ Good

**What's done well:**
- 3-stage build (deps → builder → runner)
- `npm ci --ignore-scripts` (faster, safer)
- Non-root user (nextjs:1001)
- Standalone output mode (minimal runtime)
- HEALTHCHECK with wget
- `NEXT_TELEMETRY_DISABLED=1`

**Issues:**

#### 🟡 MEDIUM — No `.dockerignore` awareness for dashboard context
The `.dockerignore` excludes `dashboard/node_modules/` and `dashboard/.next/` which is good. But the build context is `.` (project root), meaning the entire repo is sent to Docker daemon for every dashboard build.

**Fix:** Consider using a separate build context or a more aggressive `.dockerignore`:
```
# In .dockerignore, add:
api/
worker/
cli/
sdks/
terraform/
deploy/
*.dump
```

### 1.3 Docker Compose Files

#### docker-compose.yml (Dev) ✅ Good
- PostgreSQL 16-alpine with healthcheck
- Proper `depends_on` with `condition: service_healthy`
- Named volumes for persistence
- Dev secrets clearly marked as non-production

#### docker-compose.staging.yml ✅ Good
- Separate database name (`hooksniff_staging`)
- Redis added (matches production)
- Environment variables via `${VAR:-default}` pattern
- Rate limiting configured

#### 🔴 CRITICAL — Staging has default fallback passwords
```yaml
POSTGRES_PASSWORD: "${STAGING_DB_PASSWORD:-hooksniff_staging_pass}"
HMAC_SECRET: "${STAGING_HMAC_SECRET:-staging-hmac-secret-change-me}"
```
If env vars aren't set, these weak defaults are used. In a staging environment accessible over the network, this is a real risk.

**Fix:** Remove defaults, fail fast if not set:
```yaml
POSTGRES_PASSWORD: "${STAGING_DB_PASSWORD:?STAGING_DB_PASSWORD must be set}"
```

#### deploy/docker-compose.prod.yml ✅ Good
- Resource limits defined (memory + CPU)
- JSON file logging with rotation (10m, 3 files)
- Healthcheck with start_period
- Custom bridge network

#### 🟡 MEDIUM — Prod compose uses `env_file: .env`
```yaml
env_file:
  - .env
```
This loads ALL variables from `.env` into the container, including ones that may not be relevant. Prefer explicit `environment:` blocks for production, or use `env_file` with a dedicated production file.

---

## 2. CI/CD Pipeline

### 2.1 GitHub Actions CI (`.github/workflows/ci.yml`) ✅ Excellent

**What's done well:**
- Concurrency control (`cancel-in-progress: true`)
- Cargo caching with hash-based keys
- PostgreSQL service container for integration tests
- Security audit (cargo-audit + npm audit)
- Separate lint, test, build, dashboard jobs
- `needs: [lint, test]` gates on builds

**Issues:**

#### 🟡 MEDIUM — No dashboard tests in CI
```yaml
build-dashboard:
    steps:
      - name: Lint
        run: npm run lint
      - name: Build
        run: npm run build
```
Only lint + build. No `npm test` step. If there are dashboard tests, they're not running.

**Fix:** Add test step:
```yaml
      - name: Test
        run: npm test -- --passWithNoTests
```

#### 🟢 LOW — `npm audit --continue-on-error: true`
Node audit failures are silently ignored. This is acceptable for now but should be tightened once audit issues are resolved.

### 2.2 Deploy Workflow (`.github/workflows/deploy.yml`) ✅ Good

**What's done well:**
- Triggered only after CI succeeds (`workflow_run` + `if: success()`)
- SHA-tagged images (immutable, traceable)
- `latest` tag also pushed
- GCP authentication via service account key
- Secrets via Google Secret Manager (`--set-secrets`)

**Issues:**

#### 🔴 CRITICAL — No rollback strategy
The deploy workflow pushes new images and deploys immediately. If the deploy fails, there's no automatic rollback.

**Fix:** Add a rollback step:
```yaml
      - name: Deploy API to Cloud Run
        id: deploy-api
        run: |
          gcloud run deploy hooksniff-api \
            --image ${{ env.API_IMAGE }}:${{ github.sha }} \
            ...
        
      - name: Verify API health
        run: |
          sleep 30
          curl -sf https://hooksniff-api-*.run.app/health || {
            echo "❌ Health check failed, rolling back..."
            gcloud run deploy hooksniff-api \
              --image ${{ env.API_IMAGE }}:previous \
              ...
            exit 1
          }
```

#### 🟡 MEDIUM — No staging deployment in CI/CD
The deploy workflow goes directly to production. There's a `scripts/deploy-staging.sh` but it's manual.

**Fix:** Add a staging job that runs before production:
```yaml
  deploy-staging:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    # ... deploy to staging
    
  deploy-production:
    needs: [deploy-staging]
    # ... deploy to prod after staging verification
```

#### 🟡 MEDIUM — Secrets naming inconsistency
```yaml
--set-secrets "DATABASE_URL=neon-db-url:latest,..."
```
vs `gcp-deploy.sh`:
```yaml
--set-secrets "DATABASE_URL=hooksniff-database-url:latest,..."
```
Different secret names in different places. This will cause confusion.

**Fix:** Standardize secret names in a shared constants file or documentation.

### 2.3 Release Workflow (`.github/workflows/release.yml`) ✅ Good

- Matrix strategy for parallel builds
- GitHub Container Registry (ghcr.io)
- Semver + SHA tagging
- Buildx with GHA cache

**Issue:**

#### 🟡 MEDIUM — No release verification
No smoke test after pushing release images. A broken release could go unnoticed.

---

## 3. Infrastructure as Code

### 3.1 Terraform Provider (`terraform/`) ✅ Good Design

The project provides a **Terraform provider** for HookSniff itself (not for deploying HookSniff). This is a product feature, not ops IaC.

**What's done well:**
- Clean provider schema with env var fallback
- Sensitive field marking
- Import support documented
- Multiple resource types (endpoint, api_key, schema, event_type)

**Issues:**

#### 🟡 MEDIUM — No Terraform state for HookSniff's own infrastructure
There's no Terraform for deploying HookSniff's own infrastructure (Cloud Run, VPC, etc.). The `terraform/` directory is only the provider. Deployment is handled by shell scripts and `gcloud` commands.

**Fix:** Consider adding `infra/` directory with Terraform for:
- Cloud Run services
- Artifact Registry
- Secret Manager secrets
- Custom domain mappings
- IAM bindings

### 3.2 Helm Chart (`deploy/helm/`) ✅ Good Structure

**What's done well:**
- Proper Kubernetes labels (`app.kubernetes.io/*`)
- Resource requests/limits
- Liveness + readiness probes
- Ingress with TLS support
- Secret references via `secretKeyRef`

**Issues:**

#### 🔴 CRITICAL — Hardcoded secrets in values.yaml
```yaml
env:
  JWT_SECRET: "change-me-in-production"
  HMAC_SECRET: "change-me-in-production"
```
These are plaintext defaults. Even with "change me" comments, they'll end up in version control.

**Fix:** Remove from values.yaml, use Kubernetes Secrets:
```yaml
env:
  JWT_SECRET:
    valueFrom:
      secretKeyRef:
        name: hooksniff-secrets
        key: jwt-secret
```

#### 🟡 MEDIUM — No HPA (Horizontal Pod Autoscaler)
```yaml
replicaCount: 1
```
Fixed replica count. For a webhook delivery service, traffic can be bursty.

**Fix:** Add HPA:
```yaml
api:
  autoscaling:
    enabled: true
    minReplicas: 1
    maxReplicas: 5
    targetCPUUtilization: 70
```

#### 🟡 MEDIUM — Worker has no liveness/readiness probes in Helm
The worker deployment template has no probes, unlike the API.

### 3.3 Deploy Scripts

#### `gcp-deploy.sh` ✅ Comprehensive
- Proper error handling (`set -euo pipefail`)
- Secret Manager integration
- Step-by-step with colored output
- Custom domain mapping

**Issues:**

#### 🟡 MEDIUM — `source <(grep ... .env.production)` is fragile
```bash
source <(grep -v '^#' .env.production | grep -v '^$' | sed 's/^/export /')
```
This breaks on values with spaces, special characters, or multi-line values.

**Fix:** Use `set -a; . .env.production; set +a` or a proper env parser.

#### 🟡 MEDIUM — No idempotency for image builds
Each `gcp-deploy.sh` run builds and pushes `:latest` only. No SHA tagging, no build cache.

### 3.4 Oracle Cloud Setup (`deploy/oracle-cloud-setup.sh`) ✅ Excellent

**What's done well:**
- Root check
- Architecture detection
- Docker official installation
- Firewall configuration
- Systemd service creation
- Log rotation configuration
- Auto-update script

**Issues:**

#### 🟡 MEDIUM — Opens ports 3000 and 3001 to 0.0.0.0
```bash
for port in 80 443 3000 3001; do
    iptables -A INPUT -p tcp --dport "$port" -j ACCEPT
```
Ports 3000 (API) and 3001 (dashboard dev) should not be publicly exposed in production. Use a reverse proxy (nginx/caddy) on 80/443 only.

---

## 4. Monitoring & Observability

### 4.1 Prometheus + Grafana (`monitoring/`) ✅ Good Foundation

**What's done well:**
- Prometheus with 30-day retention
- Alert rules with severity levels
- Grafana with provisioning (auto-loaded dashboards)
- OTel Collector with health check filtering

**Issues:**

#### 🔴 CRITICAL — Grafana admin password is hardcoded
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD=hooksniff_grafana_change_me
```
This is in version control. Anyone with repo access has Grafana admin.

**Fix:** Use environment variable or Docker secret:
```yaml
environment:
  - GF_SECURITY_ADMIN_PASSWORD__FILE=/run/secrets/grafana_password
secrets:
  grafana_password:
    file: ./secrets/grafana_password.txt
```

#### 🔴 CRITICAL — OTel auth header is hardcoded in config AND `.env.production.example`
```yaml
# otel-collector-config.yml:
authorization: "Basic MTYyNTQ3NjpnbGNfZXlKdklqb2lNVGMxTnpNek5TSXNJbTRpT2lKb2Iy..."
```
This is a Grafana Cloud API key encoded in base64. It's in version control.

**Fix:** Use environment variable substitution:
```yaml
headers:
  authorization: "${OTEL_AUTH_HEADER}"
```

#### 🟡 MEDIUM — Debug exporter enabled in OTel config
```yaml
exporters:
  debug:
    verbosity: basic
```
And it's in the traces pipeline:
```yaml
exporters: [otlp/jaeger, otlphttp/grafana, debug]
```
Remove debug exporter from production config.

#### 🟡 MEDIUM — No node_exporter for system metrics
Alert rules reference `node_memory_MemTotal_bytes` and `node_filesystem_avail_bytes` but there's no node_exporter in the monitoring compose.

**Fix:** Add node_exporter:
```yaml
node-exporter:
  image: prom/node-exporter:latest
  ports:
    - "9100:9100"
```

### 4.2 Alert Rules ✅ Well-Designed

**What's done well:**
- Critical: High error rate, delivery failures, service down
- Warning: High latency, queue latency, DB latency, memory, disk
- Proper `for:` durations to avoid flapping
- Humanized descriptions

**Missing alerts:**

#### 🟡 Add these alerts:
- **Certificate expiry** (if managing TLS)
- **Redis connection failures**
- **Database connection pool exhaustion**
- **Webhook queue depth** (if using PostgreSQL-based queue)
- **Rate limit threshold approaching**

---

## 5. Security

### 5.1 TLS Configuration

#### 🔴 CRITICAL — No TLS termination configured
All compose files expose plain HTTP. The Oracle Cloud setup opens port 80/443 but has no reverse proxy with TLS.

**Fix:** Add Caddy or nginx with automatic TLS:
```yaml
caddy:
  image: caddy:latest
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy-data:/data
```

### 5.2 CORS Configuration

#### 🟡 MEDIUM — Duplicate CORS origins
```yaml
# render.yaml:
CORS_ORIGINS: https://hooksniff.vercel.app,https://hooksniff.vercel.app
```
Same origin listed twice. Minor but indicates copy-paste.

#### 🟡 MEDIUM — CORS allows all HTTPS origins in Next.js config
```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**' },
  ],
},
```
This allows images from any HTTPS source. Tighten to known domains.

### 5.3 CSP Headers ✅ Good

The Next.js config has a solid Content-Security-Policy. However:

#### 🟡 MEDIUM — `'unsafe-inline'` and `'unsafe-eval'` in CSP
```javascript
"script-src 'self' 'unsafe-inline' 'unsafe-eval'"
```
This weakens XSS protection. For Next.js, consider using nonces.

### 5.4 Secret Management

#### 🔴 CRITICAL — Multiple secrets in version control

| File | Secret | Risk |
|------|--------|------|
| `.env.production.example` | OTEL auth header (base64 encoded API key) | High |
| `monitoring/otel-collector-config.yml` | Same OTEL auth header | High |
| `monitoring/docker-compose.monitoring.yml` | Grafana admin password | High |
| `deploy/helm/hooksniff/values.yaml` | JWT_SECRET, HMAC_SECRET defaults | Medium |
| `docker-compose.staging.yml` | Fallback passwords | Medium |
| `deploy/gcp-deploy.sh` | References .env.production file | Low |

**Fix:**
1. Remove all secrets from version control immediately
2. Rotate the Grafana Cloud API key
3. Use `.env.example` with placeholder values only
4. Add `monitoring/` to `.gitignore` or use template files

### 5.5 Network Policies

#### 🟡 MEDIUM — No network segmentation in Docker
Dev compose puts all services on the default network. The prod compose uses a custom bridge network, which is better, but:

**Fix:** Use internal networks for backend services:
```yaml
networks:
  frontend:
    driver: bridge
  backend:
    internal: true
    driver: bridge
```

---

## 6. Performance

### 6.1 CDN Configuration

#### 🟡 MEDIUM — No CDN for dashboard
The dashboard is deployed on Vercel (which has its own CDN), but the API has no CDN/caching layer.

**Fix:** For Cloud Run, consider:
- Cloud CDN in front of Cloud Run
- Cache-Control headers for static API responses (endpoint lists, etc.)

### 6.2 Connection Pooling

#### 🟡 MEDIUM — No explicit connection pool configuration
The `.env.production.example` has `DATABASE_URL` but no pool settings.

**Fix:** Add to environment:
```
DB_MAX_CONNECTIONS=20
DB_MIN_CONNECTIONS=5
DB_CONNECTION_TIMEOUT=30
```

### 6.3 Resource Limits

#### ✅ Production compose has proper limits
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: "1.0"
```

#### 🟡 MEDIUM — Dev compose has no resource limits
The dev `docker-compose.yml` has no resource limits. A runaway build could consume all host resources.

### 6.4 Cloud Run Scaling

#### 🟡 MEDIUM — `min-instances: 0` means cold starts
```bash
--min-instances=0
```
For a webhook delivery service, cold starts can cause delays. Consider `min-instances=1` for the API.

---

## 7. Backup & Disaster Recovery

### 7.1 Backup Scripts ✅ Excellent

**What's done well:**
- Multiple storage backends (local, S3, GCS)
- Compression (gzip)
- Integrity verification
- Retention cleanup
- Redis backup support
- R2 upload support

**Issues:**

#### 🟡 MEDIUM — No automated backup scheduling
Backup scripts exist but there's no cron job, GitHub Action, or systemd timer to run them automatically.

**Fix:** Add a GitHub Action or cron:
```yaml
# .github/workflows/backup.yml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

#### 🟡 MEDIUM — No backup restoration testing
The restore script exists but there's no automated test that verifies backups are restorable.

### 7.2 No Disaster Recovery Runbook

**Fix:** Create `docs/RUNBOOK.md` with:
- Step-by-step recovery procedures
- RTO/RPO targets
- Contact information
- Escalation paths

---

## 8. Configuration Inconsistencies

### 8.1 Domain/URL Chaos

| File | Domain Used |
|------|-------------|
| `render.yaml` | `hooksniff.vercel.app` |
| `gcp-deploy.sh` | `hooksniff.is-a.dev` |
| `deploy/env.production.example` | `hooksniff.is-a.dev` |
| `.env.production.example` | `hooksniff.vercel.app` |
| `next.config.js` | `hooksniff-api-1046140057667.europe-west1.run.app` |
| `api-env.yaml` | `hooksniff.vercel.app` |
| `deploy/gcp-deploy.sh` | `api.hooksniff.is-a.dev` |

**At least 4 different domain names** are used across configs. This will cause CORS failures, broken redirects, and confused OAuth callbacks.

**Fix:** Establish a single source of truth for domains. Create `config/domains.env`:
```
API_URL=https://api.hooksniff.dev
DASHBOARD_URL=https://hooksniff.vercel.app
APP_URL=https://hooksniff.dev
```

### 8.2 OTEL Endpoint Inconsistency

| File | Endpoint |
|------|----------|
| `.env.production.example` | `otlp-gateway-prod-eu-west-2.grafana.net` |
| `gcp-deploy.sh` | `otlp-gateway-prod-us-east-0.grafana.net` |
| `otel-collector-config.yml` | `otlp-gateway-prod-eu-west-2.grafana.net` |

Two different Grafana Cloud regions referenced.

### 8.3 Polar Product ID Inconsistency

| File | POLAR_PRODUCT_PRO |
|------|-------------------|
| `.env.production.example` | `ec5826ad-4a01-4146-b2d0-3b99eaf150a5` |
| `gcp-deploy.sh` | `79fee3f9-04a2-46c1-804e-8ca7542b8119` |
| `render.yaml` | `ec5826ad-4a01-4146-b2d0-3b99eaf150a5` |

Two different product IDs for the same plan.

---

## 9. Priority Action Items

### 🔴 Critical (Fix immediately)

1. **Remove secrets from version control** — OTEL headers, Grafana password, Helm defaults
2. **Add TLS termination** — Caddy/nginx reverse proxy with automatic certificates
3. **Add rollback to CI/CD deploy** — Health check verification + automatic rollback
4. **Standardize domain names** — Single source of truth across all configs
5. **Fix staging default passwords** — Fail-fast if env vars not set

### 🟡 High (Fix this sprint)

6. **Add `--start-period` to dev Dockerfile.api HEALTHCHECK**
7. **Add HEALTHCHECK to Dockerfile.worker**
8. **Pin Docker base images to SHA256 digests**
9. **Add dependency caching to dev Dockerfiles**
10. **Standardize secret names across deploy scripts**
11. **Remove debug exporter from OTel production config**
12. **Add automated backup scheduling**
13. **Add dashboard tests to CI**

### 🟢 Medium (Fix this quarter)

14. **Add Terraform for HookSniff's own infrastructure**
15. **Add HPA to Helm chart**
16. **Add node_exporter to monitoring stack**
17. **Add connection pool configuration**
18. **Add network segmentation to Docker compose**
19. **Create disaster recovery runbook**
20. **Tighten CSP headers (remove unsafe-inline/eval)**
21. **Add missing alert rules (cert expiry, Redis, queue depth)**
22. **Set `min-instances=1` for API on Cloud Run**
23. **Add release verification (smoke tests)**

---

## 10. Best Practices Checklist

| Practice | Status | Notes |
|----------|--------|-------|
| Multi-stage Docker builds | ✅ | All Dockerfiles |
| Non-root containers | ✅ | All Dockerfiles |
| Health checks | ⚠️ | Missing on worker, no start-period in dev |
| Resource limits | ⚠️ | Prod only, not dev |
| Secret management | ❌ | Secrets in version control |
| TLS everywhere | ❌ | No TLS termination |
| CI before deploy | ✅ | workflow_run trigger |
| Staging environment | ⚠️ | Exists but not in CI/CD pipeline |
| Rollback strategy | ❌ | No automatic rollback |
| Backup automation | ⚠️ | Scripts exist, not scheduled |
| Monitoring | ✅ | Prometheus + Grafana + OTel |
| Alerting | ✅ | Good rule coverage |
| Log aggregation | ⚠️ | JSON logging, but no centralized collection |
| Dependency updates | ✅ | Dependabot configured |
| Security audits | ✅ | cargo-audit + npm audit in CI |
| Infrastructure as Code | ⚠️ | Partial (Helm, no Terraform for infra) |
| Documentation | ✅ | Good README, deploy guides |

---

## Appendix: File-by-File Quick Reference

| File | Grade | Key Issue |
|------|-------|-----------|
| `Dockerfile.api` | B+ | Missing start-period, no dep cache |
| `Dockerfile.worker` | B | No HEALTHCHECK |
| `Dockerfile.dashboard` | A- | Clean |
| `docker-compose.yml` | A- | Clean dev setup |
| `docker-compose.staging.yml` | B | Weak default passwords |
| `cloudbuild.yaml` | B | Only `:latest` tag, no SHA |
| `render.yaml` | B+ | Duplicate CORS, hardcoded product IDs |
| `Makefile` | A | Comprehensive, well-documented |
| `.env.production.example` | C | Contains real OTEL key |
| `deploy/Dockerfile.api.prod` | A- | Good dep caching |
| `deploy/docker-compose.prod.yml` | A- | Good resource limits |
| `deploy/gcp-deploy.sh` | B+ | Fragile env sourcing |
| `.github/workflows/ci.yml` | A- | Missing dashboard tests |
| `.github/workflows/deploy.yml` | B | No rollback |
| `.github/workflows/release.yml` | B+ | No smoke tests |
| `monitoring/` | B | Hardcoded creds, missing node_exporter |
| `terraform/` | A- | Clean provider (product feature) |
| `deploy/helm/` | B | Hardcoded secrets, no HPA |
| `next.config.js` | B+ | Overly broad image patterns, unsafe CSP |
