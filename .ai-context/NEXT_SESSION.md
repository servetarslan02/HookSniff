# NEXT_SESSION.md — Sonraki Oturum Rehberi

> **Son güncelleme:** 2026-05-12 05:15 GMT+8
> **Son commit:** `e734a921` (main)
> **Son oturum:** AŞAMA 4 api.ts + catch blocks + raw fetch dönüşümleri

## Hemen Başla

1. `git pull origin main` — en son değişiklikleri al
2. `MEMORY.md` oku — proje durumunu öğren
3. `IMPLEMENTATION-PLAN.md` bak — yol haritası

## ✅ Bu Oturum Tamamlananlar (Oturum 121)

| Madde | Açıklama | Durum |
|-------|----------|-------|
| 137 | Retry logic for transient errors (502, 503, 504) — exponential backoff | ✅ |
| 138 | 401 refresh loop risk — shared refresh promise (api.ts) | ✅ |
| 131 | Silent catch blocks → error state/toast (dashboard, alerts, analytics, rate-limiting, health) | ✅ |
| 155 | Raw fetch → apiFetch (playground live polling, webhook-builder, endpoints/[id] test webhook) | ✅ |
| 142 | Health page hardcoded 'Healthy/Degraded/Unhealthy' → i18n keys | ✅ (kısmi) |
| — | Alerts i18n: fetchFailed/createFailed/deleteFailed/testFailed keys eklendi (en/tr) | ✅ |

## 📋 Sonraki Adımlar — IMPLEMENTATION-PLAN.md göre

### AŞAMA 4 Kalan (öncelikli)
| # | Görev | Öncelik |
|---|-------|---------|
| 142 | Hardcoded strings — kalan sayfalar (portal-customize, sso provider desc'leri) | 🟡 |
| 146 | getErrorMessage raw English → i18n | 🟡 |
| 159 | weeklyDigest state → API'ye gönder | 🟡 |
| 140 | No role-based permission checks → team/page.tsx | 🟡 |
| 141 | Team member removal no confirmation → team/page.tsx | 🟡 |
| 131 | Kalan kasıtlı fallback catch'ler (audit-log, portal-customize, sso, retry-policy) — düşük öncelik | 🟢 |
| 153 | Loading states standardize et (SkeletonCard/LoadingSpinner) | 🟢 |
| 157 | billingApi duplicate getInvoices düzelt | 🟢 |

### AŞAMA 5 — Database (22 madde)
- Schema fixler, FK fixler, index eksikler, cleanup

### AŞAMA 2 Kalan (12 madde)
- Async Rust, crypto, rate limiting, worker, infrastructure

## Kritik Hatırlatmalar
- **Oturum süresi:** 1 saat — işleri batch'le, sık commit yap
- **Push etmeyi unutma!** Her oturum sonunda `git push origin main`
- **Rust compile + test zorunlu** — gözle bakarak yetmez
- **Conventional commits** — "fix:", "feat:", "docs:" kullan
- **Build doğrulama:** Her frontend değişikliği sonrası `next build`
