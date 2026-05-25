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

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: SSO Test Butonu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx`
- **Backend:** `POST /v1/sso/test` — SSO bağlantı testi
- **Sorun:** api.ts'de tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     testSso: (token: string) =>
       apiFetch<{ success: boolean; message: string }>('/sso/test', { method: 'POST', token }),
     ```
  2. SSO yapılandırma formuna "Bağlantıyı Test Et" butonu ekle
  3. Sonuç: ✅ Başarılı / ❌ Başarısız + hata mesajı
  4. i18n key: `testSsoConnection`, `ssoTestSuccess`, `ssoTestFailed`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/sso/page.tsx`
- **Sorun:** 2 useEffect, 5 fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)
