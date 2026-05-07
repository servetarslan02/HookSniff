# MEMORY.md — HookSniff AI Agent Hafızası

## Hakkımda
- Kullanıcı: **Servet Arslan** (servetarslan02)
- Dil: Türkçe ağırlıklı
- Konum: Türkiye
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
- Cron job her 8 dk'da bir otomatik push yapıyor
- Her oturum başında GitHub'dan pull yapılmalı
- Yerel dosyalar 1 saat sonra siliniyor → GitHub kalıcı
- Tüm token'lar .ai-context/EXTERNAL_TOKENS.md'de kayıtlı

## Son Durum (2026-05-08)
- Önceki agent "Mamo" ile 2026-05-06'da kapsamlı çalışma yapılmış
- Kod incelemesi, rakip analizi, ödeme sistemi entegrasyonu tamamlanmış
- Vercel deploy başarılı (dashboard)
- ✅ Render Docker build hatası düzeltildi (OpenSSL → rustls-tls)
- Polar.sh hesap açıldı, planlar oluşturuldu
- iyzico hesabı açılacak
- Production deploy henüz yapılmadı → sırada

## Yapılacak Sıradaki İşler
1. ✅ Render Docker build hatası düzeltildi (OpenSSL → rustls-tls)
2. Render'da yeniden deploy et
3. Neon PostgreSQL → zaten kurulur (connection string mevcut)
4. Upstash Redis → zaten kurulur (connection string mevcut)
5. Google Cloud Run deploy et (gcp-deploy.sh)
6. .env.production oluştur (token'lar EXTERNAL_TOKENS.md'de)
7. Cloudflare DNS ayarla (api CNAME)
8. Resend domain doğrulama

## Önemli Notlar
- Token'lar chat geçmişinde ifşa oldu → deploy sonrası yenilenmeli
- SESSION_NOTES.md'de Render Docker çözümü var (rustls-tls önerisi)
- Bakım: Düzenli aralıklarla MEMORY.md'yi CONTEXT.md ve SESSION_NOTES.md'den güncelle
