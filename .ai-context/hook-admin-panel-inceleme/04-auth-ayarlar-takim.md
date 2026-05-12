# 04 — Auth, Ayarlar & Takım Sayfaları İnceleme Raporu

> **İnceleme Tarihi:** 2026-05-12  
> **Kapsam:** Giriş, Kayıt, Email Doğrulama, OAuth Callback, Get Started, Dashboard Settings (tüm bileşenler), Team, API Keys, Billing, AuthGuard, OnboardingWizard, NotificationCenter, EmailVerificationBanner, Global State (store), API Client, SSE Hook, Middleware

---

## 📁 İncelenen Dosyalar

| # | Dosya | Satır | Tür |
|---|-------|-------|-----|
| 1 | `app/[locale]/login/page.tsx` | ~15 | Server Component |
| 2 | `app/[locale]/login/content.tsx` | ~220 | Client Component |
| 3 | `app/[locale]/register/page.tsx` | ~15 | Server Component (redirect) |
| 4 | `app/[locale]/verify-email/page.tsx` | ~120 | Client Component |
| 5 | `app/[locale]/auth/callback/page.tsx` | ~80 | Client Component |
| 6 | `app/[locale]/get-started/page.tsx` | ~15 | Server Component |
| 7 | `app/[locale]/get-started/content.tsx` | ~300 | Client Component |
| 8 | `app/[locale]/dashboard/settings/page.tsx` | ~35 | Client Component |
| 9 | `settings/components/ProfileSection.tsx` | ~110 | Client Component |
| 10 | `settings/components/PasswordSection.tsx` | ~120 | Client Component |
| 11 | `settings/components/NotificationSection.tsx` | ~100 | Client Component |
| 12 | `settings/components/ApiKeySection.tsx` | ~60 | Client Component |
| 13 | `settings/components/PrivacyConsentSection.tsx` | ~45 | Client Component |
| 14 | `settings/components/DangerZoneSection.tsx` | ~115 | Client Component |
| 15 | `settings/components/ToggleRow.tsx` | ~35 | UI Bileşeni |
| 16 | `settings/components/ConsentToggle.tsx` | ~50 | UI Bileşeni |
| 17 | `dashboard/team/page.tsx` | ~145 | Client Component |
| 18 | `team/components/TeamList.tsx` | ~60 | Client Component |
| 19 | `team/components/TeamDetail.tsx` | ~80 | Client Component |
| 20 | `team/components/CreateTeamModal.tsx` | ~75 | Client Component |
| 21 | `team/components/InviteMemberModal.tsx` | ~80 | Client Component |
| 22 | `dashboard/api-keys/page.tsx` | ~130 | Client Component |
| 23 | `api-keys/components/CreateKeyForm.tsx` | ~55 | Client Component |
| 24 | `api-keys/components/KeyList.tsx` | ~100 | Client Component |
| 25 | `api-keys/components/NewKeyAlert.tsx` | ~55 | Client Component |
| 26 | `api-keys/components/ConfirmActionModal.tsx` | ~55 | Client Component |
| 27 | `dashboard/billing/page.tsx` | ~230 | Client Component |
| 28 | `billing/components/PlanCards.tsx` | ~100 | Client Component |
| 29 | `billing/components/InvoiceTable.tsx` | ~85 | Client Component |
| 30 | `billing/components/UsageChart.tsx` | ~40 | SVG Chart |
| 31 | `billing/components/InvoiceStatusBadge.tsx` | ~20 | UI Bileşeni |
| 32 | `components/AuthGuard.tsx` | ~45 | Korumalı Rota |
| 33 | `components/OnboardingWizard.tsx` | ~350 | Onboarding |
| 34 | `components/Onboarding.tsx` | ~200 | Onboarding (eski) |
| 35 | `components/onboarding/SetupChecklist.tsx` | ~110 | Checklist |
| 36 | `components/onboarding/Confetti.tsx` | ~30 | Animasyon |
| 37 | `components/onboarding/SuccessToast.tsx` | ~30 | Toast |
| 38 | `components/onboarding/types.ts` | ~45 | Tip Tanımları |
| 39 | `components/NotificationCenter.tsx` | ~140 | Bildirim |
| 40 | `components/EmailVerificationBanner.tsx` | ~85 | Banner |
| 41 | `lib/store.tsx` | ~140 | Global State |
| 42 | `lib/api.ts` | ~550 | API Client |
| 43 | `lib/errors.ts` | ~12 | Error Helper |
| 44 | `lib/error-catalog.ts` | ~130 | Error Kataloğu |
| 45 | `hooks/useDeliveryStream.ts` | ~100 | SSE Hook |
| 46 | `middleware.ts` | ~60 | Next.js Middleware |

