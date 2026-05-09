# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-09

---

## URL'ler

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | GitHub Actions | ✅ Active |

---

## Altyapı

| Bileşen | Servis | Durum | Not |
|---------|--------|-------|-----|
| Frontend | Vercel | ✅ | hooksniff.vercel.app |
| API | Google Cloud Run | ✅ | europe-west1 |
| Worker | Google Cloud Run | ✅ | europe-west1 |
| Database | Neon PostgreSQL | ✅ | eu-central-1 |
| Cache | Upstash Redis | ✅ | Serverless |
| Storage | Cloudflare R2 | ✅ | hooksniff-storage |
| CDN | Cloudflare | ✅ | Free tier |
| Email | Gmail API | ✅ | GCP Service Account |
| Monitoring | Grafana Cloud | ✅ | OpenTelemetry |
| Billing (Global) | Polar.sh | ✅ | Pro plan aktif |
| Billing (TR) | iyzico | ❌ | Hesap açılacak |

---

## CI/CD Durumu

| Kontrol | Durum |
|---------|-------|
| cargo fmt | ✅ strict |
| cargo clippy | ✅ strict (-D warnings) |
| cargo test | ✅ |
| Dashboard ESLint | ✅ |
| Dashboard Build | ✅ |
| Security Audit | ✅ |
| Deploy to Cloud Run | ✅ |

---

## GitHub Docs Durumu

| Dosya | Durum |
|-------|-------|
| README.md | ✅ Badge'ler, features, pricing, API endpoints |
| CONTRIBUTING.md | ✅ 30 route module, dev setup, PR process |
| SECURITY.md | ✅ Kod referanslı güvenlik politikası |
| CODE_OF_CONDUCT.md | ✅ Contributor Covenant v2.0 |
| CHANGELOG.md | ✅ v0.1.0 tüm modüller documented |
| LICENSE | ✅ MIT |
| FEATURES.md | ✅ Tüm modüller documented |
| docs/DEPLOYMENT.md | ✅ Cloud Run + Polar.sh |
| docs/quickstart.md | ✅ Standard Webhooks format |
| docs/examples.md | ✅ Node.js + Python Standard Webhooks |
| .github/ISSUE_TEMPLATE/ | ✅ Bug report + feature request |
| .github/PULL_REQUEST_TEMPLATE.md | ✅ |
| .github/FUNDING.yml | ✅ GitHub Sponsors |

---

## Servet'in Yapması Gereken

1. ~~GitHub token yenile~~ → ⚠️ Yeni token oluşturulmalı (chat'te paylaşıldı)
2. ~~GCP SA key rotate~~ → ⚠️ Yeni key oluşturulmalı (chat'te paylaşıldı)
3. **iyzico hesap** — vergi levhası + banka hesabı
4. **Domain kararı** — şimdilik hooksniff.vercel.app yeterli

---

## Maliyet ($0/ay)

| Servis | Free Tier |
|--------|-----------|
| Vercel | ✅ 100GB bant genişliği |
| Cloud Run | ✅ 2 milyon istek/ay |
| Neon | ✅ 512MB PostgreSQL |
| Upstash | ✅ 10K komut/gün |
| Cloudflare R2 | ✅ 10GB depolama |
| Grafana | ✅ 10K log/ay |
