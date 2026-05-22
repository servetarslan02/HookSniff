# 2026-05-23 — Kapsamlı RBAC + SSO + SCIM İnceleme

> Servet'in isteği üzerine tüm sistemler detaylı incelendi.

---

## 🔴 KRİTİK SORUNLAR (Düzeltilmeli)

### 1. useTeamRole: Üye olmayanlara 'viewer' rolü veriliyor ❌
**Dosya:** `dashboard/src/hooks/useTeamRole.ts:52`
**Sorun:** Kullanıcı takımın üyesi değilse, `member?.role ?? 'viewer'` ifadesi 'viewer' döndürüyor. Bu yanlış — üye olmayan kişi `null` döndürmeli.
**Etki:** Takımın üyesi olmayan kişiler viewer yetkileriyle (canManageSettings: true) erişebilir.
**Düzeltme:**
```typescript
// ESKİ (hatalı):
const role = (member?.role ?? 'viewer') as TeamRole;

// YENİ (doğru):
const role = (member?.role ?? null) as TeamRole | null;
```

### 2. SAML callback: Sertifika takım bazlı sorgulanmıyor ❌
**Dosya:** `api/src/routes/sso.rs` (saml_callback, ~satır 1500)
**Sorun:** SAML callback'te sertifika `customer_id` ile sorgulanıyor, ama SSO artık takım bazlı. `team_id` ile sorgulanmalı.
**Etki:** Takım bazlı SSO'da sertifika doğrulama başarısız olabilir.
**Düzeltme:** `login_state.sso_config_id` ile sorgula.

### 3. OIDC callback: Config takım bazlı sorgulanmıyor ❌
**Dosya:** `api/src/routes/sso.rs` (oidc_callback, ~satır 1650)
**Sorun:** OIDC callback'te config sadece `customer_id` ile sorgulanıyor. Takım bazlı SSO'da yanlış config gelebilir.
**Düzeltme:** `login_state.sso_config_id` ile sorgula.

### 4. get_sso_config: role_mapping ve team_mapping SQL'de seçilmemiş ❌
**Dosya:** `api/src/routes/sso.rs` (get_sso_config)
**Sorun:** Response'da `role_mapping` ve `team_mapping` var ama SQL sorgusunda SELECT edilmemiş. Hep `null` döner.
**Düzeltme:** SQL'e `s.role_mapping, s.team_mapping, s.scim_enabled` ekle.

---

## 🟡 ORTA SEVİYE SORUNLAR

### 5. Rate Limiting: Placeholder (gerçek implementasyon yok)
**Dosya:** `api/src/routes/teams.rs` (check_role_rate_limit)
**Sorun:** `TODO: Implement actual rate limiting with Redis` — sadece debug log yazıyor.
**Etki:** Rol bazlı rate limiting çalışmıyor.

### 6. SSO State: In-memory (production'da sorun)
**Dosya:** `api/src/routes/sso.rs` (SsoStateStore)
**Sorun:** `Arc<Mutex<HashMap>>` — server restart'ta kaybolur, multiple instance'da çalışmaz.
**Not:** Redis desteği kodda var ama `redis` parametresi None olarak başlatılıyor.

### 7. SCIM create_user: Takıma otomatik eklenme yok
**Dosya:** `api/src/routes/sso.rs` (scim_create_user)
**Sorun:** SCIM ile oluşturulan kullanıcı SSO config'in takımına eklenmiyor.
**Düzeltme:** `auto_join_team_direct` çağrısı ekle.

### 8. SCIM list_groups: Sadece config'in takımı dönüyor
**Dosya:** `api/src/routes/sso.rs` (scim_list_groups)
**Sorun:** Sadece `sso_configs.team_id` ile eşleşen takım dönüyor. Tüm organizasyonun takımları gösterilmeli.

### 9. compute_permissions: developer'ın webhook hakkı yok
**Dosya:** `api/src/routes/teams.rs` (compute_permissions)
**Sorun:** developer rolü `can_manage_webhooks: false`. Ama developer'ın webhook oluşturması beklenir.
**Not:** Bu kasıtlı mı yoksa hata mı? Frontend'de `canManageWebhooks` admin+ olarak tanımlı.

