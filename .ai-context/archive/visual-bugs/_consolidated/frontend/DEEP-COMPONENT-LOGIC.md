# DEEP COMPONENT LOGIC AUDIT — HookSniff Dashboard

> **Taranma Tarihi:** 2026-05-10
> **Kapsam:** `components/`, `app/[locale]/dashboard/`, `app/[locale]/login/`, `lib/` dizinlerindeki tüm .tsx/.ts dosyaları
> **Toplam Dosya:** 55+ dosya

---

## ÖZET

| Kategori | Bulunan Sorun Sayısı |
|----------|---------------------|
| 🔴 Critical (Kritik) | 5 |
| 🟠 High (Yüksek) | 12 |
| 🟡 Medium (Orta) | 15 |
| 🔵 Low (Düşük) | 10 |
| **Toplam** | **42** |

---

## 🔴 KRİTİK SORUNLAR

| Dosya | Satır | Sorun | Severity | Impact | Çözüm |
|-------|-------|-------|----------|--------|-------|
| `lib/store.tsx` | 78 | **Token her zaman `'cookie'` string'i olarak ayarlanıyor.** `setToken('cookie')` çağrısı, tüm API isteklerine `Authorization: Bearer cookie` header'ı ekler. Bu anlamsız bir değer gönderir. Gerçek auth cookie üzerinden (`credentials: 'include'`) yapıldığı için çalışıyor ama header gereksiz ve yanıltıcı. | 🔴 Critical | Tüm API istekleri geçersiz Bearer token gönderiyor; gelecekte token-based auth'a geçişte kırılma | Token state'ini gerçek bir access token ile ayarla ya da Authorization header'ı cookie-based auth'da hiç ekleme |
| `app/[locale]/dashboard/api-keys/page.tsx` | 42 | **`credentials: 'include'` yanlış yerde.** `headers` objesi içinde `credentials: 'include'` tanımlanmış. Bu bir header değil, fetch option'ıdır. Hiçbir etkisi olmaz ve cookie-based auth çalışmaz. | 🔴 Critical | API key CRUD işlemleri authentication gerektirir ama cookie gönderilmez; tüm istekler 401 döner | `credentials: 'include'`'ı fetch options seviyesine taşı: `fetch(url, { headers: {}, credentials: 'include' })` |
| `app/[locale]/dashboard/playground/page.tsx` | ~280 | **Playground istekleri hardcoded `'Bearer YOUR_TOKEN'` gönderiyor.** Hiçbir zaman gerçek token ile çalışmaz. | 🔴 Critical | Playground'dan API'ye yapılan tüm istekler 401 döner; feature tamamen çalışmaz | Token'ı `useAuth()`'tan al ve dinamik olarak header'a ekle |
| `app/[locale]/dashboard/search/page.tsx` | 55-70 | **Search debounce yok + dual trigger.** `useEffect` her `query` değişiminde API çağrısı yapıyor (her tuş vuruşunda). Ayrıca form submit de ayrı tetikliyor. | 🔴 Critical | Her tuş vuruşunda API çağrısı → rate limit, yavaş UI, gereksiz network trafiği | Debounce ekle (300-500ms) VEYA useEffect'ten search tetiklemesini kaldır, sadece form submit ile çalıştır |
| `app/[locale]/dashboard/health/page.tsx` | 30 | **`useAuth()` destructure edilmiş ama hiç kullanılmıyor: `const { } = useAuth()`.** Token hiç alınmamış, fetch'te credentials var ama header'da auth yok. | 🔴 Critical | Health endpoint'i auth gerektiriyorsa 401 döner; gerektirmiyorsa bile token gereksiz yere context'e bağlanır | `const { token } = useAuth()` yap ve fetch header'ına ekle |

---

## 🟠 YÜKSEK SEVİYELİ SORUNLAR

