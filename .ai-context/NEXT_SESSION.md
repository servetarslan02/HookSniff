# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-25 GMT+8 (OpenClaw oturumu — genel durum kontrolü)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Tamamlanan İşler (Önceki Oturumlar)

### Dashboard Hook Split (tamamlandı ✅)
- `useDashboardData.ts`: 1106 → 172 satır (%84 küçülme)
- `useAdminData.ts`: 851 → 92 satır (%89 küçülme)
- 17 split dosya + `validated.ts` paylaşılan helper

### Rust Modül Split'leri (tamamlandı ✅)
- **sso.rs** → sso/ dizin (mod.rs + config + login + scim + saml + saml_handler + oidc + oidc_handler + helpers + tests)
- **teams.rs** → teams/ dizin (mod.rs + handlers + rbac)
- **webhooks.rs** → webhooks/ dizin (mod.rs + handlers)
- **auth.rs** → auth/ dizin (mod.rs + handlers)
- **inbound.rs** → inbound/ dizin (mod.rs + handlers + signature)
- **billing/** → polar/ dizin (subscription + webhooks + grace + portal + refund_requests + tests)
- **admin/** → 20+ dosya (gdpr, users, security, stats, revenue, settings, customers, broadcasts, monitoring, refunds, coupons, feature_flags, alerts, export, audit, delivery)

---

## 🟡 Kalan Büyük Dosyalar (Split Gereken)

| Dosya | Satır | Öncelik |
|-------|-------|---------|
| `email.rs` | 1104 | Orta |
| `config.rs` | 1060 | Orta |
| `middleware/mod.rs` | 1052 | Orta |
| `billing/stripe.rs` | 999 | Düşük |
| `billing/mod.rs` | 984 | Düşük |
| `sso/SsoContent.tsx` | 1310 | Düşük (Dashboard) |

### worker/main.rs Split — TAMAMLANDI ✅
- 1883 → 953 satır (%49 küçülme)
- 7 yeni modül: types, helpers, health, queue, notifications, grace, retention
- GitHub push: `f7dd3034`

### webhooks/handlers.rs Split — TAMAMLANDI ✅
- 1177 → 851 satır (%28 küçülme)
- 2 yeni modül: helpers.rs, tests.rs
- GitHub push: `9a3d7a9b`

### auth/handlers.rs Split — TAMAMLANDI ✅
- 1033 → 905 satır (%12 küçülme)
- 2 yeni modül: helpers.rs, tests.rs
- GitHub push: `07c77aa9`

### inbound/handlers.rs Split — TAMAMLANDI ✅
- 870 → 295 satır (%66 küçülme)
- 1 yeni modül: tests.rs
- GitHub push: `631b6888`

### teams/handlers.rs Bölme Planı
- Team CRUD handler'ları → `teams/crud.rs`
- Team member management → `teams/members.rs`
- Team invitation handler'ları → `teams/invitations.rs`
- mod.rs: router + type'lar + test'ler

### webhooks/handlers.rs Bölme Planı
- Webhook CRUD → `webhooks/crud.rs`
- Webhook delivery/retry → `webhooks/delivery.rs`
- Webhook test/payload → `webhooks/test.rs`
- mod.rs: router + type'lar

### auth/handlers.rs Bölme Planı
- Login/register → `auth/credentials.rs`
- Password reset → `auth/password.rs`
- Session management → `auth/session.rs`
- mod.rs: router + type'lar

### inbound/handlers.rs Bölme Planı
- Inbound CRUD → `inbound/crud.rs`
- Inbound processing → `inbound/processing.rs`
- mod.rs: router + type'lar + signature

---

## ⚠️ Rust Bölme Kuralları (MEMORY.md'den)

1. **Önce çalışır hali commit et** — split sonrası 0 hata olmadan devam etme
2. **mod.rs type'ları tutar** — tüm struct/enum/const mod.rs'de, `pub` olarak
3. **`use super::*` ÇALIŞMIYOR** — `use super::{Type1, Type2};` kullan
4. **External crate'ler** her dosyada ayrı import edilmeli
5. **Cross-module fonksiyon** çağrısı prefix gerekli (`helpers::fn_name`)
6. **Adım adım böl**, her adımda `cargo check`

---

## 🔴 Servet'in Yapması Gereken (Kod Dışı)

1. **Google OAuth Client ID** — Google Cloud Console'dan al
2. **GitHub OAuth App** — GitHub Developer Settings'ten al
3. **Secret Manager güncelle** — OAuth credential'ları ekle
4. **Migration 087-100 uygula** — Neon DB'de çalıştır
5. **iyzico hesap aç** — ödeme entegrasyonu için

---

## 📝 Notlar

- Rust/Cargo bu ortamda kurulu değil → `cargo check` yapılamıyor
- Split işlemleri kod analizi ile yapılıyor, compile doğrulama Servet'in ortamında yapılmalı
- Her split sonrası commit atılmalı
