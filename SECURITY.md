# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| latest  | ✅ Yes             |
| < 1.0   | ⚠️ Best effort     |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security issue in HookSniff, please report it responsibly:

### Email

Send details to: **security@hooksniff.com** (or open a private security advisory on GitHub)

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 5 business days |
| Fix & patch | Within 30 days (critical), 90 days (other) |
| Public disclosure | After fix is deployed |

### Bug Bounty

We don't currently have a formal bug bounty program, but we deeply appreciate responsible disclosure and will credit reporters in our changelog (unless they prefer to remain anonymous).

## Security Measures

### Authentication

- **JWT tokens** — Short-lived (24h), signed with RS256
- **API keys** — Prefix `hr_live_`, hashed with Argon2 before storage
- **Refresh tokens** — HttpOnly, Secure, SameSite=Strict cookies
- **2FA** — TOTP-based two-factor authentication support

### Data Protection

- All data encrypted in transit (TLS 1.2+)
- Passwords hashed with Argon2id
- API keys stored as Argon2 hashes (never plaintext)
- Database connections use SSL (`sslmode=require`)
- HttpOnly cookies for token storage (XSS mitigation)

### Network Security

- CORS restricted to dashboard origin in production
- CSP headers configured
- SSRF protection — blocks private/internal IP ranges on webhook delivery
- Rate limiting per plan (sliding window algorithm)
- Request payload size limits (1MB default)

### Webhook Security

- HMAC-SHA256 signatures (Standard Webhooks compliant)
- Replay protection with ±5 minute timestamp tolerance
- Secret rotation with 24-hour overlap period
- See [docs/SECURITY.md](docs/SECURITY.md) for full signature verification details

### Infrastructure

- Non-root container execution
- Health checks on all services
- Automatic secret rotation via GCP Secret Manager
- Dependabot enabled for Cargo, npm, and GitHub Actions
- Security audit in CI (`cargo audit` + `npm audit`)

### Monitoring

- OpenTelemetry distributed tracing
- Structured JSON logging
- Prometheus metrics
- Grafana Cloud dashboards

## Responsible Disclosure Hall of Fame

We thank the following researchers for responsible disclosure:

_(No reports yet — be the first!)_

## Contact

- Security: security@hooksniff.com
- General: hello@hooksniff.com
