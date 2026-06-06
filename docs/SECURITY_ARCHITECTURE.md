# Security Architecture — Deep Dive

HookSniff is built security-first. This document covers the full security stack — from network layer to application logic.

For webhook signature verification, see [SECURITY.md](SECURITY.md).

---

## Overview

```
┌──────────────────────────────────────────────────────┐
│                    Cloudflare CDN                     │
│  DDoS Protection · WAF · SSL/TLS Termination        │
├──────────────────────────────────────────────────────┤
│                   API Gateway (Axum)                  │
│  Rate Limiting · JWT Auth · API Key Validation       │
├──────────┬──────────┬──────────┬────────────────────┤
│  SSRF    │  Threat  │  WAF     │  Behavioral        │
│Protection│Detection │ Injection│  Bot Detection     │
├──────────┼──────────┼──────────┼────────────────────┤
│  IP      │  Zero    │  DDoS    │  Compliance        │
│Reputation│  Trust   │Protection│  & Audit           │
├──────────┴──────────┴──────────┴────────────────────┤
│              PostgreSQL (Encrypted at Rest)           │
│              Redis (TLS in Transit)                   │
└──────────────────────────────────────────────────────┘
```

---

## 1. SSRF Protection

Webhook delivery means we send HTTP requests to URLs our customers provide. This is a prime SSRF attack vector. HookSniff blocks it at multiple layers.

### Private IP Blocking

Blocks requests to:
- `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (RFC 1918)
- `127.0.0.0/8` (loopback)
- `169.254.0.0/16` (link-local / cloud metadata)
- `::1`, `fe80::/10` (IPv6 loopback/link-local)
- `0.0.0.0` (any)

### DNS Validation

Before connecting, HookSniff resolves the hostname and checks:
- Resolved IP is not in private ranges
- DNS rebinding protection — re-resolves on each attempt
- DNS cache with TTL to prevent repeated lookups

### Metadata Endpoint Blocking

Explicitly blocks cloud metadata endpoints:
- `169.254.169.254` (AWS, GCP, Azure)
- `metadata.google.internal` (GCP)

### URL Validation

- Scheme must be `http` or `https`
- No `file://`, `ftp://`, `gopher://`, `data:` schemes
- Hostname must be valid FQDN
- Maximum URL length: 2048 characters

---

## 2. Authentication & Authorization

### API Key Authentication

```
Header: Authorization: Bearer hr_live_abc123...
```

| Prefix | Mode | Description |
|--------|------|-------------|
| `hr_live_` | Production | Full access to production data |
| `hr_test_` | Test mode | Isolated test environment |

**Storage:** Keys are stored as Argon2id hashes. The raw key is only shown once at creation. Even HookSniff operators cannot retrieve your keys.

**Key metadata stored:**
- Name, creation date, last used
- Scopes (read, write, admin)
- Rate limit overrides per key

### JWT Authentication (Dashboard)

```
Header: Authorization: Bearer eyJhbG...
```

- HS256 signed with server secret
- 60-minute expiry with automatic refresh
- Refresh tokens: one-time-use with grace period
- Multi-tab coordination via BroadcastChannel
- Proactive refresh at 50 minutes (before 60-min expiry)
- Inactivity auto-logout after 1 hour idle

### Two-Factor Authentication (TOTP)

- Standard TOTP (RFC 6238) compatible with Google Authenticator, Authy, 1Password
- 6-digit codes, 30-second window
- Backup codes for account recovery
- Enforced for admin accounts

### SSO / SAML

- Enterprise single sign-on
- SAML 2.0 protocol
- Auto-team assignment based on email domain
- Admin bypass for verified domains
- Multi-team support per SSO connection

### OAuth

- Google and GitHub social login
- PKCE flow for security
- Account linking (existing accounts can connect OAuth)

---

## 3. Rate Limiting

### Sliding Window Algorithm

```
Plan        Requests/min   Webhooks/day   Endpoints
──────────────────────────────────────────────────────
Free        100            1,000          5
Pro         1,000          30,000         50
Business    10,000         100,000        500
Enterprise  Unlimited      Unlimited      Unlimited
```

### Per-Endpoint Throttling

