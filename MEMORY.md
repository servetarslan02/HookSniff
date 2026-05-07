# MEMORY.md — HookSniff Agent Hafızası

## Son Güncelleme: 2026-05-08 03:31

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
- Hosting planı: Google Cloud Run + Vercel ($0/ay free tier)

## Hafıza Sistemi
- GitHub'da MEMORY.md, CONTEXT.md, TODO.md, SESSION_NOTES.md, .ai-context/ dosyaları tutuluyor
- **Cron job her 10 dk'da bir otomatik push yapıyor** (job id: 86bea5d7-29e8-4f75-9183-567cc478166e)
- Her oturum başında GitHub'dan pull yapılmalı
- Yerel dosyalar 1 saat sonra siliniyor → GitHub kalıcı

## Son Durum (2026-05-08)
- ✅ Kod incelemesi, rakip analizi, ödeme sistemi entegrasyonu tamamlandı
- ✅ Vercel deploy başarılı (dashboard)
- ✅ Render Docker build hatası düzeltildi (OpenSSL → rustls-tls)
- ✅ Polar.sh hesap açıldı, planlar oluşturuldu
- 🔴 Production deploy henüz yapılmadı
- 🔴 GCP Service Account key bekleniyor
- 🔴 iyzico hesabı açılacak
- 🔴 Credential revokasyonu gerekli (token'lar ifşa oldu)

## Sıradaki İşler
1. Google Cloud Run deploy (GCP key bekleniyor)
2. Cloudflare DNS ayarla (api CNAME)
3. Resend domain doğrulama
4. Credential yenileme
