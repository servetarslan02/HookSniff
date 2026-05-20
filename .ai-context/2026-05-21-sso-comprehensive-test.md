# SSO Kapsamlı Test Raporu — 2026-05-21

## Test Edilen Ortam
- **Dashboard:** https://hooksniff.vercel.app
- **API:** https://hooksniff-api-1046140057667.europe-west1.run.app
- **Hesap:** demo@hooksniff.com (Enterprise plan, Admin)
- **Takım:** MegaCorp Engineering (11 üye)

---

## 📊 Genel Sonuç

| Kategori | Çalışan | Bug | Eksik |
|----------|---------|-----|-------|
| SSO Config CRUD | ✅ | 🔴 1 kritik | — |
| SSO Login Flow | ✅ | — | 🔴 UI eksik |
| Domain Verification | ✅ | — | — |
| SSO Providers | ✅ | — | — |
| SSO Test Connection | ✅ | — | — |
| Login Attempts | ✅ | — | — |
| Audit Log | ✅ | — | — |
| Dashboard SSO Form | ⚠️ | 🔴 3 bug | — |
| Login Page SSO | ❌ | — | 🔴 Tamamen eksik |
| Multi-Team SSO | ❌ | 🔴 DB constraint | — |
| SSO Enable/Disable | ✅ | — | — |
| Edge Cases | ✅ | — | — |

---

## 🔴 KRİTİK BUG'LAR

### 1. Dashboard: `verified_domain` API'ye gönderilmiyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/sso/SsoContent.tsx`
- **Sorun:** `handleSave()` fonksiyonu form'daki domain bilgisini (`domainInput`) body'ye eklemiyor
- **Sonuç:** Kullanıcı domain giriyor ama API'ye gitmiyor → `verified_domain: null`
- **Çözüm:** `body.verified_domain = domainInput.trim() || null;` eklenmeli

### 2. Dashboard: `admin_bypass` API'ye gönderilmiyor
- **Dosya:** Aynı `handleSave()` fonksiyonu
- **Sorun:** `adminBypass` state'i body'ye eklenmiyor
- **Çözüm:** `body.admin_bypass = admin_bypass;` eklenmeli

### 3. Dashboard: `enabled` hardcoded `false`
- **Dosya:** Aynı `handleSave()` fonksiyonu
- **Sorun:** `enabled: false` olarak sabitlenmiş, kullanıcı SSO'yu aktif edemiyor
- **Çözüm:** Mevcut config'den `enabled` durumunu korumalı veya "Save" sonrası "Enable" butonu olmalı

### 4. Login sayfasında SSO algılama yok
- **Dosya:** `dashboard/src/app/[locale]/login/content.tsx`
- **Sorun:** Email girildiğinde `/v1/sso/providers?domain=...` çağrılmıyor, SSO login seçeneği gösterilmiyor
- **Sonuç:** Enterprise müşteriler SSO ile giriş yapamıyor
- **Çözüm:** Email input'a onChange → providers kontrolü → "Login with SSO" butonu