| Dosya | Satır | Sorun | Severity | Impact | Çözüm |
|-------|-------|-------|----------|--------|-------|
| `components/Toast.tsx` | 30-36 | **Toast'larda dismiss butonu yok.** Kullanıcı toast'ı kapatamaz, 4sn boyunca beklemek zorunda. Ayrıca `aria-live` region yok → screen reader erişimi yok. | 🟠 High | UX: Kullanıcı hata mesajını kapatamaz, ekran okuyucu toast'ları duyurmaz | Kapatma butonu ekle + `role="alert"` ve `aria-live="assertive"` ekle |
| `components/Toast.tsx` | 18-22 | **Toast stack limiti yok.** Hızlı ardışık hatalar onlarca toast biriktirebilir. | 🟠 High | Ekranın sağ alt köşesi toast'larla dolar, UI bozulur | Max 3-5 toast limiti koy, eski olanları otomatik kapat |
| `components/EmailVerificationBanner.tsx` | 16-21 | **Fetch hatasında `setVerified(true)` yapılıyor.** Network hatasında banner gizlenir, kullanıcı email doğrulamadan habersiz kalır. | 🟠 High | Kullanıcı email'ini doğrulamadan dashboard'u kullanmaya devam eder; email doğrulama akışı bypass edilir | Hata durumunda `setVerified(null)` yap (bilinmiyor durumu), banner'ı gösterme ama doğrulanmamış say |
| `components/CodeBlock.tsx` | 8-11 | **`navigator.clipboard.writeText` hata yakalaması yok.** Secure context olmayan durumlarda (HTTP, eski tarayıcı) throw eder. | 🟠 High | Copy butonuna basıldığında uygulama crash olabilir | try-catch ile sar, fallback olarak `document.execCommand('copy')` kullan |
| `app/[locale]/dashboard/deliveries/page.tsx` | 80-85 | **Client-side search + server-side pagination çelişkisi.** `filtered` dizisi API'den gelen 20 kaydı client-side'da filtreler ama `total` ve pagination API'den gelir. Arama yapıldığında sayfa 2'ye geçmek API'den farklı veri getirir. | 🟠 High | Pagination tutarsız: "Showing 1-20 of 150" ama arama sonucunda sadece 3 kayıt görünür | Arama API seviyesinde yapılmalı (query param olarak gönder), ya da client-side filtrede pagination'ı client-side hesapla |
| `app/[locale]/dashboard/logs/page.tsx` | 95-100 | **`statusCounts` sadece mevcut sayfadaki kayıtlardan hesaplanıyor.** "All: 150, Delivered: 5, Failed: 2" gibi gösteriyor ama 5 ve 2 sadece mevcut sayfadaki sayılar. | 🟠 High | Kullanıcı tüm sistemin durumunu yanlış anlar; "150 teslimattan sadece 5 başarılı" gibi yanlış bilgi | Status count'ları ayrı bir API endpoint'inden al veya "Bu sayfada" etiketi ekle |
| `app/[locale]/dashboard/page.tsx` | 260 | **`token!` non-null assertion.** Token null olabilir (auth yüklenirken) ama `!` ile zorlanmış. | 🟠 High | Auth yüklenirken crash olabilir; React render cycle'da undefined token ile API çağrısı | Guard ekle: `if (!token) return null` veya optional chaining |
| `app/[locale]/dashboard/page.tsx` | 245-249 | **Hem `Onboarding` hem `OnboardingWizard` aynı anda render ediliyor.** İkisi de `localStorage`'dan durum okuyor ve modal gösteriyor. | 🟠 High | Kullanıcıya aynı anda iki onboarding modal'ı görünebilir | Tek bir onboarding component'i kullan veya birbirini dışlayan mantık ekle |
| `lib/api.ts` | 50-65 | **401 refresh retry döngüsü.** Refresh başarılı olduğunda original isteği tekrarlıyor ama yeni token'ı saklamıyor. Refresh response'undan yeni token alınmalı. | 🟠 High | Refresh sonrası tekrarlanan istek yine 401 alabilir (token yenilenmemiş) | Refresh response'undan yeni token'ı al ve store'a kaydet |
| `app/[locale]/dashboard/settings/page.tsx` | 35-40 | **Notification preferences hardcoded.** `emailNotifs`, `failureAlerts`, `weeklyDigest` state'leri varsayılan değerlerle başlıor ama API'den yüklenmiyor. | 🟠 High | Kullanıcı tercihleri gösterilmiyor; her sayfa yenilemesinde sıfırlanır | Sayfa yüklendiğinde mevcut tercihleri API'den çek |
| `app/[locale]/dashboard/billing/page.tsx` | 105-115 | **`handleCancel` içinde nested async-await.** `getSubscription` sonucu `.then` ile `api.delete` çağrılıyor ama outer try-catch ile yakalanıyor. Hata yönetimi karmaşık. | 🟠 High | Cancel işlemi başarısız olursa kullanıcıya doğru hata gösterilemeyebilir | Flat async/await yapısına dönüştür |
| `app/[locale]/dashboard/endpoints/[id]/page.tsx` | 25-30 | **Endpoint listesinden tek endpoint bulma.** Tüm endpoint'leri çekip `find` ile arama yapılıyor — N+1 problemi yok ama gereksiz veri transferi. | 🟠 High | 100+ endpoint varsa gereksiz yere tüm liste çekilir; yavaş sayfa yükü | Dedicated GET endpoint'i ekle veya client'ta cache'le |

