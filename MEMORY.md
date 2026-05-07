# MEMORY.md — HookSniff Agent Hafızası

## Son Güncelleme: 2026-05-08 04:28

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

## Son Yapılan İşler (Oturum 3)
1. gcloud CLI kuruldu + GCP auth yapıldı
2. Worker health check eklendi (axum HTTP server)
3. Cloud Build ile worker image rebuild edildi
4. Worker Cloud Run'a deploy edildi ✅
5. is-a.dev PR reddedildi (ticari kullanım)
6. Domain araştırması yapıldı → Vercel Rewrite kararı
7. Vercel rewrite + api.ts güncellendi
8. Git author düzeltildi (COMMIT_AUTHOR_REQUIRED hatası)
9. STATUS.md oluşturuldu

## Sıradaki İşler
1. Vercel deploy durumunu doğrula
2. API rewrite'ın çalıştığını test et
3. Resend domain doğrulama (şimdilik Vercel domain ile)
4. Credential yenileme (tüm token'lar ifşa oldu)
5. İlk kazanç → hooksniff.com al

## Hafıza Sistemi
- GitHub'da MEMORY.md, TODO.md, SESSION_NOTES.md, .ai-context/ dosyaları tutuluyor
- Cron job her 10 dk'da bir otomatik push yapıyor
