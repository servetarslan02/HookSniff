# ⚙️ Ayarlar — En Kritik İnceleme

> **Bölüm:** Ayarlar  
> **İçerik:** Profil, Şifre, API Key, Bildirimler, Gizlilik, Tehlike  
> **İnceleme Tarihi:** 2026-05-12  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `29-ayarlar.md`

---

## 📑 İçindekiler

- [Sayfa Yapısı](#sayfa-yapisi)
- [Özellikler](#ozellikler)
- [Tespit Edilen Durumlar](#tespit-edilen-durumlar)
- [Yapılacaklar](#yapilacaklar)

---

## Sayfa Yapısı

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/settings/page.tsx`  
> Route: `/settings`

6 ayrı bölüm (section bileşenleri):

| Bölüm | Bileşen | Açıklama |
|-------|---------|----------|
| Profil | ProfileSection | Ad, email, avatar |
| Şifre | PasswordSection | Şifre değiştirme |
| API Key | ApiKeySection | API key gösterimi |
| Bildirimler | NotificationSection | Bildirim tercihleri |
| Gizlilik | PrivacyConsentSection | GDPR onayları |
| Tehlike | DangerZoneSection | Hesap silme |

---

## Özellikler

- ✅ Profil düzenleme
- ✅ Şifre değiştirme
- ✅ API key gösterimi
- ✅ Bildirim tercihleri
- ✅ Gizlilik onayları (GDPR)
- ✅ Hesap silme (tehlikeli alan)
- ✅ Bileşenlere ayrılmış yapı

---

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı (6 section)
- GDPR uyumlu (PrivacyConsentSection)
- Danger zone ayrılmış
- i18n desteği
- ConsentToggle: Backend'e bağlandı ✅ — `GET /auth/consent` ile durum çekme, `POST /auth/consent` ile kaydetme
- NotificationSection: API'den veri çekiyor ✅ — `GET /portal/notifications` ile tercih çekme, localStorage fallback
- setTimeout cleanup: 5 dosyada useRef + useEffect cleanup pattern ✅
- twoFactorApi: api.ts'de tanımlı ✅ — enable/confirm/disable/getStatus

### 🔴 Eksiklikler
- İki faktörlü doğrulama (2FA) ayarı
- Oturum yönetimi (aktif oturumlar)
- Veri dışa aktarma (GDPR export)
- Dil/ayar tercihleri
- Tema tercihleri (dark/light/auto)

---

## 🔧 Yapılacaklar (2026-05-13)

### ✅ Düzeltildi

#### ~~BF-03: ConsentToggle API Çağırmıyor~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ConsentToggle.tsx`
- **Durum:** ✅ DÜZELTİLDİ — Backend'e bağlandı
- Sayfa yüklenirken `GET /auth/consent` endpoint'inden durum çekiyor
- Toggle değişikliğinde `POST /auth/consent` endpoint'ine gönderiyor
- Başarısız olursa eski değerine geri dönüyor (optimistic update + rollback)
- localStorage ve cookie senkronizasyonu devam ediyor

#### ~~BF-04: Bildirim Tercihleri Başlangıç Değerleri localStorage'dan~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/NotificationSection.tsx`
- **Durum:** ✅ DÜZELTİLDİ — API'den veri çekiyor
- Sayfa yüklenirken `GET /portal/notifications` endpoint'inden tercihleri çekiyor
- API başarısız olursa localStorage'a fallback yapıyor
- Loading skeleton eklendi

#### ~~ML-01: PasswordSection — setTimeout Cleanup Yok~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/PasswordSection.tsx`
- **Durum:** ✅ DÜZELTİLDİ — `useRef` + `useEffect` cleanup pattern uygulandı

#### ~~ML-02: ApiKeySection — setTimeout Cleanup Yok~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ApiKeySection.tsx`
- **Durum:** ✅ DÜZELTİLDİ — `useRef` + `useEffect` cleanup pattern uygulandı

#### ~~ML-03: ProfileSection — setTimeout Cleanup Yok~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ProfileSection.tsx`
- **Durum:** ✅ DÜZELTİLDİ — `useRef` + `useEffect` cleanup pattern uygulandı

### 🔴 KRİTİK: Backend-Frontend Uyumsuzluğu

#### BF-01: 2FA Ayarları Eksik ⚠️ EN KRİTİK
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/page.tsx`
- **Backend:**
  ```
  POST /v1/auth/2fa/enable   → 2FA başlatır (TOTP secret döndürür)
  POST /v1/auth/2fa/confirm  → TOTP kodu doğrular (2FA'yı aktif eder)
  POST /v1/auth/2fa/verify   → Giriş sırasında 2FA doğrular
  POST /v1/auth/2fa/disable  → 2FA'yı kapatır (şifre + TOTP gerekli)
  ```
- **Durum:** `twoFactorApi` api.ts'de tanımlı ✅ (enable/confirm/disable/getStatus). Settings sayfasında 2FA bölümü yok.
- **Adımlar:**
  1. `settings/components/TwoFactorSection.tsx` oluştur
  2. `api.ts`'ye ekle:
     ```typescript
     export const twoFactorApi = {
       enable: (token: string) =>
         apiFetch<{ secret: string; qr_url: string }>('/auth/2fa/enable', { method: 'POST', token }),
       confirm: (token: string, code: string) =>
         apiFetch<{ backup_codes: string[] }>('/auth/2fa/confirm', { method: 'POST', body: { code }, token }),
       disable: (token: string, password: string, code: string) =>
         apiFetch('/auth/2fa/disable', { method: 'POST', body: { password, code }, token }),
     };
     ```
  3. Bileşen yapısı:
     - 2FA durumu: ✅ Aktif / ❌ Pasif
     - "2FA'yı Aktifleştir" butonu → QR kod modal'ı
     - QR kod gösterimi (Google Authenticator uyumlu)
     - TOTP doğrulama input'u (6 haneli kod)
     - Backup kodları gösterimi (bir kez)
     - "2FA'yı Kapat" butonu (şifre + TOTP kodu gerekli)
  4. `settings/page.tsx`'ye ekle: `<TwoFactorSection />`
  5. i18n key'leri: `twoFactorAuth`, `enable2fa`, `disable2fa`, `scanQrCode`, `enterTotpCode`, `backupCodes`, `2faEnabled`, `2faDisabled`

#### BF-02: GDPR Veri Dışa Aktarma Butonu Yok ⚠️ KRİTİK
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/PrivacyConsentSection.tsx`
- **Backend:** `GET /v1/auth/export` — tüm kullanıcı verisini JSON olarak döndürür
- **Sorun:** "Verilerimi İndir" butonu yok.
- **Adımlar:**
  1. `PrivacyConsentSection`'a buton ekle:
     ```tsx
     <button onClick={handleExportData} className="...">
       {t('exportMyData')}
     </button>
     ```
  2. Handler:
     ```typescript
     const handleExportData = async () => {
       const data = await apiFetch('/auth/export', { token });
       const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `hooksniff-export-${new Date().toISOString().split('T')[0]}.json`;
       a.click();
       URL.revokeObjectURL(url);
     };
     ```
  3. i18n key: `exportMyData`, `exportMyDataDesc`, `exporting`

#### BF-03: ConsentToggle API Çağırmıyor ⚠️ KRİTİK
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ConsentToggle.tsx`
- **Sorun:** Sadece localStorage + cookie yazıyor, backend'e göndermiyor. GDPR uyumsuz.
- **Adımlar:**
  1. Backend'de `consent_log` tablosu oluştur:
     ```sql
     CREATE TABLE consent_log (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       customer_id UUID REFERENCES customers(id),
       consent_type VARCHAR(50) NOT NULL,
       granted BOOLEAN NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```
  2. Backend'de `POST /v1/auth/consent` endpoint'i ekle
  3. `ConsentToggle`'ı güncelle:
     ```typescript
     const handleToggle = async () => {
       const newValue = !enabled;
       setEnabled(newValue);
       localStorage.setItem(storageKey, String(newValue));
       // Backend'e gönder
       await apiFetch('/auth/consent', {
         method: 'POST',
         body: { consent_type: consentKey, granted: newValue },
         token,
       });
     };
     ```
  4. Sayfa yüklenirken onay durumunu backend'den çek

#### BF-04: Bildirim Tercihleri Başlangıç Değerleri localStorage'dan
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/NotificationSection.tsx`
- **Sorun:** Tercihler API'ye kaydediliyor ama başlangıç değerleri localStorage'dan okunuyor. Yeni cihazda eski tercihler gösterilmez.
- **Adımlar:**
  1. Sayfa yüklenirken API'den tercihleri çek:
     ```typescript
     useEffect(() => {
       async function fetchPreferences() {
         try {
           const prefs = await api.get('/portal/notifications', token);
           setEmailNotifs(prefs.email_on_success ?? true);
           setFailureAlerts(prefs.email_on_failure ?? true);
           setWeeklyDigest(prefs.email_on_weekly_digest ?? false);
         } catch {
           // Fallback: localStorage
           setEmailNotifs(localStorage.getItem('hooksniff_email_notifs') !== 'false');
         }
       }
       fetchPreferences();
     }, [token]);
     ```
  2. localStorage'u sadece fallback olarak kullan

### 🔒 Memory Leak

#### ML-01: PasswordSection — setTimeout Cleanup Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/PasswordSection.tsx`
- **Sorun:** `setTimeout` kullanılıyor ama `clearTimeout` yok.
- **Adımlar:**
  1. useEffect içinde timer oluştur
  2. Return'de `clearTimeout(timer)` ekle

#### ML-02: ApiKeySection — setTimeout Cleanup Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ApiKeySection.tsx`
- **Adımlar:** (standart — bkz. ML-01)

#### ML-03: ProfileSection — setTimeout Cleanup Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ProfileSection.tsx`
- **Adımlar:** (standart — bkz. ML-01)
