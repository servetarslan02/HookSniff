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
- Hosting planı: Oracle Cloud Always Free + Vercel ($0/ay)

## Hafıza Sistemi
- GitHub'da MEMORY.md, CONTEXT.md, TODO.md, SESSION_NOTES.md dosyaları tutuluyor
- Cron job her 30 dk'da bir otomatik push yapıyor
- Her oturum başında GitHub'dan pull yapılmalı
- Yerel dosyalar 1 saat sonra siliniyor → GitHub kalıcı

## Son Durum (2026-05-08)
- Önceki agent "Mamo" ile 2026-05-06'da kapsamlı çalışma yapılmış
- Kod incelemesi, rakip analizi, ödeme sistemi entegrasyonu tamamlanmış
- Vercel deploy başarılı (dashboard)
- Render Docker build başarısız (OpenSSL hatası) — çözülmedi
- Polar.sh hesap açıldı, planlar oluşturuldu
- iyzico hesabı açılacak
- Production deploy henüz yapılmadı

## Önemli Notlar
- Token'lar chat geçmişinde ifşa oldu → deploy sonrası yenilenmeli
- SESSION_NOTES.md'de Render Docker çözümü var (rustls-tls önerisi)
- Bakım: Düzenli aralıklarla MEMORY.md'yi CONTEXT.md ve SESSION_NOTES.md'den güncelle