---

## 🔐 1. AUTH SİSTEMİ

### 1.1 Giriş Sayfası (`login/page.tsx` + `content.tsx`)

**Mimari:**
- Server Component (`page.tsx`) sadece `Suspense` wrapper + metadata sağlıyor
- Tüm mantık `content.tsx` içinde `'use client'` olarak çalışıyor
- Login/Register tek formda mod değişimi ile yönetiliyor (`mode` state)

**Güçlü Yönler:**
- ✅ `getPasswordStrength()` fonksiyonu kayıt sırasında gerçek zamanlı şifre gücü gösteriyor (uzunluk, büyük/küçük harf, rakam, özel karakter)
- ✅ Kayıt için KVKK/GDPR uyumlu consent checkbox zorunlu (`consentChecked`)
- ✅ OAuth butonları (Google + GitHub) doğru API endpoint'lerine yönlendiriyor
- ✅ `autoComplete`属性ları doğru ayarlanmış (`email`, `current-password`, `new-password`)
- ✅ i18n desteği tam (`useTranslations('auth')`)
- ✅ Dark mode desteği tutarlı

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| L-01 | 🔴 Kritik | **API URL her component'te tekrar ediyor** | `process.env.NEXT_PUBLIC_API_URL \|\| ...` ifadesi login, verify-email, auth/callback, store, api.ts, EmailVerificationBanner, useDeliveryStream olmak üzere 7+ yerde tekrar ediyor. Tek bir sabit veya helper fonksiyon olmalı. |
| L-02 | 🟡 Orta | **Register/login hata mesajı ayrımı yok** | `catch` bloğunda `getErrorMessage(err)` kullanılıyor ama register'a özel hatalar (ör. "email already exists") için ayrı handling yok. `error-catalog.ts`'de `DUPLICATE_EMAIL` var ama login formunda kullanılmıyor. |
| L-03 | 🟡 Orta | **Password strength sadece kayıt modunda** | Login modunda zayıf şifre girilse bile uyarı yok (bu kasıtlı olabilir ama UX açısından tartışmalı) |
| L-04 | 🟢 Düşük | **Loading spinner boyutu hardcoded** | `LoadingSpinner size="sm"` kullanılıyor ama fallback'te `w-8 h-8` hardcoded |

### 1.2 Kayıt Sayfası (`register/page.tsx`)

**Mimari:**
- Sadece `redirect('/login?mode=register')` — login sayfasına yönlendirme
- ISR: `revalidate = 3600` (1 saat)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| R-01 | 🟢 Düşük | **ISR gereksiz** | Register sayfası sadece redirect yapıyor, ISR'ın bir anlamı yok. `force-dynamic` veya hiç revalidate vermemek daha doğru. |

### 1.3 Email Doğrulama (`verify-email/page.tsx`)

**Güçlü Yönler:**
- ✅ 4 durum yönetimi: `loading`, `success`, `expired`, `error`
- ✅ Expired link için yeniden gönderme butonu var
- ✅ `Suspense` ile `useSearchParams` hatası önlenmiş

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| V-01 | 🟡 Orta | **Resend butonu email bilgisi göndermiyor** | `POST /auth/resend-verification` çağrısında body yok. Backend'in cookie'den kullanıcıyı tanıması gerekiyor ama bu belirsiz. |
| V-02 | 🟡 Orta | **Token URL'de görünüyor** | `searchParams.get('token')` ile alınıyor. URL'de token taşımak güvenlik riski — loglara, tarayıcı geçmişine kaydedilebilir. |
| V-03 | 🟢 Düşük | **Success durumunda otomatik yönlendirme yok** | Kullanıcı "Dashboard'a git" butonuna tıklamalı. 5 sn sonra otomatik yönlendirme UX açısından daha iyi olurdu. |

### 1.4 OAuth Callback (`auth/callback/page.tsx`)

**Güçlü Yönler:**
- ✅ Hata durumları iyi yönetiliyor (`oauth_denied`, genel hata)
- ✅ `/auth/me` ile session doğrulama yapılıyor
- ✅ Loading spinner UX'i iyi

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| C-01 | 🟡 Orta | **useEffect dependency eksik** | `[router]` dependency array'inde `locale` ve `t` de olmalı (lint uyarısı verebilir) |
| C-02 | 🟡 Orta | **Token exchange yok** | Backend cookie'yi zaten set etmiş olmalı ama `?token=` parametresi hiç işlenmiyor. Eğer backend redirect'te token gönderiyorsa, bu token'ın bir işlevi yok — gereksiz bir URL parametresi. |
| C-03 | 🟢 Düşük | **Çift loading state** | Hem `error` yokken loading spinner, hem de `error` varken farklı UI gösteriliyor — bu iyi ama transition animasyonu eksik. |

