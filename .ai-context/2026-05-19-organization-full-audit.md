# 2026-05-19 — Organization Sistemi Kapsamlı Denetim + 10 Düzeltme

## Yapılan İşler

### 🔍 Kapsamlı Denetim
Organization sistemi (Team + SSO + Audit Log) uçtan uca incelendi. 17 sorun tespit edildi (5 kritik, 8 orta, 4 düşük).

### P0 — Kritik Düzeltmeler
1. **API Key Loglanıyordu** — `tracing::info!`'da plaintext API key yazılıyordu → sadece prefix loglanıyor
2. **SSO Login Rate Limit** — `/sso/login` endpoint'inde rate limit yok → 10 istek/dakika eklendi
3. **Admin Kendini Kilitleyebilir** — `admin_bypass=false` + son admin → sistem kilitlenir → son admin her zaman bypass yapabilir

### P1 — Yüksek Öncelik
4. **Team Delete Endpoint'i Yok** — `DELETE /v1/teams/:id` eklendi (sadece owner)
5. **Owner Takımdan Ayrılamaz** — `POST /v1/teams/:id/leave` eklendi (owner hariç)
6. **Ownership Transfer Yok** — `POST /v1/teams/:id/transfer` eklendi
7. **SAML InResponseTo Doğrulaması** — Replay koruması eklendi
8. **SAML Assertion Fields** — `destination` ve `audience` çıkarılıyor
9. **Verified Domain Sütunu** — `sso_configs.verified_domain` eklendi (migration 068)

### P2 — Orta Öncelik
10. **SSO Login Attempts Cleanup** — Retention job'a 90 gün temizlik eklendi

## Değişiklikler

| Dosya | Değişiklik |
|-------|-----------|
| `api/src/routes/sso.rs` | Rate limit, API key log fix, verified domain, SAML validation |
| `api/src/routes/auth.rs` | Admin lockout prevention |
| `api/src/routes/teams.rs` | Delete, leave, transfer endpoints |
| `api/src/jobs/retention.rs` | SSO login attempts cleanup |
| `migrations/068_sso_verified_domain.sql` | Yeni migration |

## Kalan Sorunlar (P2 — İleride)
- OIDC ID token imza doğrulaması (JWKS)
- SSO state in-memory → Redis
- SAML Single Logout (SLO)
- Frontend SSO enforce sonrası auto-team ayarı değiştirme
- Team davet email gönderimi

## DB Uygulanan Migrations
- 067: `admin_bypass` + `sso_login_attempts` ✅
- 068: `verified_domain` ✅