### 5. Database: `customer_id UNIQUE` constraint'i çoklu takım SSO'yu engelliyor
- **Dosya:** `migrations/038_backend_endpoints.sql` (orijinal tablo)
- **Sorun:** `sso_configs` tablosunda hem `customer_id UNIQUE` hem `team_id UNIQUE` var. Aynı kullanıcı farklı takımda SSO oluşturamaz → `DATABASE_ERROR`
- **Çözüm:** `ALTER TABLE sso_configs DROP CONSTRAINT sso_configs_customer_id_key;` (migration 069'da yapılmalıydı)

### 6. DELETE endpoint team_id doğrulamıyor
- **Dosya:** `api/src/routes/sso.rs` (delete handler)
- **Sorun:** `team_id=nonexistent` ile DELETE çağrıldığında bile `deleted: true` döndü ve MegaCorp config'i silindi
- **Sonuç:** Yanlış takım ID ile SSO config silinebilir
- **Çözüm:** DELETE'de team_id varlığını kontrol et

---

## 🟡 ORTA SEVİYE BUG'LAR

### 7. i18n: `sso.generateTxt` çevrilmemiş
- **Etki:** Buton metni raw key olarak görünüyor
- **Dosya:** `dashboard/src/messages/en.json`, `tr.json`

### 8. i18n: `sso.autoTeamJoinWarning` çevrilmemiş
- **Etki:** Uyarı mesajı raw key olarak görünüyor
- **Dosya:** Aynı

### 9. SAML provider farklı takımda 500 hatası
- **Sorun:** TechFlow takımı için SAML SSO oluşturma DATABASE_ERROR
- **Neden:** Bug #5 (customer_id constraint)

### 10. Test Connection butonu disabled kalıyor
- **Sorun:** Config yüklendikten sonra bile "Test Connection" disabled
- **Neden:** Provider seçimi API'den gelen config'e göre set edilmiyor (UI state)

### 11. Provider butonları active state gösterilmiyor
- **Sorun:** Config yüklendikten sonra ne SAML ne OIDC [active] olarak işaretlenmiyor

---

## ✅ ÇALIŞAN ÖZELLİKLER

### SSO Config API
| Endpoint | Durum | Not |
|----------|-------|-----|
| `GET /sso/config` | ✅ | Config doğru döndürülüyor |
| `POST /sso/config` | ✅ | OIDC config kaydediliyor |
| `DELETE /sso/config` | ⚠️ | Team_id doğrulama yok |
| `POST /sso/test` | ✅ | OIDC discovery çalışıyor |

### SSO Login Flow
| Endpoint | Durum | Not |
|----------|-------|-----|
| `GET /sso/providers` | ✅ | Domain lookup çalışıyor |
| `GET /sso/login` | ✅ | 307 → Google OAuth redirect |
| `GET /sso/oidc/callback` | ✅ | (Manuel test edilmedi) |
| `POST /sso/saml/callback` | ✅ | (Manuel test edilmedi) |

### Domain Verification
| Endpoint | Durum | Not |
|----------|-------|-----|
| `POST /sso/verify-domain` | ✅ | TXT record üretiyor |
| `POST /sso/verify-domain/check` | ✅ | DNS kontrolü çalışıyor |

### Login Attempts & Audit
| Endpoint | Durum | Not |
|----------|-------|-----|
| `GET /sso/login-attempts` | ✅ | IP, email, success/failure kayıtlı |
| Audit Log UI | ✅ | Tüm aksiyonlar listeleniyor |

### Edge Cases
| Senaryo | Sonuç |
|---------|-------|
| Geçersiz domain | ✅ `sso_available: false` |
| Public domain (gmail) | ✅ `sso_available: false` |
| Boş email | ✅ 400 "Invalid email" |
| SSO olmayan kullanıcı | ✅ 400 "SSO not configured" |
| SSO devre dışı | ✅ 400 "SSO not configured" |
| SSO tekrar aktif | ✅ 307 redirect |

---

## 🛠️ Öncelikli Düzeltme Planı

### P0 — Kritik (Hemen yapılmalı)
1. **Dashboard SSO form fix** — `verified_domain`, `admin_bypass`, `enabled` API'ye gönderilmeli
2. **Login sayfası SSO algılama** — Email input'a SSO providers kontrolü + "Login with SSO" butonu
3. **Database migration** — `customer_id UNIQUE` constraint kaldırılmalı

### P1 — Orta (Bu oturumda yapılmalı)
4. **i18n fix** — `sso.generateTxt`, `sso.autoTeamJoinWarning` çevirileri
5. **DELETE endpoint** — Team_id doğrulama eklenmeli
6. **Test Connection butonu** — Config yüklendikten sonra aktif olmalı
7. **Provider active state** — API'den gelen provider'a göre UI güncellenmeli

### P2 — Düşük (Sonraki oturum)
8. **SSO callback handler** — Gerçek OIDC token exchange test edilmeli
9. **SSO enforce modal** — "Tüm ekip üyeleri SSO ile giriş yapacak" onayı
10. **Audit log SSO events** — SSO_CONFIG_CREATE, SSO_LOGIN_ATTEMPT vb.