### 1.5 Global State (`lib/store.tsx`)

**Mimari:**
- React Context + `AuthProvider` ile global auth state
- `localStorage`'da sadece kullanıcı bilgisi saklanıyor (API key değil!)
- Cookie-based session: `token` state'i sadece `'cookie'` string'i tutuyor
- `/auth/me` ile mount'ta session doğrulama

**Güçlü Yönler:**
- ✅ API key localStorage'a kaydedilmiyor (güvenlik ✓)
- ✅ HttpOnly cookie kullanımı doğru
- ✅ `login`, `register`, `logout` fonksiyonları `useCallback` ile memoize
- ✅ Logout'ta backend'e de bildirim yapılıyor

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| S-01 | 🔴 Kritik | **Race condition: login sonrası yönlendirme** | `login()` fonksiyonu `persistAuth()` çağırıyor ama `router.push('/dashboard')` login/content.tsx'te hemen ardından yapılıyor. `persistAuth` state'i async güncellediğinden, dashboard'a vardığında henüz `user` null olabilir. |
| S-02 | 🟡 Orta | **Logout'ta cookie temizliği garantisi yok** | `fetch('/auth/logout')` `.catch()` ile yutuluyor. Eğer bu istek başarısız olursa, client-side state temizleniyor ama HttpOnly cookie hâlâ geçerli kalabilir. |
| S-03 | 🟡 Orta | **`is_admin` bilgisi yeterince kullanılmıyor** | Store'da `is_admin` var ama AuthGuard bunu kontrol etmiyor. Admin rotalarına normal kullanıcı erişebilir (backend engellemiyorsa). |
| S-04 | 🟢 Düşük | **`STORAGE_KEY` collision riski** | `'hooksniff_user'` key'i başka HookSniff instance'ları ile çakışabilir. Prefix olarak domain eklemek daha güvenli. |

### 1.6 AuthGuard (`components/AuthGuard.tsx`)

**Güçlü Yönler:**
- ✅ Loading ve redirect durumları ayrı yönetiliyor
- ✅ `useEffect` ile programatik yönlendirme

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| AG-01 | 🟡 Orta | **Flash of content** | Token yokken bile önce loading spinner, sonra redirect spinner gösteriyor. İlk render'da direkt redirect yapılabilir. |
| AG-02 | 🟡 Orta | **Rol tabanlı erişim kontrolü eksik** | Sadece token varlığını kontrol ediyor. `is_admin` veya plan bazlı kontrol yok. |
| AG-03 | 🟢 Düşük | **Redirect sonrası geri dönüş URL'i yok** | Login'e yönlendirirken `?redirect=` parametresi eklenmiyor (middleware bunu yapıyor ama AuthGuard yapmıyor). |

### 1.7 API Client (`lib/api.ts`)

**Mimari:**
- Merkezi `apiFetch<T>()` fonksiyonu
- Otomatik retry (502/503/504 için exponential backoff, max 2 deneme)
- 401 durumunda otomatik token refresh
- CSRF koruması (Origin header)
- Çevrimdışı kontrolü (`navigator.onLine`)
- 30 saniye timeout

**Güçlü Yönler:**
- ✅ `refreshPromise` ile concurrent 401'lerde tek refresh isteği (throttling)
- ✅ Error catalog entegrasyonu (Item 282)
- ✅ `assertOnline()` ile fail-fast
- ✅ AbortController ile timeout + external signal forwarding
- ✅ Generic `api` wrapper ile axios-benzeri kullanım (`api.get`, `api.post`, vb.)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| API-01 | 🔴 Kritik | **401'de localStorage temizleniyor ama cookie temizlenmiyor** | `localStorage.removeItem('hooksniff_auth')` yapılıyor ama `'hooksniff_user'` key'i temizlenmiyor (store'daki key'den farklı). Ayrıca HttpOnly cookie temizlenemiyor — sadece redirect yapılıyor. |
| API-02 | 🟡 Orta | **CSRF header yetersiz** | Sadece `Origin` header gönderiliyor. Double-submit cookie pattern veya CSRF token daha güvenli olurdu. |
| API-03 | 🟡 Orta | **Retry logic her hatada çalışıyor** | 400 (Bad Request) gibi client hatalarında da retry denemesi yapılıyor (sadece `isTransientError` check'i var ama catch bloğunda network error retry'ı var). |
| API-04 | 🟡 Orta | **`api` wrapper'ın `delete` metodu body desteklemiyor** | `api.delete` sadece `(path, token)` alıyor. Bazı DELETE endpoint'leri body gerektirebilir. |
| API-05 | 🟢 Düşük | **Error message parsing** | `error.error?.message` fallback zinciri karmaşık. `extractErrorCode` + `getUserFriendlyMessage` zinciri iyi ama hata yapısının backend ile uyumlu olduğundan emin olunmalı. |
| API-06 | 🟢 Düşük | **PlatformSettings interface'inde `resend_api_key` ve `webhook_secret` açıkça tiplenmiş** | Bu tür hassas bilgiler interface'de yer almamalı veya backend'in bunları asla döndürmediğinden emin olunmalı. |

