# 🔐 SSO / SAML

> Sayfa: `dashboard/src/app/[locale]/dashboard/sso/page.tsx`
> Route: `/dashboard/sso`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- SAML ve OIDC provider desteği
- Konfigürasyon: metadata_url, entity_id, sso_url, certificate
- Enabled/disabled toggle

### SAML Config
- metadata_url — Metadata URL
- entity_id — Entity ID
- sso_url — SSO URL
- certificate_set — Sertifika var/yok

### OIDC Config
- issuer_url — Issuer URL
- client_id — Client ID
- client_secret_set — Secret var/yok

## Özellikler
- ✅ SAML/OIDC provider seçimi
- ✅ Metadata/Issuer URL girişi
- ✅ Entity ID/Client ID girişi
- ✅ SSO URL girişi
- ✅ Sertifika girişi
- ✅ Enable/disable toggle
- ✅ Kaydetme

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Config yoksa boş form** — İlk kurulum rehberi yok
- **Sertifika doğrulama yok** — PEM format kontrolü

### 🔴 Eksiklikler
- SSO test butonu (connection test)
- SSO kurulum rehberi/wizard
- Metadata otomatik çekme (URL'den)
- Sertifika geçerlilik kontrolü
- SSO kullanıcı eşleştirmesi
- SSO activity log
