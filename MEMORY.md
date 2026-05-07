# MEMORY.md — HookSniff Agent Hafızası

## Son Güncelleme: 2026-05-08 04:32

## Hakkımda
- Kullanıcı: **Servet Arslan** (servetarslan02)
- Dil: Türkçe ağırlıklı
- Kod bilgisi yok — tüm teknik işler AI agent'ta
- Hedef: $500/ay gelir → şirket kur

## Proje: HookSniff
- Webhook delivery servisi (geliştiricilere yönelik)
- GitHub: https://github.com/servetarslan02/HookSniff
- Tech stack: Rust (Axum) + Next.js 15 + PostgreSQL (Neon) + Redis (Upstash)
- Hosting: Google Cloud Run (API + Worker) + Vercel (Dashboard)

## GCP Cloud Run Durumu (2026-05-08 04:28)
- ✅ gcloud CLI kuruldu (v567.0.0)
- ✅ Service account auth yapıldı
- ✅ hooksniff (frontend) → https://hooksniff-sdjufmaqka-ew.a.run.app
- ✅ hooksniff-api → https://hooksniff-api-sdjufmaqka-ew.a.run.app
- ✅ hooksniff-worker → https://hooksniff-worker-1046140057667.europe-west1.run.app (health check eklendi)

## Domain Durumu
- ❌ is-a.dev PR #37726 kapatıldı (reason: incomplete pr + ticari kullanıma yasak)
- ❌ eu.org erişilemedi (Çin'den engelli)
- 🔄 Vercel Rewrite kuruldu — tek URL: hooksniff.vercel.app (dashboard + API)
- ⏳ Vercel deploy BUILDING durumunda (commit author düzeltildi)

## Vercel Rewrite Planı
- vercel.json'a rewrite eklendi: /api/* → Cloud Run API
- api.ts'de API_BASE production'da "/api" olarak değiştirildi
- Git author "HookSniff AI Agent" → "Servet Arslan" olarak düzeltildi
- Deploy tetiklendi, BUILDING durumunda

## Son Yapılan İşler (Oturum 4 - 2026-05-08)
0. GitHub hafıza sistemi yeniden kuruldu
1. Cron job kuruldu - her 6-7 dk'da GitHub'a otomatik push
2. Servet ile yeni oturum başladı

## Sıradaki İşler
1. Servet'in proje isteklerini bekle
2. Vercel deploy durumunu doğrula
3. API rewrite'ın çalıştığını test et
4. Resend domain doğrulama (şimdilik Vercel domain ile)
5. Credential yenileme (tüm token'lar ifşa oldu)
6. İlk kazanç → hooksniff.com al

## Hafıza Sistemi
- GitHub'da MEMORY.md, TODO.md, SESSION_NOTES.md dosyaları tutuluyor
- Cron job her 6-7 dk'da bir otomatik push yapıyor
- Workspace: /root/.openclaw/workspace/HookSniff