### 1.8 Error Sistemi (`lib/errors.ts` + `lib/error-catalog.ts`)

**Güçlü Yönler:**
- ✅ Merkezi error kataloğu (40+ error kodu)
- ✅ Kullanıcı dostu mesajlar (Item 283)
- ✅ `getErrorMessage()` ile `unknown` tip güvenli extraction
- ✅ Kategorize edilmiş kodlar: Auth, Validation, Resources, Rate Limiting, Billing, Server, Conflicts, CSRF

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| E-01 | 🟢 Düşük | **i18n desteği yok** | Error mesajları İngilizce hardcoded. `getErrorMessage`'e fallback parametre olarak çevrilmiş metin geçiliyor ama `getUserFriendlyMessage` hep İngilizce döndürüyor. |

---

## ⚙️ 2. AYARLAR SAYFASI

### 2.1 Settings Page (`dashboard/settings/page.tsx`)

**Mimari:**
- 6 section: Profile, Password, API Key, Notifications, Privacy Consent, Danger Zone
- Her section ayrı component
- `useAuth()` ile user, token, apiKey alınıyor

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| ST-01 | 🟡 Orta | **Token prop drilling** | `token` her section'a ayrı ayrı prop olarak geçiliyor. Section'lar `useAuth()`'u doğrudan çağırabilirdi. |
| ST-02 | 🟢 Düşük | **Layout eksik** | `max-w-2xl` ile sınırlanmış ama responsive breakpoint'ler kontrol edilmeli. |

### 2.2 ProfileSection

**Güçlü Yönler:**
- ✅ Avatar initial'i dinamik (isim veya email'in ilk harfi)
- ✅ Plan badge'i gösteriliyor
- ✅ Success/error mesajları 3 sn sonra otomatik temizleniyor

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| PS-01 | 🟡 Orta | **Email değişikliği sonrası doğrulama akışı yok** | Email değiştirildiğinde backend yeni email doğrulaması göndermeli ama frontend'de bunu tetikleyen bir akış yok. |
| PS-02 | 🟡 Orta | **Profil güncelleme sonrası state senkronizasyonu yok** | `api.put('/auth/profile')` başarılı olduktan sonra `useAuth()`'daki user state güncellenmiyor. Sayfa yenilenmeden eski isim/email görünebilir. |
| PS-03 | 🟢 Düşük | **`import('@/lib/api')` dynamic import gereksiz** | Her save işleminde dynamic import yapılıyor. Top-level import daha verimli olurdu. |

### 2.3 PasswordSection

**Güçlü Yönler:**
- ✅ Minimum 8 karakter kontrolü
- ✅ Şifre eşleşme kontrolü
- ✅ Başarılı değişim sonrası alanlar temizleniyor

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| PW-01 | 🟡 Orta | **Hata mesajları i18n değil** | "New passwords do not match" ve "Password must be at least 8 characters" hardcoded İngilizce. `t()` ile çevrilmeli. |
| PW-02 | 🟢 Düşük | **Şifre gücü göstergesi yok** | Login/register'da var ama settings'te yeni şifre için yok. |

### 2.4 NotificationSection

**Güçlü Yönler:**
- ✅ `ToggleRow` ile temiz toggle UI
- ✅ API'ye kaydetme + localStorage senkronizasyonu

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| NS-01 | 🟡 Orta | **Çift state kaynağı** | Hem localStorage hem API var. Sayfa yüklendiğinde localStorage'dan okunuyor ama API'den fetch yok. İlk yükleme ile API senkron olmayabilir. |
| NS-02 | 🟢 Düşük | **`slack_webhook_url: null` hardcoded** | Slack entegrasyonu yok ama null gönderiliyor. Gelecekte bu alan dinamik olmalı. |

### 2.5 ApiKeySection

**Güçlü Yönler:**
- ✅ API key maskeleme (`••••••••`)
- ✅ Copy to clipboard
- ✅ "Manage API Keys" linki

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| AK-01 | 🟡 Orta | **API key burada gösterilmemeli** | Settings sayfasında API key'in maskelenmiş hali gösteriliyor ama bu bilgi `api-keys` sayfasında zaten var. Gereksiz bilgi tekrarı. |