---

## 🟡 ORTA SEVİYELİ SORUNLAR

| Dosya | Satır | Sorun | Severity | Impact | Çözüm |
|-------|-------|-------|----------|--------|-------|
| `components/Onboarding.tsx` | 95 | **`steps` dizisi her render'da yeniden oluşturuluyor.** `useCallback` ile sarılı olmayan `steps` closure sorununa yol açabilir. | 🟡 Medium | Gereksiz re-render'lar; step geçişlerinde eski state kullanılabilir | `steps` dizisini `useMemo` ile sar |
| `components/OnboardingWizard.tsx` | 100 | **`completeStep` useCallback içinde `state.completedSteps` kullanıyor.** Dependency array'de `state.completedSteps` var ama `updateState` ile güncelleme yaparken stale closure riski. | 🟡 Medium | Hızlı step geçişlerinde son tamamlanan step kaybolabilir | Functional update kullan: `setState(prev => ...)` |
| `components/NotificationCenter.tsx` | 18-24 | **Silent failure.** `Promise.all` içinde `.catch(() => null)` var ama genel catch bloğu da boş. Kullanıcı bildirimler yüklenemediğinde hiçbir feedback almaz. | 🟡 Medium | Kullanıcı bildirimlerin yüklenemediğini anlamaz; boş liste görünür | En azından bir "Bildirimler yüklenemedi" mesajı göster |
| `components/ConfirmDialog.tsx` | 70 | **Dialog kapatıldığında body scroll restore ediliyor ama component unmount'ta edilmiyor.** Eğer dialog açıkken component unmount olursa body scroll locked kalır. | 🟡 Medium | Sayfa scroll edilemez hale gelir | Cleanup fonksiyonunda `document.body.style.overflow = ''` ekle |
| `app/[locale]/dashboard/page.tsx` | 120-135 | **`ActivityFeed` 5sn'de bir API çağrısı yapıyor.** Component unmount'ta interval temizleniyor ama bileşen görünmez olsa bile çalışmaya devam eder (tab değişikliği vs.). | 🟠 High | Gereksiz API çağrısı; rate limit riski; pil tüketimi | `document.visibilitychange` event'ini dinle, sekme görünmez olduğunda duraklat |
| `app/[locale]/dashboard/endpoints/page.tsx` | 40-50 | **Create endpoint'te double-click engeli yok.** `creating` state'i var ama buton disabled kontrolü `creating` ile yapılıyor — hızlı çift tıklamada iki istek gidebilir. | 🟡 Medium | Duplicate endpoint oluşturulabilir | `creating` true olduğunda butonu tamamen disable et (zaten yapılıyor ama optimistic update sonrası state sıfırlanmadan önce ikinci tıklama gelebilir) |
| `app/[locale]/dashboard/analytics/page.tsx` | 45-55 | **Analytics data fetch'de stale closure riski.** `loadData` useCallback içinde `token` ve `timeRange` var ama component unmount olursa state güncellenir. | 🟡 Medium | Unmount sonrası "Can't perform a React state update on an unmounted component" uyarısı | AbortController veya mounted flag kullan |
| `app/[locale]/dashboard/team/page.tsx` | 70-80 | **Role change'de owner rolü verilebilir.** `ROLE_OPTIONS = ['owner', 'admin', 'member']` ama owner rolü sadece bir kişi olabilir. UI'da owner seçilebilir. | 🟠 High | Takımda birden fazla owner olabilir; yetki çakışması | Owner seçeneğini filtrele veya sadece mevcut owner değiştirebilsin |
| `app/[locale]/dashboard/alerts/page.tsx` | 65-70 | **Threshold input'u negatif sayı kabul ediyor.** `parseInt(e.target.value) || 0` — negatif değerler mantıksız. | 🟡 Medium | "Failure rate > -10%" gibi anlamsız alert kuralı oluşturulabilir | `Math.max(0, ...)` ekle |
| `app/[locale]/dashboard/alerts/page.tsx` | 55-60 | **Create alert'te error handling yok.** `createAlert` catch bloğu boş. Kullanıcı alert oluşturulamadığında feedback almaz. | 🟡 Medium | Kullanıcı alert'in oluşturulup oluşturulmadığını bilmez | Toast ile hata göster |
| `app/[locale]/login/page.tsx` | 25-30 | **Password strength indicator'ı sadece register modunda gösteriliyor.** Login'de password alanı için hiçbir feedback yok. Bu iyi bir UX kararı ama password strength bar'ı register'da da zayıf: `score <= 2` = Weak ama 2/6 bile "Medium" yapabilir. | 🟡 Medium | Kullanıcı "Medium" güçlüklü şifreyle kayıt olabilir ama bu aslında zayıf olabilir | Eşikleri ayarla: score <= 3 = Weak, 4-5 = Medium, 6 = Strong |
| `components/StatusBadge.tsx` | 80-85 | **Bilinmeyen status için fallback `statusStyles.pending` kullanılıyor.** Ama status string'i doğrudan render ediliyor — "unknown_status" gibi şeyler görünebilir. | 🟡 Medium | Bilinmeyen status'lar için tutarsız UI | Bilinmeyen status için özel bir fallback style tanımla |
| `lib/store.tsx` | 45-55 | **`/auth/me` response yapısı ile `User` interface uyuşmazlığı.** API `data.id, data.email` döndürürken login/register `data.customer.id` bekliyor. Farklı response formatları. | 🟠 High | Login sonrası user bilgileri yanlış parse edilebilir | API response formatını standardize et veya her iki format için de handling ekle |
| `lib/api.ts` | 35-40 | **`AbortController` her çağrıda oluşturuluyor ama caller'ın signal'ı ile birleştiriliyor.** Eğer caller signal abort edilirse, hem caller hem internal controller abort olur ama `finally` bloğu sadece internal timeout'u temizler. | 🟠 High | Race condition: caller abort ettiğinde timeout hala çalışıyor olabilir | Tek bir controller kullan veya caller signal'ını doğrudan fetch'e geçir |
| `components/ThemeProvider.tsx` | 20-25 | **SSR/Client hydration mismatch.** `useState('light')` ile başlıyor ama client'ta `prefers-color-scheme: dark` olabilir. İlk render'da yanlış tema gösterilir (flash). | 🟡 Medium | Sayfa yüklendiğinde kısa bir light-mode flash'ı | Inline script ile `<html>` class'ını SSR'da ayarla |