Token bucket / sliding window per endpoint to protect customer servers:
- Configurable rate limit per endpoint
- Burst allowance for traffic spikes
- 429 responses with `Retry-After` header

### API Key Rate Limits

Each API key can have custom rate limit overrides, independent of plan limits.

---

## 4. Threat Detection

Real-time behavioral analysis using Redis counters for fast lookups. Falls back to in-memory counters if Redis unavailable.

### Detected Threat Types

| Attack | Detection Method | Response |
|--------|-----------------|----------|
| Brute force | Login velocity per IP | Auto-block IP |
| Credential stuffing | Failed auth burst | Rate limit + alert |
| API abuse | Request pattern anomaly | Rate limit |
| Data exfiltration | Bulk data access pattern | Alert + rate limit |
| Suspicious pattern | Behavioral fingerprinting | Warn + log |
| DDoS attempt | Request rate anomaly | Block |
| Scanner detected | Sequential path probing | Block |

### Threat Actions

- **Allow** — normal request, no threat detected
- **Warn** — suspicious but not confirmed, log for review
- **Rate limit** — slow down the source
- **Block** — immediate block, request rejected

---

## 5. WAF — Injection Detection

Context-aware, recursive decoding, AST-level analysis. Unlike simple pattern matching, this understands SQL/XSS/Path syntax.

### Features

- **Recursive URL decoding** — handles single, double, triple encoding
- **SQL injection detection** — understands SQL syntax, not just pattern matching
- **XSS detection** — script injection, event handlers, data URIs
- **Path traversal detection** — `../`, encoded variants
- **Confidence scoring** — each detection has a confidence level
- **Severity classification** — low, medium, high, critical

### Detection Flow

```
Input → Recursive URL Decode → Pattern Analysis → Context Check → Result
         (handles %2527 → '    (SQL/XSS/Path)    (is it in a     (is_attack,
                                                  safe context?)   confidence, type)
```

---

## 6. Behavioral Bot Detection

Tracks request patterns over time to detect bots that evade user-agent and path-based detection.

### Behavioral Fingerprinting

- **Request timing patterns** — too regular = bot
- **Session depth** — too many pages too fast
- **Resource request patterns** — no CSS/JS = bot
- **Navigation patterns** — sequential paths = scanner

### Profile Data Per IP

- Request timestamps (for interval analysis)
- Paths visited (for navigation pattern)
- Methods used (GET/POST distribution)
- Status codes received (error pattern)
- Average interval and variance
- Total requests and session duration

---

## 7. IP Reputation

Multi-source IP reputation checking. Each IP gets a score 0-100 (higher = more dangerous).

### Reputation Sources

| Source | Description |
|--------|-------------|
| Internal | From our own security_events table |
| CIDR block | Known bad IP ranges |
| AbuseIPDB | Third-party threat intelligence (when API key available) |

### Reputation Actions

- Score 0-30: Normal processing
- Score 31-60: Increased logging, tighter rate limits
- Score 61-80: Challenge required, limited access
- Score 81-100: Blocked

### Caching

Reputation scores are cached in-memory with configurable TTL to avoid repeated lookups.

---

## 8. DDoS Protection

Multi-layer rate limiting using Upstash Redis for distributed rate limiting across instances. Falls back to in-memory if Redis unavailable.

### Adaptive Baselines

- **EWMA baseline** — learns normal requests per minute
- **Adaptive multiplier** — 3× baseline triggers block
- **Continuous learning** — baseline updates every minute

### Layers

1. **Cloudflare edge** — volumetric DDoS absorption
2. **Application rate limit** — sliding window per IP
3. **Adaptive threshold** — dynamic based on traffic patterns
4. **Connection limit** — max concurrent connections per IP
5. **Request size limit** — 256KB default, 10MB for enterprise

---

## 9. Zero Trust Architecture

"Never trust, always verify" — continuous authentication and authorization.

### Request Verification

Every request is verified, regardless of source:

```
Request Flow:
1. TLS termination (Cloudflare)
2. JWT/API key extraction
3. Token validation (signature, expiry, revocation)
4. Permission check (scopes, plan limits)
5. Zero Trust verification (account active, risk score)
6. Rate limit check
7. Request processing
8. Audit log entry
```

