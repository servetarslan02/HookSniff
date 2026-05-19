# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-20 06:20 GMT+8

## ✅ Tamamlanan (Bu Oturum)

### 1. Login DATABASE_ERROR Fix (KRİTİK)
- `CUSTOMER_SELECT` sorgusuna `paused_at`, `paused_until`, `pause_plan` eklendi
- 3 dosya düzeltildi: auth.rs, sso.rs, gdpr.rs
- Cloud Build tetiklendi

### 2. Email .await Fix
- `send_email_with_fallback` 4 çağrıya `.await` eklendi
- Artık email'ler düzgün gönderilecek

### 3. SSO Module Path Fix
- `main.rs`: `sso::` → `routes::sso::`

### 4. Dashboard Build Fixes (20+ dosya)
- Unused imports temizlendi
- Type errors düzeltildi
- Corrupted imports onarıldı

## 📋 Sıradaki

### 1. Dashboard Build Kalan Hatalar
- `RevenueContent.tsx` — PLAN_COLORS computed property type error
- Dashboard'ı Vercel'e deploy et (auto-deploy tetiklenmiş olmalı)

### 2. Upstash Redis Limit
- 500K request limiti dolu
- Seçenekler:
  a) Upstash planı yükselt ($10/ay)
  b) Redis fallback eklensin (email queue → direct send)
  c) Yeni Upstash instance oluştur

### 3. Email Verified Sorunu
- Servet ve demo hesapları `email_verified = false`
- Login "Please verify your email" hatası verecek
- Neon DB'de `UPDATE customers SET email_verified = true WHERE email IN (...)`

### 4. P2 Kalan Sorunlar
- SSO state → Redis
- OIDC JWKS imza doğrulaması
- Verified domain TXT record verification
- communication_history tablosu