---

## 🔵 DÜŞÜK SEVİYELİ SORUNLAR

| Dosya | Satır | Sorun | Severity | Impact | Çözüm |
|-------|-------|-------|----------|--------|-------|
| `components/Footer.tsx` | 1-5 | **`compareLinks` ve `resourceLinks` i18n desteklenmiyor.** Sabit İngilizce string'ler. | 🔵 Low | Çok dilli footer'da bazı linkler her zaman İngilizce | `t()` ile çeviri kullan |
| `app/[locale]/dashboard/layout.tsx` | 40-50 | **Locale prefix regex'i sadece belirli locale'leri tanıyor.** Yeni locale eklerken regex güncellenmeli. | 🔵 Low | Yeni locale eklendiğinde navigation matching kırılır | Dinamik locale listesi kullan |
| `components/LanguageSwitcher.tsx` | 25-30 | **`handleClickOutside` her mount'ta ekleniyor.** `useEffect` dependency array'i boş ama ref değişirse sorun olmaz — bu iyi. Ancak dropdown açıkken keyboard navigation yok. | 🔵 Low | Klavye ile dil değiştirilemez | Arrow key support ekle |
| `app/[locale]/dashboard/playground/page.tsx` | 45-50 | **`_showAiGenerator` state'i tanımlanmış ama hiç kullanılmıyor (prefixed with `_`).** Dead code. | 🔵 Low | Gereksiz state, kod kalitesi | Kaldır veya kullan |
| `components/OnboardingWizard.tsx` | 150-160 | **Endpoint URL validation sadece `type="url"` ile yapılıyor.** Özel karakterler veya SQL injection attempt'leri client-side engellenmez. | 🔵 Low | Server-side validation yoksa XSS riski | Server-side validation'a güven, client'ta da minLength check ekle |
| `app/[locale]/dashboard/deliveries/[id]/page.tsx` | 180-190 | **`attempts.sort()` doğrudan mutate ediyor.** React'te state array'ini mutate etmek anti-pattern. | 🔵 Low | Re-render tetiklenmeyebilir; garip UI davranışı | `[...attempts].sort(...)` ile kopyala-sonra sırala |
| `app/[locale]/dashboard/billing/page.tsx` | 200-210 | **Checkout URL validation sadece hostname kontrolü yapıyor.** `trustedHosts.some(h => url.hostname === h)` — subdomain bypass mümkün. | 🔵 Low | Güvenli olmayan bir URL'e redirect | `url.hostname.endsWith(h)` kontrolünü daha katı yap |
| `lib/redis.ts` | 35-40 | **In-memory store'da TTL cleanup yok.** Expired entry'ler sadece okunmaya çalışıldığında temizlenir. | 🔵 Low | Memory leak: expired entry'ler birikir | Periyodik cleanup ekle veya `setTimeout` ile auto-delete |
| `app/[locale]/dashboard/inbound/page.tsx` | 25 | **`_loading` state'i underscore prefix ile destructure edilmiş ama hiç kullanılmıyor.** Dead code. | 🔵 Low | Gereksiz state | Kaldır |
| `components/EmptyState.tsx` | 5-10 | **`action` prop'u opsiyonel ama tıklandığında hiçbir feedback yok.** Button click handler'ı var ama loading state'i yok. | 🔵 Low | Hızlı çift tıklamada duplicate action | Loading state ekle |

