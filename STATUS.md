# HookSniff — Status Overview

> Last updated: 2026-06-03

---

## Live URLs

| Service | URL | Status |
|---------|-----|--------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | GitHub Actions | ✅ Active |

---

## Infrastructure

| Component | Service | Status | Notes |
|-----------|---------|--------|-------|
| Frontend | Vercel | ✅ | hooksniff.vercel.app |
| API | Google Cloud Run | ✅ | europe-west1 |
| Worker | Google Cloud Run | ✅ | europe-west1 |
| Database | Neon PostgreSQL | ✅ | eu-central-1 |
| Cache | Upstash Redis | ✅ | Serverless |
| Storage | Cloudflare R2 | ✅ | hooksniff-storage |
| CDN | Cloudflare | ✅ | Free tier |
| Email | Gmail API | ✅ | GCP Service Account |
| Monitoring | Grafana Cloud | ✅ | OpenTelemetry |
| Billing (Global) | Polar.sh | ✅ | Pro plan active |
| Billing (Turkey) | iyzico | ⏳ | Account pending |

---

## CI/CD Status

| Check | Status |
|-------|--------|
| `cargo fmt` | ✅ strict |
| `cargo clippy` | ✅ strict (`-D warnings`) |
| `cargo test` | ✅ |
| Dashboard ESLint | ✅ |
| Dashboard Build | ✅ |
| Security Audit | ✅ |
| Deploy to Cloud Run | ✅ |

---

## Documentation Status

| File | Status |
|------|--------|
| README.md | ✅ Badges, features, pricing, API endpoints, SDK examples |
| CONTRIBUTING.md | ✅ 30 route modules, dev setup, PR process |
| SECURITY.md | ✅ Code-referenced security policy, Cortex AI |
| CODE_OF_CONDUCT.md | ✅ Contributor Covenant v2.0 |
| CHANGELOG.md | ✅ v0.1.0 all modules documented |
| LICENSE | ✅ MIT |
| FEATURES.md | ✅ All modules documented |
| docs/DEPLOYMENT.md | ✅ Cloud Run + Polar.sh |
| docs/QUICKSTART.md | ✅ 5-minute quickstart |
| docs/examples.md | ✅ Node.js + Python Standard Webhooks |
| .github/ISSUE_TEMPLATE/ | ✅ Bug report + feature request |
| .github/PULL_REQUEST_TEMPLATE.md | ✅ |
| .github/FUNDING.yml | ✅ GitHub Sponsors |

---

## Monthly Cost ($0/month)

| Service | Free Tier |
|---------|-----------|
| Vercel | ✅ 100GB bandwidth |
| Cloud Run | ✅ 2M requests/month |
| Neon | ✅ 512MB PostgreSQL |
| Upstash | ✅ 10K commands/day |
| Cloudflare R2 | ✅ 10GB storage |
| Grafana | ✅ 10K logs/month |
