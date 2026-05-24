# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-25 GMT+8 (sso.rs → sso/ directory split, adım 1 tamamlandı)

## 🚀 Hızlı Başlangıç

1. `git pull` — en son kodu çek
2. `MEMORY.md` oku — proje hafızası (Rust bölüm kuralları burada!)
3. Bu dosyayı oku — yapılacaklar
4. İşe başla
5. Oturum sonunda: push + bu dosyayı güncelle

---

## ✅ Son Oturumda Yapılan İşler

### Dashboard Hook Split (tamamlandı ✅)
- `useDashboardData.ts`: 1106 → 172 satır (%84 küçülme)
- `useAdminData.ts`: 851 → 92 satır (%89 küçülme)
- Toplam 17 split dosya çıkarıldı
- `validated.ts` paylaşılan helper

### Rust sso.rs Split — Adım 1 (tamamlandı ✅)
- `sso.rs` (3943 satır) → `sso/mod.rs` (665) + `sso/handlers.rs` (3293)
- `cargo check` — 0 hata
- Commit: `14ea5d64`

---

## 🟡 Sıradaki — sso/handlers.rs Bölmeye Devam (3293 satır)

**ÖNEMLİ: Rust bölme kuralları için MEMORY.md'yi oku!**

### Adım 2: SCIM endpoint'leri çıkar → `sso/scim.rs`
- Satır 2596+ (SCIM 2.0 Endpoints section)
- `validate_scim_token`, `scim_user_response`, `scim_list_users`, `scim_get_user`, `scim_create_user`, `scim_update_user`, `scim_patch_user`, `scim_delete_user`, `scim_list_groups`, `scim_service_provider_config`, `scim_resource_types`, `scim_schemas`
- Yaklaşık ~700 satır
- `cargo check` → commit

### Adım 3: SAML helpers çıkar → `sso/saml.rs`
- `parse_saml_response`, XML extraction helpers, SAML signature verification
- Yaklaşık ~450 satır
- `cargo check` → commit

### Adım 4: OIDC helpers çıkar → `sso/oidc.rs`
- `decode_oidc_id_token`, `verify_jwt_signature`
- Yaklaşık ~130 satır
- `cargo check` → commit

### Adım 5: Customer helpers çıkar → `sso/helpers.rs`
- `find_or_create_sso_customer`, `auto_join_team_direct`, `resolve_role_from_mapping`, `resolve_team_from_mapping`, `store_sso_user_attributes`, `sync_team_memberships`, `generate_sso_response`, `log_sso_attempt`
- Yaklaşık ~400 satır
- `cargo check` → commit

### Adım 6: Config handler'ları çıkar → `sso/config.rs`
- `get_sso_config`, `upsert_sso_config`, `delete_sso_config`, `test_sso_connection`, `get_login_attempts`, `initiate_domain_verification`, `check_domain_verification`
- Yaklaşık ~750 satır
- `cargo check` → commit

### Adım 7: Login handler'ları çıkar → `sso/login.rs`
- `initiate_sso_login`, `saml_callback`, `oidc_callback`, `list_sso_providers`
- Yaklaşık ~850 satır
- `cargo check` → commit

### Her adımda şunları yap:
1. Fonksiyonları `pub async fn` yap
2. Type'ları `pub struct` yap
3. `use super::{GerekliType1, GerekliType2};` ekle (use super::* DEĞİL!)
4. External crate'leri dosyada ayrı import et
5. Cross-module çağrıları `helpers::function_name()` şeklinde prefix'le
6. `cargo check` → 0 hata → commit → sonraki adım

---

## 🔴 Servet'in Yapması Gereken (Kod Dışı)

1. **Google OAuth Client ID** — Google Cloud Console'dan al
2. **GitHub OAuth App** — GitHub Developer Settings'ten al
3. **Secret Manager güncelle** — OAuth credential'ları ekle
4. **Migration 087-100 uygula** — Neon DB'de çalıştır
5. **iyzico hesap aç** — ödeme entegrasyonu için
