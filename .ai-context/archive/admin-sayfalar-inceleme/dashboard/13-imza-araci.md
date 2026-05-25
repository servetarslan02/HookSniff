# 🔐 İmza Aracı (Signature Verifier)

> Sayfa: `dashboard/src/app/[locale]/dashboard/signature-verifier/page.tsx`
> Route: `/dashboard/signature-verifier`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- Web Crypto API ile HMAC imza hesaplama
- SHA-256 ve SHA-512 desteği
- Constant-time comparison (timing attack koruması)

## Özellikler
- ✅ **İmza Hesaplama** — Payload + secret → HMAC imzası
- ✅ **İmza Doğrulama** — Payload + secret + signature → valid/invalid
- ✅ **Algoritma Seçimi** — SHA-256 / SHA-512
- ✅ **Constant-time comparison** — Timing attack koruması (Item 168)
- ✅ **Toast bildirimleri** — Başarı/hata mesajları

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- Web Crypto API kullanımı (güvenli)
- Constant-time comparison
- Timing attack koruması
- i18n tam destek

### 🔴 Eksiklikler
- Geçmiş imza doğrulamaları yok
- İmza formatı seçimi (hex/base64) yok
- Örnek payload/template yok
