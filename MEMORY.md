# MEMORY.md — HookSniff Agent Hafızası

## Son Güncelleme: 2026-05-08 03:58

## Hakkımda
- Kullanıcı: **Servet Arslan** (servetarslan02)
- Dil: Türkçe ağırlıklı
- Kod bilgisi yok — tüm teknik işler AI agent'ta
- Hedef: $500/ay gelir → şirket kur

## Proje: HookSniff
- Webhook delivery servisi (geliştiricilere yönelik)
- GitHub: https://github.com/servetarslan02/HookSniff
- Domain: hooksniff.is-a.dev (ücretsiz, is-a.dev)
- Tech stack: Rust (Axum) + Next.js 15 + PostgreSQL (Neon) + Redis (Upstash)
- Hosting: Google Cloud Run (API + Worker) + Vercel (Dashboard)

## Hafıza Sistemi
- GitHub'da MEMORY.md, CONTEXT.md, TODO.md, SESSION_NOTES.md, .ai-context/ dosyaları tutuluyor
- **Cron job her 10 dk'da bir otomatik push yapıyor** (job id: 86bea5d7-29e8-4f75-9183-567cc478166e)
- Her oturum başında GitHub'dan pull yapılmalı
- Yerel dosyalar 1 saat sonra siliniyor → GitHub kalıcı

## GCP Cloud Run Durumu (2026-05-08 03:58)
- ✅ gcloud CLI kuruldu (v567.0.0)
- ✅ Service account auth: hooksniff-deploy@hooksniff-app.iam.gserviceaccount.com
- ✅ Project: hooksniff-app
- ✅ hooksniff (frontend) → https://hooksniff-sdjufmaqka-ew.a.run.app — ÇALIŞIYOR
- ✅ hooksniff-api → https://hooksniff-api-sdjufmaqka-ew.a.run.app — ÇALIŞIYOR
- ✅ hooksniff-worker → https://hooksniff-worker-1046140057667.europe-west1.run.app — ÇALIŞIYOR
  - Health check eklendi (axum HTTP server, PORT=8080)
  - Cloud Build ile image rebuild edildi
  - allUsers IAM policy eklendi

## Artifact Registry
- Repo: europe-west1-docker.pkg.dev/hooksniff-app/hooksniff
- API image: var (latest tag)
- Worker image: var (latest tag eklendi, ama eski build — health check yok)

## DNS ve Domain
- Cloudflare DNS: Henüz yapılmadı
- is-a.dev PR: #37726 açıldı (https://github.com/is-a-dev/register/pull/37726)
- Resend domain: Henüz doğrulanmadı

## Credential Durumu
- GCP Service Account key: .ai-context/gcp-service-account.json'da mevcut
- GitHub PAT: Git remote URL'inde embedded
- Tüm token'lar chat geçmişinde ifşa oldu → deploy sonrası yenilenmeli

## Sıradaki İşler
1. Worker Cloud Run deploy (health check ile)
2. Cloudflare DNS ayarla (api CNAME → Cloud Run URL)
3. Resend domain doğrulama
4. Credential yenileme (tüm token'lar)
5. End-to-end test