---

## ✅ DOĞRU YAPILANLAR

### RBAC Frontend
- ✅ useTeamRole: owner kontrolü doğru (teamDetail.owner_id)
- ✅ usePermissions: Rol hiyerarşisi doğru (owner > admin > developer > analyst > viewer)
- ✅ RoleGuard: require prop'u ile yetki kontrolü
- ✅ Sidebar: Rol bazlı filtreleme çalışıyor
- ✅ Endpoints: create/delete butonları admin+ rollerde
- ✅ Billing: OverageSettings ve SubscriptionDetails RoleGuard ile korumalı

### RBAC Backend
- ✅ role_level: Hiyerarşi doğru (admin=40, developer=30, analyst=20, viewer=10)
- ✅ require_role: Owner her zaman geçer (owner_id kontrolü)
- ✅ check_user_team_role_for_team: Takım bazlı güvenli kontrol
- ✅ Permission cache: 5 dakika TTL, ON CONFLICT upsert
- ✅ RBAC audit log: rol değişiklikleri loglanıyor
- ✅ 25 unit test: Tüm roller, hiyerarşi, permission matrix

### SSO
- ✅ SAML AuthnRequest: Doğru XML formatı
- ✅ SAML signature verification: RSA-SHA256, ring crate
- ✅ OIDC discovery: .well-known/openid-configuration fetch
- ✅ OIDC JWKS verification: jsonwebtoken crate
- ✅ OIDC nonce: Replay attack koruması
- ✅ Role mapping: IdP groups → HookSniff rolleri
- ✅ Team mapping: email domain → takım
- ✅ Auto-join: SSO kullanıcıları otomatik takıma ekleniyor
- ✅ Domain verification: DNS TXT record doğrulama
- ✅ Rate limiting: 10 login/dakika/email+IP

### SCIM
- ✅ SCIM 2.0 User CRUD: GET/POST/PUT/PATCH/DELETE
- ✅ SCIM Groups: Team-based grup listesi
- ✅ ServiceProviderConfig: RFC uyumlu
- ✅ ResourceTypes: User + Group
- ✅ Schemas: Full attribute tanımı
- ✅ Bearer token auth: Hash karşılaştırma
- ✅ Soft delete: Deactivate (hard delete yok)

### Migrations
- ✅ 087_sso_enhancements.sql: role_mapping, team_mapping, scim_enabled, sso_user_attributes
- ✅ 088_rbac_enhancements.sql: permission_cache, role_rate_limits, rbac_audit_log
- ✅ Index'ler doğru
- ✅ Foreign key'ler doğru

---

## 📊 ÖZET

| Kategori | Toplam | Sorun | Doğru |
|----------|--------|-------|-------|
| RBAC Frontend | 6 | 1 (useTeamRole fallback) | 5 |
| RBAC Backend | 8 | 2 (rate limiting placeholder, developer perms) | 6 |
| SSO Login | 10 | 2 (SAML cert scope, OIDC config scope) | 8 |
| SSO Config | 4 | 1 (role_mapping/team_mapping SQL) | 3 |
| SCIM | 5 | 2 (create_user team, list_groups scope) | 3 |
| Migrations | 2 | 0 | 2 |
| **TOPLAM** | **35** | **8** | **27** |

---

## 🛠️ DÜZELTME PLANI

### Öncelik 1 (Kritik — Güvenlik)
1. useTeamRole fallback: 'viewer' → null
2. SAML callback sertifika scope: customer_id → sso_config_id
3. OIDC callback config scope: customer_id → sso_config_id
4. get_sso_config SQL: role_mapping, team_mapping ekle

### Öncelik 2 (Orta — Fonksiyonel)
5. SCIM create_user: Takıma otomatik ekle
6. SCIM list_groups: Tüm organizasyon takımlarını göster

### Öncelik 3 (Düşük — İyileştirme)
7. Rate limiting: Redis implementasyonu
8. SSO state: Redis'e taşı
