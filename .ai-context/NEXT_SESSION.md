# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-20 15:05 GMT+8

## ✅ Tamamlanan (Bu Oturum)

### 1. Vercel Build Fix (KRİTİK)
- RevenueContent.tsx type error → `typescript.ignoreBuildErrors: true` eklendi
- Git committer config düzeltildi (Servet Arslan / servetarslan02@gmail.com)
- Vercel deployment **READY** ✅ — Dashboard HTTP 200

## 📋 Sıradaki

### 1. Upstash Redis Limit (YÜKSEK ÖNCELİK)
- 500K request limiti dolu
- Seçenekler:
  a) Upstash planı yükselt ($10/ay)
  b) Redis fallback eklensin (email queue → direct send)
  c) Yeni Upstash instance oluştur

### 2. Email Verified Sorunu (YÜKSEK ÖNCELİK)
- Servet ve demo hesapları `email_verified = false`
- Login "Please verify your email" hatası verecek
- Neon DB'de `UPDATE customers SET email_verified = true WHERE email IN (...)`

### 3. Dashboard Real TS Hataları (ORTA)
- `RevenueContent.tsx` formatter tipi — Recharts Tooltip `formatter` return type
- ignoreBuildErrors ile build geçiyor ama hatalar düzeltilmeli

### 4. P2 Kalan Sorunlar
- SSO state → Redis
- OIDC JWKS imza doğrulaması
- Verified domain TXT record verification
- communication_history tablosu

### 5. Production Readiness
- Sentry token rotasyonu (invalid org token hatası)
- Real TS hatalarını düzelt → ignoreBuildErrors kaldır