### Risk Scoring

Each request gets a risk score based on:
- Account status (active, suspended)
- IP reputation
- Request pattern (normal vs anomalous)
- Time of day (business hours vs off-hours)
- Geographic location

### No Implicit Trust

- Internal services authenticate to each other
- No shared secrets between services
- Each request carries its own credentials
- Service tokens have minimal required scopes

---

## 10. Compliance & Audit

### Automated Compliance Checks

Runs periodically and on-demand:

| Check | Description |
|-------|-------------|
| Expired API keys | Finds keys past expiry still active |
| 2FA adoption | Checks percentage of users with 2FA |
| Password policy | Validates password strength |
| Orphaned API keys | Keys without valid owner |
| Admin count | Excessive admin accounts |
| Audit coverage | Completeness of audit logging |

### GDPR Compliance

- **Data export** — `GET /v1/auth/export` returns all user data
- **Account deletion** — `DELETE /v1/auth/account` permanently removes all data
- **Data minimization** — only collect what's needed
- **Right to rectification** — users can update their data via API

### KVKK Compliance (Turkey)

HookSniff is KVKK compliant for Turkish users:
- Data processing consent
- Right to access and deletion
- Data portability
- Breach notification procedures

### SOC 2 Readiness

Controls in place:
- Access controls and authentication
- Audit logging
- Encryption at rest and in transit
- Incident response procedures
- Change management

---

## 11. Data Security

### Encryption

| Layer | Method | Details |
|-------|--------|---------|
| In transit | TLS 1.3 | All HTTP traffic, database connections |
| At rest | AES-256 | PostgreSQL, Redis, file storage |
| Secrets | Argon2id | API keys, passwords |
| Signing | HMAC-SHA256 | Webhook signatures |

### Data Isolation

- Customer data is logically separated by `customer_id`
- Test mode data is completely isolated from production
- Team data is scoped by team membership
- Admin access requires explicit admin flag

### Data Retention

| Plan | Retention | Deletion |
|------|-----------|----------|
| Free | 7 days | Automatic |
| Pro | 30 days | Automatic |
| Business | 90 days | Automatic |
| Enterprise | 365 days | Custom |

---

## 12. Audit Logging

Every significant action is logged:

```json
{
  "id": 12345,
  "customer_id": "uuid",
  "action": "api_key.created",
  "resource_type": "api_key",
  "resource_id": "uuid",
  "ip_address": "1.2.3.4",
  "user_agent": "Mozilla/5.0...",
  "metadata": { "key_name": "Production Key" },
  "created_at": "2026-06-07T00:00:00Z"
}
```

**Logged events:**
- Authentication (login, logout, failed attempts)
- API key operations (create, rotate, delete)
- Endpoint changes (create, update, delete)
- Webhook operations (send, replay, batch)
- Team operations (invite, remove, role change)
- Billing events (upgrade, downgrade, payment)
- Admin actions (user management, system changes)

---

## 13. Incident Response

### Automated Response

1. **Detection** — anomaly scores, threat detection, health checks
2. **Classification** — severity levels (low, medium, high, critical)
3. **Containment** — auto-disable endpoints, block IPs, rate limit
4. **Recovery** — self-healing strategies, fallback routing
5. **Post-mortem** — action memory, healing effectiveness tracking

### Manual Response

- Admin dashboard with real-time alerts
- Webhook delivery pause/resume per endpoint
- Emergency endpoint disable
- Bulk replay for missed deliveries

---

## Compliance Summary

| Standard | Status | Notes |
|----------|--------|-------|
| GDPR | ✅ Compliant | Data export, deletion, minimization |
| SOC 2 | 🔄 Ready | Controls in place, audit pending |
| CCPA | ✅ Compliant | California consumer privacy |
| KVKK | ✅ Compliant | Turkish data protection |
| Standard Webhooks | ✅ Compliant | Full specification support |
| CloudEvents v1.0 | ✅ Supported | Standard event format |
| ISO 27001 | 🔄 Planned | Information security management |

---

## Security Contact

For security vulnerabilities, see [SECURITY.md](SECURITY.md). **Do not open public issues for security bugs.**
