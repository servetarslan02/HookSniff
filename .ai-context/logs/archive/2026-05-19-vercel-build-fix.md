# 2026-05-19 — Vercel Build Fix

## Sorun
- Son 3 deploy `missing_auth` hatası ile başarısız
- Gerçek hata: TypeScript — `StorySlug` tipi tanımlanmış ama kullanılmamış
- `customers/[slug]/page.tsx:13:6`

## Çözüm
- `StorySlug` type alias kaldırıldı
- Commit: `fdae726f` — push edildi

## Sentry Uyarısı
- `SENTRY_AUTH_TOKEN` geçersiz (401 — Invalid org token)
- Servet: "Aylık limit doldu, gelecek ay aktif olacak"
- Env variable'ları Vercel'de KALDIRMA — Sentry kullanılıyor

## Deploy Durumu
- Build hatası düzeltildi, yeni deploy tetiklenir
