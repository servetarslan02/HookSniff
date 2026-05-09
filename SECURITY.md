# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| latest  | ✅ Yes             |
| < 1.0   | ⚠️ Best effort     |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

### How to Report

- **GitHub**: [Private Security Advisory](https://github.com/servetarslan02/HookSniff/security/advisories/new)
- **Email**: security@hooksniff.com

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix & patch | Critical: 30 days, Other: 90 days |
| Public disclosure | After fix is deployed |

---

## Security Architecture

### Authentication

**API Keys** (programmatic access)
- Format: `hr_live_*` (production) / `hr_test_*` (test)
- Stored as Argon2id hashes — plaintext keys never persisted
- Key prefix (first 15 chars) used for DB lookup, full key verified against Argon2 hash
- Test keys mark deliveries as `is_test=true` and skip real delivery
- Keys support rotation via `POST /v1/api-keys/{id}/rotate`

**JWT Tokens** (dashboard access)
- Signed with HS256, 24-hour expiry
- Stored in HttpOnly, Secure, SameSite=Strict cookies (`hooksniff_token`)
- Refresh tokens: separate HttpOnly cookie, 30-day expiry (`hooksniff_refresh`)
- Never exposed in response body or localStorage
- Supports cookie-based auth for frontend (`Authorization: Bearer cookie`)

**Two-Factor Authentication (TOTP)**
- RFC 6238 compatible (Google Authenticator, Authy, etc.)
- Endpoints: `POST /v1/auth/2fa/enable`, `/confirm`, `/verify`, `/disable`
- Optional per-user activation

**Password Security**
- Argon2id hashing (memory-hard, GPU-resistant)
- Password reset via time-limited email tokens (1 hour expiry)
- Email verification required on registration
- Change password endpoint with current password verification

### Webhook Signature Verification

Follows [Standard Webhooks](https://www.standardwebhooks.com/) spec:

```
signed_content = "{webhook_id}.{webhook_timestamp}.{body}"
signature = "v1," + base64(hmac_sha256(secret, signed_content))
```

Implementation details (`api/src/signing.rs`):
- Secrets: `whsec_` prefix, base64-encoded
- Constant-time comparison (XOR fold) — prevents timing attacks
- Replay protection: ±5 minute timestamp tolerance (configurable via `WEBHOOK_TIMESTAMP_TOLERANCE_SECS`)
- Dual headers: Standard (`webhook-id`, `webhook-signature`, `webhook-timestamp`) + legacy Svix (`svix-id`, `svix-signature`, `svix-timestamp`)
- Secret rotation: `POST /v1/endpoints/{id}/rotate-secret` with 24-hour overlap

### SSRF Protection

All webhook delivery URLs validated before sending (`api/src/ssrf.rs`):

| Blocked | Examples |
|---------|----------|
| Private IPv4 | `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` |
| Loopback | `127.0.0.0/8`, `::1`, `localhost`, `0.0.0.0` |
| Link-local | `169.254.0.0/16`, `fe80::/10` |
| Unique local IPv6 | `fc00::/7` |
| Metadata endpoints | `169.254.169.254` (AWS/GCP/Azure), `metadata.google.internal`, `metadata.goog` |
| Invalid schemes | Only `http` and `https` allowed |

DNS resolution validated — all resolved IPs checked against blocked ranges.

### Rate Limiting

Sliding window algorithm (`api/src/rate_limit.rs`):
- Pluggable backend: In-memory (dev) or Redis/Upstash (production)
- Per-customer, per-plan limits
- Login: 10 attempts / 15 minutes per IP
- Registration: 5 attempts / hour per IP

| Plan | Requests/min | Webhooks/month |
|------|-------------|----------------|
| Free | 100 | 10,000 |
| Pro | 1,000 | 50,000 |
| Business | 10,000 | 500,000 |
| Enterprise | Unlimited | Unlimited |

### Per-Endpoint Throttling

Token bucket / sliding window per endpoint (`api/src/throttle/mod.rs`):
- Configurable `throttle_rate` and `throttle_period_secs` per endpoint
- Protects customer servers from overload
- Rate-limited deliveries deferred, not dropped

### Input Validation

`api/src/validation.rs`:
- Event type: alphanumeric + dots + underscores, max 100 chars (`^[a-zA-Z0-9._]{1,100}$`)
- URL: delegated to SSRF protection module
- JSON depth: max 10 nesting levels
- Description: HTML tags stripped, max 500 chars
- Payload size: plan-based limits (256KB–10MB)

### Idempotency & Replay Protection

`api/src/middleware/idempotency.rs`:
- `Idempotency-Key` header with 24-hour TTL
- Body hash verification prevents key reuse with different payloads
- Seen webhook IDs stored for replay window

### Data Protection

- TLS 1.2+ in transit
- Database: `sslmode=require` (Neon PostgreSQL)
- HttpOnly cookies for tokens (XSS mitigation)
- CORS: restricted to `hooksniff.vercel.app` in production
- CSP headers configured
- Payload size limits per plan

### GDPR Compliance

Endpoints (`api/src/routes/auth.rs`):
- `GET /v1/auth/export` — Full data export (JSON)
- `DELETE /v1/auth/account` — Account deletion with cascading deletes (endpoints → deliveries → dead letters → teams)

### Infrastructure

- Non-root container execution (`hooksniff` user in Dockerfile)
- Health checks on all Cloud Run services
- Secrets via GCP Secret Manager (not env vars in production)
- Dependabot: weekly scans for Cargo, npm, GitHub Actions
- CI: `cargo audit` + `npm audit` in security-audit job
- Structured JSON logging in production (`LOG_FORMAT=json`)

### Monitoring

- OpenTelemetry distributed tracing → Grafana Cloud
- `X-Trace-Id` header in every response (32-char hex from OTel span, or UUID fallback)
- `X-Request-ID` header for request correlation
- Prometheus metrics at `/metrics`
- Circuit breaker for failing endpoints

---

## Responsible Disclosure Hall of Fame

_(No reports yet — be the first!)_

## Contact

- Security: security@hooksniff.com
- General: hello@hooksniff.com
