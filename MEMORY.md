# MEMORY.md — HookSniff Agent Hafızası

## Son Güncelleme: 2026-05-08 03:55

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
- Hosting: **Google Cloud Run** (API + Worker) + Vercel (Dashboard)

## Hafıza Sistemi
- GitHub'da MEMORY.md, CONTEXT.md, TODO.md, SESSION_NOTES.md, .ai-context/ dosyaları tutuluyor
- **Cron job her 10 dk'da bir otomatik push yapıyor**
- Her oturum başında GitHub'dan pull yapılmalı
- Yerel dosyalar 1 saat sonra siliniyor → GitHub kalıcı

## Son Durum (2026-05-08)
- ✅ Kod incelemesi, rakip analizi, ödeme sistemi entegrasyonu tamamlandı
- ✅ Vercel deploy başarılı (dashboard)
- ✅ Render Docker build hatası düzeltildi (OpenSSL → rustls-tls)
- ✅ Polar.sh hesap açıldı, planlar oluşturuldu
- ✅ **Google Cloud Run deploy başarılı!**
  - API: https://hooksniff-api-sdjufmaqka-ew.a.run.app
  - Worker: https://hooksniff-worker-sdjufmaqka-ew.a.run.app
  - Health check'ler çalışıyor
- 🔴 Custom domain mapping yapılmadı (is-a.dev DNS kontrolü gerekli)
- 🔴 iyzico hesabı açılacak
- 🔴 Credential revokasyonu gerekli (token'lar ifşa oldu)

## Sıradaki İşler
1. Custom domain mapping (api.hooksniff.is-a.dev)
2. Resend domain doğrulama
3. Credential yenileme
4. Render servislerini kapat
5. Database migration (tabloları oluştur)
