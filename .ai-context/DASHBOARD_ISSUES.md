# 🐛 HOOKSNIFF DASHBOARD — SORUN LİSTESİ

> **Tarih:** 2026-05-09 05:01 GMT+8
> **Durum:** Aktif — düzeltilmedi
> **Kaynak:** Local build + sayfa taraması

---

## 🔴 KRİTİK — Build Error

| # | Sorun | Dosya | Dil | Durum |
|---|-------|-------|-----|-------|
| 1 | `MISSING_MESSAGE: landing.footer.about` | landing footer | ja, ko | ❌ |
| 2 | `MISSING_MESSAGE: landing.footer.faq` | landing footer | ja, ko | ❌ |
| 3 | `MISSING_MESSAGE: landing.footer.contact` | landing footer | ja, ko | ❌ |

---

## 🟡 İ18N — Eksik Çeviriler (153 satır)

### Settings sayfası — 25 key eksik (6 dil: de, ja, pt-BR, es, fr, ko)

```
settings.apiDesc
settings.changePasswordDesc
settings.confirmNewPassword
settings.currentPassword
settings.deleteAccountWarning
settings.displayName
settings.emailAddress
settings.emailNotifications
settings.emailNotificationsDesc
settings.emailPlaceholder
settings.failureAlerts
settings.failureAlertsDesc
settings.keepSecret
settings.manageApiKeys
settings.namePlaceholder
settings.newPassword
settings.notificationsDesc
settings.passwordMinLength
settings.permanentlyDelete
settings.profileDesc
settings.signOut
settings.signOutDesc
settings.typeDeleteToConfirm
settings.weeklyDigest
settings.weeklyDigestDesc
```

### Landing footer — 3 key eksik (ja, ko)

```
landing.footer.about
landing.footer.faq
landing.footer.contact
```

---

## 🟡 HARDCODED STRINGS (Çevrilmemiş)

| # | Sayfa | Satır | Hardcoded Metin | Ne Olmalı |
|---|-------|-------|-----------------|-----------|
| 4 | Sidebar (layout.tsx) | 35 | `'Transforms'` | `t('transforms')` |
| 5 | Sidebar (layout.tsx) | 36 | `'Inbound'` | `t('inbound')` |
| 6 | Billing (billing/page.tsx) | 12 | `'Free'` | `t('plans.free')` |
| 7 | Billing (billing/page.tsx) | 20 | `'Pro'` | `t('plans.pro')` |
| 8 | Billing (billing/page.tsx) | 28 | `'Business'` | `t('plans.business')` |
| 9 | Billing (billing/page.tsx) | 16,24,32 | Feature listeleri | `t('plans.freeFeatures')` vb. |
| 10 | Inbound (inbound/page.tsx) | 21 | `'Generic'` | `t('generic')` |
| 11 | Inbound (inbound/page.tsx) | 175 | `'Active'` / `'Disabled'` | `t('active')` / `t('disabled')` |
| 12 | Inbound (inbound/page.tsx) | 62 | `'Inbound config created!'` | `t('configCreated')` |
| 13 | Inbound (inbound/page.tsx) | 68 | `'Failed to create config'` | `t('configFailed')` |

---

## 🟡 REACT HOOK WARNINGS

| # | Warning | Dosya | Satır |
|---|---------|-------|-------|
| 14 | `useCallback` missing dependency: `'tc'` | search/page.tsx | 46 |
| 15 | `useEffect` missing dependency: `'search'` | search/page.tsx | 62 |

---

## 🟢 EKSİK DASHBOARD SAYFALARI

| # | Backend Modül | Eksik Sayfa | Öncelik |
|---|---------------|-------------|---------|
| 16 | `routing.rs` | dashboard/routing/ | Orta |
| 17 | `schemas.rs` | dashboard/schemas/ | Orta |
| 18 | `templates.rs` | dashboard/templates/ | Orta |
| 19 | `customer_portal.rs` | dashboard/portal/ | Yüksek |

---

## ⏳ DEVAM EDEN İNCELEME — TAMAMLANDI

### 🔴 BROKEN LINKS (Landing Page → 500 Error)

| # | Link | Hata | Kaynak |
|---|------|------|--------|
| 20 | `/en/status` | 500 → `Cannot find module './vendor-chunks/@formatjs.js'` | Stale .next cache |
| 21 | `/en/about` | 500 → Aynı hata | Stale .next cache |
| 22 | `/en/faq` | 500 → Aynı hata | Stale .next cache |
| 23 | `/en/contact` | 500 → Aynı hata | Stale .next cache |
| 24 | `/en/privacy` | 500 → Aynı hata | Stale .next cache |
| 25 | `/en/terms` | 500 → Aynı hata | Stale .next cache |
| 26 | `/en/login` | 500 → Aynı hata | Stale .next cache |

**Not:** `rm -rf .next` sonrası tümü 200 döndü. Ama production'da bu sorun yaşanabilir.

### 🔴 MISSING NAVIGATION KEY

| # | Sorun | Dosya | Satır |
|---|-------|-------|-------|
| 27 | `tc('nav.dashboard')` → `common.nav.dashboard` bulunamıyor | docs/layout.tsx | 35 |

**Açıklama:** `tc = useTranslations('common')` ama `nav.dashboard` key'i `common` namespace'inde yok. `nav` keyleri üst seviyede.

**Çözüm:** Ya `common.nav.dashboard` key'i ekle ya da `tc('dashboard')` kullan (nav namespace'inde var).

### 🟡 EKSİK SAYFA

| # | Sayfa | Durum | Not |
|---|-------|-------|-----|
| 28 | `/en/register` | 404 | Login sayfasında register mode var ama ayrı URL yok |

### 🟡 HARDCODED STRINGS (Yeni Bulunan)

| # | Sayfa | Satır | Metin |
|---|-------|-------|-------|
| 29 | docs/layout.tsx | 34 | `'Docs'` hardcoded |
| 30 | about/page.tsx | 12 | `'About'` hardcoded |
| 31 | status/page.tsx | - | Status page hardcoded strings |

### ✅ DÜZELTİLMİŞ (rm -rf .next sonrası)

- ~~500 errors on status/about/faq/contact/privacy/terms/login~~ → 200 (cache temizlendi)

---

> **Not:** Bu dosya her inceleme sonrası güncellenir.