---

## MANTIK HATALARI ANALİZİ

### 1. Stale Closure Sorunları
- **`OnboardingWizard.tsx`**: `completeStep` fonksiyonu `state.completedSteps`'i closure olarak yakalıyor. Hızlı step geçişlerinde eski state kullanılabilir.
- **`NotificationCenter.tsx`**: `fetchNotifications` useCallback içinde `token` var, bu iyi. Ama `handleMarkAsRead` closure olarak `token`'ı yakalıyor — token değişirse eski token ile istek atar.

### 2. Unmount Sonrası State Güncelleme
- **`EmailVerificationBanner.tsx`**: useEffect içinde fetch var ama cleanup/abort yok. Component unmount olduktan sonra `setVerified` çağrılabilir.
- **`dashboard/page.tsx`**: `load` ve `loadAnalytics` fonksiyonları async ama unmount kontrolü yok.
- **`analytics/page.tsx`**: Aynı sorun — `loadData` unmount sonrası state güncelleyebilir.

### 3. Conditional Rendering Sorunları
- **`AuthGuard.tsx`**: `isLoading` true iken spinner gösteriyor, `!token` iken başka spinner gösteriyor. Bu iyi bir UX ama ikinci spinner gereksiz — redirect zaten useEffect ile yapılıyor.
- **`Onboarding.tsx`**: `visible` state'i useEffect ile ayarlanıyor ama ilk render'da `false` — SSR'da onboarding hiç gösterilmeyecek.

### 4. Pagination Edge Case'leri
- **`deliveries/page.tsx`**: `totalPages = Math.ceil(total / perPage)` — `total = 0` ise `totalPages = 0` ama `page = 1`. "Page 1 of 0" gösterilir.
- **`notifications/page.tsx`**: Aynı sorun.
- **`search/page.tsx`**: `Math.ceil(results.total / results.per_page)` — 0 sonuç için "Page 1 of 0".

### 5. Search Edge Case'leri
- **`deliveries/page.tsx`**: Client-side search special character handling yok. Regex injection riski düşük ama `event?.toLowerCase().includes(search.toLowerCase())` özel karakterleri düzgün handle eder.
- **`search/page.tsx`**: Server-side search ama query param encoding yok — özel karakterler URL'de sorun yaratabilir.

