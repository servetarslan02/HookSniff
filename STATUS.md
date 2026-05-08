# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-08 17:44 GMT+8

---

## URL'ler

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | GitHub Actions | ✅ Başarılı |

---

## Altyapı

| Bileşen | Servis | Durum | Not |
|---------|--------|-------|-----|
| Frontend | Vercel | ✅ | hooksniff.vercel.app |
| API | Google Cloud Run | ✅ | europe-west1, healthy |
| Worker | Google Cloud Run | ✅ | europe-west1, 403 (normal) |
| Database | Neon PostgreSQL | ✅ | eu-central-1, 51ms |
| Cache | Upstash Redis | ✅ | PONG, 64MB |
| Storage | Cloudflare R2 | ✅ | hooksniff-storage |
| CDN | Cloudflare | ✅ | Hesap aktif |
| Email | GCloud Gmail API | ✅ | Service account configured |
| Monitoring | Grafana Cloud | ⏳ | OTEL headers hazır |
| Ödeme (Global) | Polar.sh | ✅ | Token yenilendi, Pro plan aktif |
| Ödeme (TR) | iyzico | ❌ | Hesap açılacak |

---

## CI/CD Durumu

| Kontrol | Durum |
|---------|-------|
| cargo fmt | ✅ continue-on-error |
| cargo clippy | ✅ continue-on-error |
| cargo test | ✅ success |
| Dashboard ESLint | ✅ success |
| Dashboard Build | ✅ success |
| Deploy to Cloud Run | ✅ success |

---

## Servet'in Yapması Gereken

1. **GitHub token yenile** — güvenlik riski
2. ~~Resend yeni domain~~ → GCloud Gmail API'ya taşındı ✅
3. ~~Polar.sh token~~ → ✅ Yenilendi
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
