# 2026-05-20 — Login Fix + Dashboard Build Fixes

## Oturum: 05:24–06:20 GMT+8

### Kullanıcı: Servet Arslan (servetarslan02)

---

## Yapılan İşler

### 1. Login DATABASE_ERROR Fix (KRİTİK)
- **Sorun:** `ColumnNotFound("paused_at")` — `Customer` struct'unda `paused_at`, `paused_until`, `pause_plan` alanları var ama `CUSTOMER_SELECT` sorgusunda yoktu
- **Fix:** 3 dosyaya eksik kolonlar eklendi:
  - `api/src/routes/auth.rs` — CUSTOMER_SELECT
  - `api/src/routes/sso.rs` — 2 hardcoded SELECT
  - `api/src/admin/gdpr.rs` — 1 hardcoded SELECT
- **Deploy:** Cloud Build tetiklendi, migration 078 uygulandı
- **Debug süreci:** Önce Redis limit hatası sanıldı (Upstash 500K limit dolu), sonra debug log eklenerek gerçek hata bulundu

### 2. Upstash Redis Limit
- **Sorun:** `max requests limit exceeded. Limit: 500000, Usage: 500000`
- **Etki:** Background job queue, cache, rate limiter Redis hataları
- **Rate limiter:** Zaten fail-open yapıyor (sorun değil)
- **Job queue:** Email gönderimi bloklanıyor
- **Çözüm:** Şu an yok — Upstash planı yükseltilebilir veya Redis fallback eklenebilir

### 3. Email Future Bug Fix
- **Sorun:** `send_email_with_fallback` async fonksiyonu 4 yerde `.await` edilmiyordu
- **Etki:** Welcome email, password reset, verification, email change code gönderilemiyordu
- **Fix:** 4 çağrıya `.await` eklendi

### 4. SSO Module Path Fix
- **Sorun:** `main.rs`'de `sso::SsoStateStore::new()` → `routes::sso::SsoStateStore::new()` olmalıydı
- **Etki:** Cloud Build API derleme hatası

### 5. Dashboard Build Fixes (20+ dosya)
- `Github` ikonu lucide-react'ten kaldırılmış → custom SVG ile değiştirildi
- `Link` import çakışması (lucide-react vs i18n/navigation) → `Link as LinkIcon`
- `'use client'` directive import'lardan önce olmalı → 2 dosya düzeltildi
- TabbedSection.tsx corrupted import → düzeltildi
- changelog/content.tsx corrupted import → düzeltildi
- JSX escaped quotes (`\"`) → 3 dosya düzeltildi
- `Clock` import eksik → custom-domain eklendi
- TypeScript type errors: `string` → `React.ReactNode` (SubscriptionDetails, logs, InviteMemberModal, TeamDetail)
- Unused imports → 20+ import temizlendi
- `showPasswordConfirm` missing state → eklendi
- signature-verifier corrupted Go code import → düzeltildi

### 6. gcloud CLI Kurulumu
- `/tmp/google-cloud-sdk/` dizinine kuruldu
- Service account ile auth yapıldı
- Cloud Build tetikleme ve log okuma için kullanıldı

---

## Kalan Sorunlar

### Dashboard
- RevenueContent.tsx type error (PLAN_COLORS computed property) — henüz fix edilmedi
- Dashboard build henüz Vercel'e deploy edilmedi (push edildi, Vercel auto-deploy bekleniyor)

### API
- Upstash Redis 500K limit dolu — plan yükseltme veya fallback gerekli
- Debug log'ları temizlendi, CUSTOMER_SELECT fix push edildi
- Cloud Build tetiklendi (son commit: `e06a1c33`)

### Servet Hesabı
- `email_verified = false` — login "Please verify your email" hatası verecek
- Demo hesabı da `email_verified = false`

---

## Dosya Değişiklikleri

### API (4 dosya)
- `api/src/routes/auth.rs` — CUSTOMER_SELECT + .await fixes
- `api/src/routes/sso.rs` — CUSTOMER_SELECT hardcoded queries
- `api/src/routes/admin/gdpr.rs` — CUSTOMER_SELECT hardcoded query
- `api/src/main.rs` — sso module path fix

### Dashboard (20+ dosya)
- 15+ TSX dosyası — unused imports, type errors, corrupted imports
