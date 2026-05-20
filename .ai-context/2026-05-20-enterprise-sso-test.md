# 2026-05-20 — Enterprise SSO Test + Bugfix

## Oturum: 20:18–20:31 GMT+8

### Kullanıcı: Servet Arslan + OpenClaw AI

---

## Yapılan İşler

### 1. Enterprise Müşteri Simülasyonu (MegaCorp Engineering)
- Demo hesabı → Enterprise plan + admin yapıldı
- 10 kişilik ekip oluşturuldu (MegaCorp Engineering)
  - 2 admin (Ali Yılmaz, Demo User)
  - 8 member (Ayse, Mehmet, Fatma, Hasan, Zeynep, Murat, Elif, Ömer)
  - 1 viewer (Büşra Korkmaz)
- Team_members tablosu: customer_id kullanılıyor (user_id değil)

### 2. SSO OIDC Kurulumu
- Provider: OIDC (Google)
- Issuer: https://accounts.google.com
- Client ID: megacorp-hooksniff-client-id
- Verified domain: megacorp.com
- Admin bypass: enabled
- Default role: viewer

### 3. SSO Test Sonuçları
| Test | Sonuç |
|------|-------|
| SSO config CRUD | ✅ |
| SSO test (OIDC validation) | ✅ Google endpoints doğrulandı |
| SSO login → Google OAuth redirect | ✅ 307 redirect |
| Admin login (SSO + admin_bypass) | ✅ Enterprise plan |
| SSO providers (domain lookup) | ⚠️ Deploy bekliyor |
| Audit log | ✅ Login olayları kayıtlı |

### 4. Düzeltmeler
1. **SSO providers public** — `/v1/sso/providers` auth kaldırıldı (dashboard login için)
2. **SSO providers domain lookup** — `verified_domain` ile de eşleştirme
3. **Inbound webhook auth** — provider endpoint'lerinden auth kaldırıldı
4. **reserve_webhook_slot** — `RETURNING *` → `RETURNING id, webhook_count`

### 5. Değişen Dosyalar
- `api/src/routes/sso.rs` — providers public + verified_domain query
- `api/src/routes/inbound.rs` — public_router() split
- `api/src/routes/mod.rs` — inbound route registration
- `api/src/routes/webhooks.rs` — reserve_webhook_slot optimization

### 6. Commit'ler
- `d3682fda` — inbound webhook auth bypass
- `0722f175` — sso providers public
- `43c08533` — sso providers verified_domain
- `157f7093` — sso providers domain lookup fix

## Deploy Gereken
- Cloud Build tetiklenmeli (API deploy)
- SSO providers endpoint'inin çalışması için deploy şart

## Kullanıcı Hesapları (DB)
| Email | Plan | Admin | Team |
|-------|------|-------|------|
| demo@hooksniff.com | enterprise | ✅ | MegaCorp (admin) |
| ali.yilmaz@megacorp.com | enterprise | ❌ | MegaCorp (admin) |
| ayse.kaya@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| mehmet.demir@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| fatma.celik@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| hasan.ozturk@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| zeynep.aksoy@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| murat.arslan@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| elif.dogan@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| omer.sahin@megacorp.com | enterprise | ❌ | MegaCorp (member) |
| busra.korkmaz@megacorp.com | enterprise | ❌ | MegaCorp (viewer) |
