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
│  SSRF    │  Threat  │  Zero    │  Behavioral        │
│Protection│Detection │  Trust   │  Analysis          │
├──────────┴──────────┴──────────┴────────────────────┤
│              PostgreSQL (Encrypted at Rest)           │
│              Redis (TLS in Transit)                   │
└──────────────────────────────────────────────────────┘
```

---

## 1. SSRF Protection

Webhook delivery means we send HTTP requests to URLs our customers provide. This is a prime SSRF attack vector. HookSniff blocks it at multiple layers.

### Private IP Blocking

```rust
// Blocks requests to:
// - 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 (RFC 1918)
// - 127.0.0.0/8 (loopback)
// - 169.254.0.0/16 (link-local / cloud metadata)
// - ::1, fe80::/10 (IPv6 loopback/link-local)
// - 0.0.0.0 (any)
```

### DNS Validation

Before connecting, HookSniff resolves the hostname and checks:
- Resolved IP is not in private ranges
- DNS rebinding protection — re-resolves on each attempt
- DNS cache with TTL to prevent repeated lookups

### Metadata Endpoint Blocking

Explicitly blocks cloud metadata endpoints:
- `169.254.169.254` (AWS, GCP, Azure)
- `metadata.google.internal` (GCP)
- `instance-data` (AWS)

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

### Behavioral Analysis

Real-time detection of suspicious patterns:

| Attack | Detection Method | Response |
|--------|-----------------|----------|
| Credential stuffing | Login velocity per IP | Auto-block IP |
| Token stuffing | Failed auth burst | Rate limit + alert |
| Brute force | Password attempt pattern | Account lockout |
| API key enumeration | Key validation failures | IP block |
| DDoS | Request rate anomaly | Cloudflare challenge |

### IP Reputation Scoring

Each IP gets a reputation score based on:
- Historical behavior (success/failure ratio)
- Known threat intelligence feeds
- Geographic anomalies
- Request pattern analysis

Low-reputation IPs get:
- Increased rate limits
- Additional verification challenges
- Logged for review

### DDoS Protection

- Cloudflare edge protection
- Application-level rate limiting
- Connection limits per IP
- Request size limits (256KB default, 10MB for enterprise)

### Automatic IP Blocking

When threat score exceeds threshold:
1. IP is automatically blocked for 24 hours
2. Block is logged with reason and evidence
3. Admin notification sent
4. Block can be manually overridden

---

## 5. Zero Trust Architecture

### Request Verification

Every request is verified, regardless of source:

```
Request Flow:
1. TLS termination (Cloudflare)
2. JWT/API key extraction
3. Token validation (signature, expiry, revocation)
4. Permission check (scopes, plan limits)
5. Rate limit check
6. Request processing
7. Audit log entry
```

### No Implicit Trust

- Internal services authenticate to each other
- No shared secrets between services
- Each request carries its own credentials
- Service tokens have minimal required scopes

### Network Segmentation

- API servers cannot access customer databases directly
- Worker processes have read-only database access
- Redis is TLS-only with authentication
- Database connections use connection pooling with TLS

---

## 6. Data Security

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

---

## 7. Audit Logging

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

## 8. Infrastructure Security

### Cloudflare

- DDoS protection at edge
- WAF rules for common attacks
- SSL/TLS with HSTS
- Bot management

### Google Cloud Run

- Container isolation
- Automatic scaling
- VPC networking
- IAM with least privilege

### PostgreSQL (Neon)

- Connection pooling with TLS
- Encrypted at rest
- Automated backups
- Point-in-time recovery

### Redis

- TLS-only connections
- AUTH password required
- No public access
- Encrypted at rest

---

## 9. Webhook Security

### Standard Webhooks Compliance

Full compliance with [Standard Webhooks](https://www.standardwebhooks.com/) specification:
- HMAC-SHA256 signatures
- `whsec_` prefixed secrets
- Replay protection (±5 minute window)
- Signature rotation without downtime

### Secret Management

- Secrets are generated with `whsec_` prefix + base64 encoded
- Stored as Argon2id hashes in database
- Rotation creates new secret while old one remains valid for 24 hours
- Multiple signatures supported during rotation window

### Payload Validation

- JSON schema validation (when configured)
- Maximum payload size enforcement
- Content-Type verification
- Idempotency key deduplication (24h TTL)

---

## 10. Incident Response

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

Email: security@hooksniff.com (planned)
