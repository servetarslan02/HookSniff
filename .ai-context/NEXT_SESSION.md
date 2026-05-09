# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 06:15 GMT+8

---

## 🔴 ACİL — Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| GitHub PAT rotate | 🔴 ACİL | Eski token chat'te paylaşıldı — YENİ TOKEN OLUŞTUR |
| npm token rotate | 🔴 ACİL | Eski token paylaşıldı |
| GCP SA key rotate | 🔴 ACİL | Eski key paylaşıldı |
| Vercel token rotate | 🔴 ACİL | Eski token paylaşıldı |
| Login test | 🔴 | Deploy sonrası dashboard'da dene |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## ✅ SON OTURUM (66) — Backend Endpoints

### Tamamlanan (2026-05-10 06:02 - 06:15 GMT+8)

**7 backend endpoint eklendi:**
1. ✅ OAuth (Google + GitHub) — `/v1/oauth/*`
2. ✅ Audit Log — `/v1/audit-log/*`
3. ✅ SSO/SAML/OIDC — `/v1/sso/*`
4. ✅ Custom Domains — `/v1/custom-domains/*`
5. ✅ Portal Config — `/v1/portal/config`
6. ✅ Per-Endpoint Rate Limits — `/v1/rate-limits/*`
7. ✅ Retry Policy — zaten vardı

**Migration:** `038_backend_endpoints.sql` (5 yeni tablo)
**GitHub:** `fea537b` — 9 dosya, +2030 satır

---

## 🟡 YENİ OTURUMDA YAPILACAK

| # | Görev | Öncelik | Not |
|---|-------|---------|-----|
| 1 | Dashboard → API entegrasyonu | 🔴 | localStorage fallback'ları gerçek API'ye bağla |
| 2 | OAuth frontend entegrasyonu | 🔴 | Login sayfası OAuth butonlarını aktif et |
| 3 | Build & deploy | 🔴 | `cargo check` → fix → deploy |
| 4 | Test dosyaları temizliği | 🟢 | Unused import'lar |
| 5 | k6 load test çalıştırma | 🟢 | scripts/run-tests.sh ile |

### Dashboard → API Bağlantı Haritası

| Dashboard Sayfası | Endpoint | Durum |
|-------------------|----------|-------|
| `/dashboard/audit-log` | `GET /v1/audit-log` | 🔴 Bağlanacak |
| `/dashboard/sso` | `GET/POST /v1/sso/config` | 🔴 Bağlanacak |
| `/dashboard/custom-domain` | `GET/POST /v1/custom-domains` | 🔴 Bağlanacak |
| `/dashboard/portal-customize` | `GET/POST /v1/portal/config` | 🔴 Bağlanacak |
| `/dashboard/rate-limiting` | `GET/POST /v1/rate-limits` | 🔴 Bağlanacak |
| `/dashboard/retry-policy` | Mevcut endpoint | 🔴 Bağlanacak |
| Login OAuth butonları | `GET /v1/oauth/providers` | 🔴 Bağlanacak |

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/`
- **Rust kurulu değil** — bu makinede `cargo check` çalıştırılamıyor
- **Token güvenliği** — Servet token paylaştı, rotate edilmeli