### 6. Null/Undefined Handling
- **`dashboard/page.tsx`**: `stats?.total_deliveries ?? 0` — iyi, nullish coalescing kullanılmış.
- **`deliveries/[id]/page.tsx`**: `delivery?.event || '—'` — iyi.
- **`StatusBadge.tsx`**: `statusStyles[status] || statusStyles.pending` — iyi fallback.

---

## DASHBOARD SPECIFIC SORUNLAR

| Sorun | Durum | Detay |
|-------|-------|-------|
| Real-time data güncelleme | ⚠️ Kısmen doğru | `ActivityFeed` 5sn polling yapıyor ama tab değişikliğinde durmuyor. `NotificationCenter` 30sn polling yapıyor — iyi. |
| Chart data processing | ✅ Doğru | Recharts kullanılıyor, data mapping doğru. |
| Table sort/filter/pagination | ⚠️ Sorunlu | Client-side search + server-side pagination çelişkisi (yukarıda belirtildi). |
| Modal state yönetimi | ✅ Genelde iyi | ConfirmDialog, delete modals — iyi pattern. |
| Tab state korunuyor | ❌ Korunmuyor | Navigation'da tab state kayboluyor (page-based routing). |
| Breadcrumb | ❌ Yok | Hiçbir sayfada breadcrumb yok. |
| Back button davranışı | ⚠️ Kısmen | `router.push` ile manuel navigation var ama browser back button'u ile uyumlu. |
| Deep link desteği | ✅ Var | URL-based routing ile çalışıyor. |
| Keyboard navigation | ⚠️ Kısmen | ConfirmDialog'da focus trap var ama genel dashboard'da yok. |
| Drag & drop | ❌ Yok | Bulk selection var ama drag & drop yok. |

---

## FORM SORUNLARI ÖZETİ

| Sorun | Login | Settings | Endpoints Create | Onboarding |
|-------|-------|----------|-----------------|------------|
| Double-click engeli | ✅ `loading` state | ✅ `profileSaving` | ⚠️ `creating` ama race condition mümkün | ✅ `creating` |
| Form reset | ✅ Mode değişince | ❌ Yok | ✅ Cancel'da reset | ✅ Step değişince |
| Validation mesajları | ✅ Error banner | ✅ Inline error | ✅ Error banner | ✅ Error banner |
| Required field | ✅ HTML required | ✅ minLength=8 | ✅ type="url" required | ✅ URL required |
| Max length | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Yok |
| Email validation | ✅ type="email" | ✅ type="email" | N/A | N/A |
| Password strength | ✅ Visual indicator | ❌ Yok | N/A | N/A |
| Confirm password | ❌ Yok (login) | ✅ Eşleşme kontrolü | N/A | N/A |
| Dirty state tracking | ❌ Yok | ❌ Yok | ❌ Yok | ❌ Yok |

---

## ÇÖZÜM ÖNERİLERİ (Öncelik Sırasıyla)

### Acil (P0)
1. **`api-keys/page.tsx`**: `credentials: 'include'`'ı fetch options'a taşı
2. **`playground/page.tsx`**: Hardcoded token'ı `useAuth()`'tan gelen token ile değiştir
3. **`store.tsx`**: Token state'ini düzelt — ya gerçek token kullan ya da Authorization header'ı ekleme
4. **`search/page.tsx`**: Debounce ekle (300-500ms)

### Yüksek (P1)
5. **`Toast.tsx`**: Dismiss butonu + `aria-live` + max stack limit
6. **`EmailVerificationBanner.tsx`**: Hata durumunda verified=true yapma
7. **`deliveries/page.tsx`**: Client-side search + pagination çelişkisini çöz
8. **`logs/page.tsx`**: Status count'ları API'den al
9. **`health/page.tsx`**: Token'ı kullan
10. **`CodeBlock.tsx`**: Clipboard API error handling

### Orta (P2)
11. **Unmount guard**: Tüm async fetch'lerde AbortController veya mounted flag
12. **`ThemeProvider.tsx`**: SSR hydration mismatch'ı çöz
13. **`Onboarding.tsx` + `OnboardingWizard.tsx`**: Tek component'e dönüştür
14. **Form dirty state tracking**: Değişiklik uyarısı ekle
15. **Max length validation**: Tüm input'lara maxLength ekle
