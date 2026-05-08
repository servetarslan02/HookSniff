# 🪝 HookSniff — Durum Özeti

> Son güncelleme: 2026-05-08 23:38 GMT+8

---

## URL'ler

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | GitHub Actions | ✅ 6/6 job geçiyor |

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
| Email | GCloud Gmail API | ✅ | Service account + Gmail API |
| Monitoring | Grafana Cloud | ✅ | OTEL token güncellendi, traces akıyor |
| Ödeme (Global) | Polar.sh | ✅ | Token yenilendi, Pro plan aktif |
| Ödeme (TR) | iyzico | ❌ | Hesap açılacak |

---

## CI/CD Durumu

| Kontrol | Durum |
|---------|-------|
| cargo fmt | ✅ strict (zorunlu) |
| cargo clippy | ✅ strict (-D warnings) |
| cargo test | ✅ success |
| Dashboard ESLint | ✅ success |
| Dashboard Build | ✅ success |
| Deploy to Cloud Run | ✅ success |

---

## Servet'in Yapması Gereken

1. ~~GitHub token yenile~~ → ✅ Yenilendi (Oturum 13)
2. ~~Resend → Gmail API~~ → ✅ Taşındı (Oturum 10)
3. ~~Polar.sh token~~ → ✅ Yenilendi (Oturum 11)
4. **iyzico hesap** — vergi levhası + banka hesabı
5. **Domain kararı** — şimdilik hooksniff.vercel.app yeterli

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
