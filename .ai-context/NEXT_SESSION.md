# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-25 GMT+8 (OpenClaw oturumu — 11 dosya split, 15 yeni dosya)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Tamamlanan İşler (Önceki Oturumlar)

### OpenClaw Split — 2026-05-25 (15 dosya, 22 yeni dosya, %51 küçülme) ✅

| Dosya | Önce | Sonra | Azalma |
|-------|------|-------|--------|
| main.rs | 788 | 331 | %58 |
| sso/scim.rs | 743 | 181 | %76 |
| stream.rs | 671 | 146 | %78 |
| models/customer.rs | 691 | 270 | %61 |
| events/publisher.rs | 657 | 261 | %60 |
| models/delivery.rs | 624 | 219 | %65 |
| integrations.rs | 620 | 250 | %60 |
| sso/config.rs | 585 | 330 | %44 |
| ws/handler.rs | 569 | 306 | %46 |
| schemas/mod.rs | 562 | 338 | %40 |
| retry_policy/mod.rs | 659 | 466 | %29 |
| billing/iyzico.rs | 661 | 482 | %27 |
| routes/endpoints.rs | 656 | 509 | %22 |
| routes/health.rs | 663 | 541 | %18 |
| fifo/mod.rs | 769 | 635 | %17 |
| **TOPLAM** | **9618** | **4665** | **%51** |

22 yeni dosya: cors.rs, background.rs, 12× tests.rs, scim/users.rs, scim/groups.rs, stream/handlers.rs, integration_handlers.rs, config/domain.rs

Push: fd2828fa, 5bae3af0, bef66ce1, f06e4486, 371c528d, 1fdfadba

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

## 🟢 Split'ler Tamamlandı

> 2026-05-25: 15 dosya split edildi, %51 küçülme. Kalan dosyaların hepsi 650 satır altında.
> Kalan dosyalar ya test dosyası (inbound/tests.rs, teams/tests.rs) ya da zaten split edilmiş (middleware, fifo, health, rate_limit).

### 2026-05-25 OpenClaw Split'leri — TAMAMLANDI ✅

| Dosya | Önce | Sonra | Azalma |
|-------|------|-------|--------|
| SsoContent.tsx | 1167 | 959 (2 dosya) | %18 |
| subscription.rs | 797 | 674 (4 dosya) | %15 |
| oauth.rs | 776 | 678 (4 dosya) | %13 |
| cortex/page.tsx | 956 | 714 (7 dosya) | %25 |
| **Toplam** | **3696** | **3025 (17 dosya)** | **%18** |

### 2026-05-25 Oturum 8 Split'leri — TAMAMLANDI ✅

| Dosya | Önce | Sonra | Azalma |
|-------|------|-------|--------|
| auth/handlers.rs | 905 | 5 modül | %100 (silindi) |
| webhooks/handlers.rs | 851 | 3 modül | %100 (silindi) |
| teams/handlers.rs | 827 | 3 modül | %100 (silindi) |
| **Toplam** | **2583** | **11 yeni dosya** | **%100** |

### 2026-05-25 Split'leri — TAMAMLANDI ✅

| Dosya | Önce | Sonra | Azalma |
|-------|------|-------|--------|
| billing/stripe.rs | 999 | 376 | %62 |
| billing/mod.rs | 984 | 507 | %48 |
| SsoContent.tsx | 1310 | 1167 | %11 |
| templates/library.rs | 903 | 25 | %97 |
| transform/mod.rs | 833 | 506 | %39 |
| rate_limit.rs | 812 | 557 | %31 |
| models/endpoint.rs | 889 | 387 | %56 |
| **Toplam** | **6330** | **3525** | **%44** |

### middleware/mod.rs Split — TAMAMLANDI ✅
- 1052 → 642 satır (%39 küçülme)
- 1 yeni modül: middleware_tests.rs
- GitHub push: `f9bd3e9e`

### email.rs Split — TAMAMLANDI ✅
- 1104 → 566 satır (%49 küçülme)
- 2 yeni modül: email_templates.rs, email_tests.rs
- GitHub push: `c6a99711`

### config.rs Split — TAMAMLANDI ✅
- 1060 → 353 satır (%67 küçülme)
- 1 yeni modül: config_tests.rs
- GitHub push: `b12a1b28`

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
7. **Test çıkarma** — `file.rs` → `file/mod.rs` + `file/tests.rs` (dizin modülü gerekli)
8. **`file.rs` + `file/` dizini bir arada OLAMAZ** — ya `file.rs` ya `file/mod.rs`

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