### 2.6 PrivacyConsentSection + ConsentToggle

**Güçlü Yönler:**
- ✅ Cookie consent ve marketing consent ayrı ayrı
- ✅ `ConsentToggle` hem localStorage hem cookie yazıyor (backend uyumluluğu)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| PC-01 | 🟡 Orta | **`consentKey` parametresi kullanılmıyor** | `_consentKey}` olarak destructuring edilmiş (underscore prefix = unused). Cookie key olarak `storageKey` kullanılıyor ama `consentKey` backend'e gönderilmeli. |
| PC-02 | 🟢 Düşük | **Cookie max-age hardcoded** | `365 * 24 * 60 * 60` (1 yıl). Bu değer configurable olmalı. |

### 2.7 DangerZoneSection

**Güçlü Yönler:**
- ✅ Hesap silme için "DELETE" yazarak onay mekanizması
- ✅ Modal ile confirm dialog
- ✅ Escape key ile kapatma (implicit, backdrop click var)
- ✅ Logout butonu ayrı section'da

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| DZ-01 | 🟡 Orta | **Hesap silme geri alınamaz uyarısı yetersiz** | Sadece "type DELETE" var. Etkilenen veriler (endpoints, deliveries, teams) listelenmeli. |
| DZ-02 | 🟢 Düşük | **`deletingAccount` state modal kapatıldığında sıfırlanmıyor** | `finally` bloğunda `setShowDeleteModal(false)` var ama `setDeleteConfirmText('')` çağrılmıyor (sadece cancel'da çağrılıyor). |

---

## 👥 3. TAKIM YÖNETİMİ

### 3.1 Team Page (`dashboard/team/page.tsx`)

**Mimari:**
- 3 sütunlu layout: TeamList (sol) + TeamDetail (sağ)
- CRUD operasyonları: create team, invite member, remove member, change role
- Rol tabanlı yetkilendirme: `canInvite`, `canRemove`, `canChangeRole`

**Güçlü Yönler:**
- ✅ `useCallback` ile fetch fonksiyonları memoize
- ✅ `ConfirmDialog` ile silme onayı
- ✅ Rol bazlı UI kontrolü (owner > admin > member)
- ✅ Kendi kendini demote etme engeli (`cannotDemoteSelf`)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| T-01 | 🟡 Orta | **Seçili takım silinme koruması yok** | Kullanıcı bir üyeyi silerken, eğer silinen kişi kendisi ise ne olacağı belirsiz. Backend bunu handle etmeli ama frontend'de uyarı yok. |
| T-02 | 🟡 Orta | **Team detail refresh'te scroll pozisyonu kayboluyor** | `fetchMembers` her `selectedTeam` değişikliğinde çağrılıyor ama UI'da scroll reset yok. |
| T-03 | 🟢 Düşük | **Loading state'de skeleton yok** | "Loading teams..." text'i yerine skeleton UI daha profesyonel olurdu. |

### 3.2 TeamList

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| TL-01 | 🟢 Düşük | **`locale` import edilmiş ama sadece tarih formatlamada kullanılıyor** | `toLocaleDateString(locale)` — bu iyi ama `member_count` için i18n pluralization kullanılmalı. |

### 3.3 TeamDetail

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| TD-01 | 🟡 Orta | **Owner rolü değiştirilebilir** | `ROLE_OPTIONS` array'inde `owner` da var ama `canChangeRole` sadece owner'da true. Yine de owner, başka birini owner yapabilir — bu iki owner yaratır mı? Backend bunu kontrol etmeli. |
| TD-02 | 🟢 Düşük | **Role change anında optimistic UI yok** | Rol değişikliği API çağrısından sonra fetch ile güncelleniyor. Optimistic update daha akıcı olurdu. |

### 3.4 InviteMemberModal

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| IM-01 | 🟡 Orta | **Email validasyonu sadece HTML level** | `type="email"` var ama ekstra validasyon yok. Backend zaten kontrol edecektir ama UX açısından inline hata gösterimi iyi olurdu. |
| IM-02 | 🟢 Düşük | **Rol seçenekleri hardcoded** | `['owner', 'admin', 'member']` — backend ile senkron olmalı. |

---

## 🔑 4. API KEY YÖNETİMİ

### 4.1 API Keys Page (`dashboard/api-keys/page.tsx`)

**Mimari:**
- CRUD: create, list, delete, rotate
- Yeni oluşturulan key bir kez gösteriliyor (`NewKeyAlert`)
- Confirm modals for delete + rotate

**Güçlü Yönler:**
- ✅ Key sadece oluşturulma anında gösteriliyor (güvenlik ✓)
- ✅ Rotate işlemi mevcut (key yenileme)
- ✅ Error dismiss mekanizması
- ✅ Prefix ile key tanımlama (`hr_live_k3y…`)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| AKP-01 | 🟡 Orta | **Key listesi yenilenmeden önceki state gösteriliyor** | Delete/rotate sonrası `fetchKeys()` çağrılıyor ama UI'da eski liste bir anlığına görünebilir (stale data). |
| AKP-02 | 🟡 Orta | **Key name zorunlu değil** | `CreateKeyForm`'da name opsiyonel. Birden fazla unnamed key kafa karıştırıcı olabilir. |
| AKP-03 | 🟢 Düşük | **Pagination eksik** | Tüm key'ler tek sayfada gösteriliyor. Çok fazla key varsa performans sorunu olabilir. |

### 4.2 ConfirmActionModal

**Güçlü Yönler:**
- ✅ `danger` ve `warning` variant desteği
- ✅ Backdrop click ile kapatma
- ✅ Loading state

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| CAM-01 | 🟢 Düşük | **Loading text'i hardcoded** | `tc('deleting')` kullanılıyor ama rotate işleminde de aynı text gösteriliyor. Rotate için farklı bir loading text olmalı. |

---

## 💳 5. FATURALANDIRMA

### 5.1 Billing Page (`dashboard/billing/page.tsx`)

**Mimari:**
- Plan özeti + kullanım grafiği + plan kartları + fatura tablosu
- Upgrade/cancel modals
- Polar.sh + Stripe + Iyzico checkout URL validasyonu

**Güçlü Yönler:**
- ✅ **Checkout URL whitelist güvenliği** — sadece güvenilir host'lara yönlendirme (`polar.sh`, `pay.stripe.com`, `sandbox-api.iyzipay.com`)
- ✅ Escape key ile modal kapatma + focus trap
- ✅ Kullanım yüzdesi renk kodlaması (>80% kırmızı, >50% sarı)
- ✅ Fiyat locale'e göre gösteriliyor (₺ vs $)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| BP-01 | 🔴 Kritik | **Cancel subscription flow'u eksik** | `handleCancel` fonksiyonu önce `getSubscription` çağırıyor, sonra `DELETE /billing/subscription` yapıyor. Bu iki adım arasında race condition olabilir. Ayrıca cancel sonrası `router.refresh()` yapılıyor ama user state güncellenmiyor. |
| BP-02 | 🟡 Orta | **Upgrade sonrası yönlendirme belirsiz** | `checkout_url` yoksa sadece toast gösteriliyor. Kullanıcı ne yapacağını bilmiyor. |
| BP-03 | 🟡 Orta | **Fatura tablosunda `$` hardcoded** | `inv.amount.toFixed(2)` önüne `$` konmuş. TRY locale'inde `$` göstermek yanlış. |
| BP-04 | 🟡 Orta | **Usage chart çok basit** | SVG bar chart sadece tek ay verisi gösteriyor. Geçmiş aylar için trend analizi yok. |
| BP-05 | 🟢 Düşük | **Next billing date hardcoded** | Her zaman ayın 1'i. Gerçek billing cycle farklı olabilir. |

### 5.2 PlanCards

**Güçlü Yönler:**
- ✅ Fiyat locale'e göre (₺/$)
- ✅ Popular badge
- ✅ Downgrade/upgrade ayrımı

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| PC-01 | 🟡 Orta | **Plan özellikleri hardcoded** | Features listesi kodda tanımlı. Backend'den gelmeli veya config'den okunmalı. |
| PC-02 | 🟢 Düşük | **Downgrade butonu aynı stil** | Downgrade işlemi için farklı bir uyarı/rengi olmalı. |

### 5.3 InvoiceTable + InvoiceStatusBadge

**Güçlü Yönler:**
- ✅ Status badge renk kodlaması (paid/pending/failed)
- ✅ Loading ve empty state'ler yönetilmiş

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| IT-01 | 🟢 Düşük | **Invoice ID truncation** | `inv.id.slice(0, 8)…` — hover'da full ID gösterilmeli. |

---

## 🚀 6. ONBOARDING SİSTEMİ

### 6.1 OnboardingWizard

**Mimari:**
- 6 adımlı wizard: Welcome → Use Case → SDK → Endpoint → Test → Done
- State localStorage'da saklanıyor
- Confetti animasyonu + progress bar
- Gerçek endpoint oluşturma (API çağrısı)

**Güçlü Yönler:**
- ✅ Adım bazlı ilerleme kaydı (geri gidebilme)
- ✅ SDK seçimi ile install komutu gösterimi
- ✅ Use case anketi (analytics için değerli)
- ✅ Confetti + success toast kutlaması
- ✅ `SetupChecklist` ile dashboard'da devam eden ilerleme

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| OW-01 | 🟡 Orta | **İki farklı onboarding sistemi var** | `OnboardingWizard.tsx` ve `Onboarding.tsx` ayrı component'ler. Hangisinin kullanıldığı belirsiz — potansiyel conflict. |
| OW-02 | 🟡 Orta | **Test webhook adımında "I've sent test" butonu** | Kullanıcı gerçekten göndermeden bu butona basabilir. Backend'de webhook gelip gelmediği kontrol edilmeli. |
| OW-03 | 🟢 Düşük | **Hardcoded Türkçe string** | "5 dk kurulum", "Kopyalandı!" gibi Türkçe string'ler i18n'den gelmeli. |
| OW-04 | 🟢 Düşük | **Confetti performansı** | 50 parça confetti, her biri ayrı div. Daha performanslı bir animasyon kütüphanesi (canvas-tabanlı) kullanılabilir. |

### 6.2 SetupChecklist

**Güçlü Yönler:**
- ✅ Dashboard'da kalıcı ilerleme göstergesi
- ✅ 24 saat sonra otomatik dismiss
- ✅ Expandable/collapsible

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| SC-01 | 🟡 Orta | **Checklist state'i localStorage'da** | Farklı cihazlardan giriş yapan kullanıcılar aynı ilerlemeyi göremez. Backend'de saklanmalı. |

### 6.3 Onboarding.tsx (Eski)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| O-01 | 🟡 Orta | **Bu component muhtemelen kullanılmıyor** | `OnboardingWizard` ile çakışıyor. Hangisinin aktif olduğundan emin olunmalı, kullanılmayan silinmeli. |

---

## 🔔 7. BİLDİRİMLER & BANNERLAR

### 7.1 NotificationCenter

**Mimari:**
- Dropdown menü ile bildirim listesi
- 30 saniyede bir polling
- Okundu işaretleme (tek tek + toplu)

**Güçlü Yönler:**
- ✅ Outside click ile kapatma
- ✅ Unread badge (9+ sınırlaması)
- ✅ Tip bazlı ikon mapping
- ✅ Link ile yönlendirme

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| NC-01 | 🟡 Orta | **Polling yerine SSE/WebSocket** | 30 saniyede bir polling gereksiz API çağrısı yapıyor. `useDeliveryStream` gibi SSE hook'u burada da kullanılabilir. |
| NC-02 | 🟡 Orta | **Hardcoded İngilizce string'ler** | "Notifications", "Mark all read", "No notifications", "View all notifications" — i18n'den gelmeli. |
| NC-03 | 🟢 Düşük | **Silent fail** | `catch {}` ile tüm hatalar yutuluyor. En azından console.warn yapılmalı. |

### 7.2 EmailVerificationBanner

**Güçlü Yönler:**
- ✅ AbortController ile cleanup
- ✅ Resend butonu
- ✅ Dismiss mekanizması

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| EV-01 | 🟡 Orta | **Her mount'ta /auth/me çağrılıyor** | Store zaten mount'ta `/auth/me` çağırıyor. Bu banner da aynı endpoint'i çağırıyor — gereksiz çift istek. |
| EV-02 | 🟡 Orta | **Dismiss state persistence yok** | Sayfa yenilendiğinde banner tekrar görünüyor. Session-level dismiss yeterli olmayabilir. |

---

## 🛡️ 8. MIDDLEWARE

### 8.1 Middleware (`middleware.ts`)

**Mimari:**
- i18n routing + protected route kontrolü
- Cookie tabanlı auth (HttpOnly: `hooksniff_token` + `hooksniff_refresh`)
- CSP header

**Güçlü Yönler:**
- ✅ Locale regex dinamik olarak routing config'den üretiliyor
- ✅ Refresh cookie varsa redirect yok (API token refresh yapacak)
- ✅ CSP header: `frame-ancestors 'none'` (clickjacking koruması), `base-uri 'self'`, `form-action 'self'`
- ✅ Matcher: API, _next, _vercel ve static dosyalar hariç

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| MW-01 | 🟡 Orta | **CSP'de `unsafe-inline` var** | Next.js hydration için gerekli ama XSS riski artırıyor. Nonce tabanlı CSP daha güvenli olurdu. |
| MW-02 | 🟡 Orta | **Protected paths hardcoded** | `['/dashboard', '/admin']` — yeni eklenen rotalar için güncelleme gerekebilir. |
| MW-03 | 🟢 Düşük | **`connect-src` hardcoded domain'ler** | `hooksniff-api-1046140057667.europe-west1.run.app` — bu GCP Cloud Run URL'i değişirse CSP de güncellenmeli. Environment variable'dan okunmalı. |
| MW-04 | 🟢 Düşük | **Locale regex edge case** | `pathname.replace(LOCALE_REGEX, '') || '/'` — eğer pathname sadece locale ise (ör. `/tr`), boş string yerine `/` döndürülüyor. Bu doğru ama test edilmeli. |

---

## 🔌 9. SSE HOOK

### 9.1 useDeliveryStream (`hooks/useDeliveryStream.ts`)

**Mimari:**
- `fetch` + `ReadableStream` ile SSE (EventSource yerine — header desteği için)
- Auto-reconnect (5 saniye)
- 100 delivery limit

**Güçlü Yönler:**
- ✅ `AbortController` ile temiz kapatma
- ✅ Callback ref pattern (`onDeliveryRef`) ile stale closure önleme
- ✅ Buffer parsing (yarım satır handling)

**Sorunlar:**

| # | Seviye | Sorun | Detay |
|---|--------|-------|-------|
| DS-01 | 🟡 Orta | **Reconnect backoff yok** | Her disconnect'te 5 sn sonra tekrar bağlanıyor. Exponential backoff daha iyi olurdu. |
| DS-02 | 🟡 Orta | **Token yenileme sonrası reconnect yok** | 401 alındığında stream kapanıyor ama token yenilendikten sonra yeni stream açılmıyor. |
| DS-03 | 🟢 Düşük | **`clearDeliveries` fonksiyonu export edilmiş ama kullanılmıyor** | Muhtemelen dashboard'da "clear" butonu için ama henüz implemente edilmemiş. |

---

## 📊 10. GENEL DEĞERLENDİRME

### Skor Kartı

| Kategori | Skor | Yorum |
|----------|------|-------|
| **Güvenlik** | 7/10 | HttpOnly cookie, CSRF, CSP iyi; ama token URL'de, API key tekrarı var |
| **Performans** | 7/10 | useCallback, memoization iyi; polling, dynamic import gereksiz |
| **UX/UI** | 8/10 | Dark mode, i18n, loading states iyi; bazı hardcoded string'ler |
| **Kod Kalitesi** | 7/10 | Component ayrımı iyi; API URL tekrarı, çift onboarding |
| **Erişilebilirlik** | 6/10 | ARIA attrs eksik, keyboard navigation eksik |
| **Hata Yönetimi** | 8/10 | Error catalog, fallback zinciri iyi; bazı silent fail'ler |

### Top 10 Kritik/Sorun

| # | Seviye | Konu | Öneri |
|---|--------|------|-------|
| 1 | 🔴 | API URL 7+ yerde tekrar | `lib/constants.ts`'da tek sabit |
| 2 | 🔴 | 401'de localStorage key uyumsuzluğu | `hooksniff_user` key'i tutarlı kullanılmalı |
| 3 | 🔴 | Billing cancel flow race condition | Tek atomik işlem yap |
| 4 | 🟡 | İki onboarding sistemi | Kullanılmayanı sil |
| 5 | 🟡 | i18n eksik string'ler (10+ yer) | Tüm hardcoded string'leri i18n'e taşı |
| 6 | 🟡 | Notification polling → SSE | 30sn polling'i SSE ile değiştir |
| 7 | 🟡 | PasswordSection hata mesajları hardcoded | `t()` ile çevir |
| 8 | 🟡 | ProfileSection state sync eksik | API sonrası user state güncelle |
| 9 | 🟡 | Checkout URL whitelist bypass riski | Backend'de de validasyon yap |
| 10 | 🟡 | CSP unsafe-inline | Nonce tabanlı CSP'ye geç |

### Olumlu Noktalar

1. **Cookie-based auth** — HttpOnly cookie kullanımı modern ve güvenli
2. **Error catalog** — Merkezi, kategorize edilmiş, kullanıcı dostu hata sistemi
3. **Component mimarisi** — Her sayfa kendi components/ klasöründe, temiz ayrım
4. **Onboarding** — 6 adımlı interaktif wizard, use case anketi, SDK seçimi
5. **API client** — Retry, timeout, CSRF, offline detection — production-ready
6. **i18n** — next-intl entegrasyonu tutarlı
7. **Checkout URL whitelist** — Açık redirect saldırılarına karşı koruma
8. **Dark mode** — Tutarlı `dark:` class kullanımı
9. **Rol tabanlı yetkilendirme** — Team sayfasında owner/admin/member ayrımı
10. **SetupChecklist** — Dashboard'da kalıcı onboarding ilerlemesi

---

*Bu rapor 46 dosyanın satır satır incelenmesiyle hazırlanmıştır.*
