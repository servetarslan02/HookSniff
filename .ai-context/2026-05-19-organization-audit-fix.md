# 2026-05-19 — Organization Sayfası Tam İnceleme + Düzeltmeler

## Yapılan İşler

### 🔍 Organizasyon Sayfası Analizi
- Team, SSO, Audit Log sayfaları detaylı incelendi
- SSO ↔ Team ilişkisi araştırıldı
- 6 kritik sorun tespit edildi

### 🐛 Bug #1: auto_join_default_team (KRİTİK)
**Sorun:** SSO ile giriş yapan yeni kullanıcı otomatik ekibe eklenemiyordu.
- Fonksiyon, SSO user'ın email'iyle `sso_configs` tablosunda arama yapıyordu
- Ama SSO config, şirket sahibinin `customer_id`'siyle kayıtlı
- Yeni kullanıcının email'i tabloda yok → boş dönüyor → auto-join çalışmıyor

**Çözüm:** 
- Fonksiyon signature değiştirildi: `customer_id, customer_email` → `sso_user_id, sso_owner_id`
- SSO config artık `sso_owner_id` ile doğrudan aranıyor
- Her iki callback (SAML + OIDC) güncellendi: `login_state.customer_id` (SSO config owner) kullanılıyor

### 🐛 Bug #2: UUID/String Tip Hatası
**Sorun:** `default_team_id` UUID ama `Option<String>` olarak okunuyordu
**Çözüm:** Tip `(Option<Uuid>, Option<String>)` olarak düzeltildi

### 🐛 Bug #3: Yeni Kullanıcı SSO Login Başarısız
**Sorun:** `/sso/login?email=newuser@company.com` → "No account found" hatası
- Yeni kullanıcı DB'de yok, müşteri araması başarısız oluyordu
- Ama `find_or_create_sso_customer` callback'te otomatik oluşturuyordu

**Çözüm:**
- `initiate_sso_login` yeniden yazıldı
- Strateji 1: Mevcut kullanıcı → kendi SSO config'ini bul
- Strateji 2: Yeni kullanıcı → email domain'inden SSO config bul (`%@domain` LIKE sorgusu)
- Her iki durumda da IdP'ye redirect çalışır

### 🔒 Bug #4: SSO Login Engelleme Yok
**Sorun:** SSO zorunlu kılınmış olsa bile şifre ile giriş yapılabiliyordu
**Çözüm:** `auth.rs` login handler'a SSO kontrolü eklendi:
- `sso_configs.enabled = true` → şifre girişi engellenir
- `admin_bypass = true` + kullanıcı admin → bypass izni

### 📝 Bug #5: Eksik Migration
**Sorun:** `admin_bypass` sütunu ve `sso_login_attempts` tablosu migration dosyası yoktu (DB'ye manuel uygulanmış)
**Çözüm:** `migrations/067_sso_admin_bypass_and_attempts.sql` oluşturuldu

### 📊 Bug #6: Audit Log Eksik
**Sorun:** SSO auto-join'de audit log yoktu
**Çözüm:** 
- SSO login sonrası `SSO_LOGIN` audit log eklendi (SAML + OIDC)
- Auto-join sonrası `SSO_AUTO_JOIN_TEAM` audit log eklendi

## Değişiklikler

| Dosya | Değişiklik |
|-------|-----------|
| `api/src/routes/sso.rs` | auto_join_default_team düzeltmesi, initiate_sso_login yeniden yazımı, audit log |
| `api/src/routes/auth.rs` | SSO login engelleme kontrolü |
| `migrations/067_sso_admin_bypass_and_attempts.sql` | Yeni migration (admin_bypass + sso_login_attempts) |

## Frontend Durumu
- SSO sayfasında Auto Team Join UI zaten mevcut ✅
- i18n anahtarları (en + tr) mevcut ✅
- `default_team_id` ve `default_role` API response'da mevcut ✅

## Sıradaki
1. Cloud Build ile deploy (API değişiklikleri)
2. Migration 067 Neon DB'ye uygula
3. Manuel SSO test (gerçek IdP ile)
4. P2 kalan sorunlar
