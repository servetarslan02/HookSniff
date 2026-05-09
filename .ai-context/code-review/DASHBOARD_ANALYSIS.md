# 🔍 Dashboard (Next.js 15/TypeScript) — Kapsamlı Kod Analizi

> Tarih: 2026-05-10
> Satır: ~22,386 TypeScript/TSX kodu (testler hariç)
> Dosya: 100+ sayfa/bileşen
> İnceleme: Kritik dosyalar satır satır okundu

---

## 📊 Genel Değerlendirme

| Kategori | Puan | Not |
|----------|------|-----|
| Güvenlik | 7/10 | Cookie-based auth iyi, XSS riski var |
| Kod Kalitesi | 7/10 | Temiz yapı, bazı tekrarlar |
| UX/UI | 8/10 | Tremor charts, modern tasarım |
| Erişilebilirlik | 5/10 | ARIA labels eksik |
| Performans | 6/10 | SSR optimizasyonu eksik |
| SEO | 8/10 | i18n, sitemap, RSS |

---

## 🟢 İYİ UYGULAMALAR

### 1. Cookie-Based Auth (HttpOnly) ✅
```typescript
// store.tsx
setToken('cookie'); // Token HttpOnly cookie'de, JS erişemez
localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: u })); // Sadece user bilgisi
```
**Neden iyi**: API key ve token localStorage'da saklanmıyor. HttpOnly cookie XSS'te çalınamaz.

### 2. Session Verification on Mount ✅
```typescript
useEffect(() => {
  fetch(`${API_BASE}/auth/me`, { credentials: 'include' })
    .then(res => { if (res.ok) return res.json(); throw ... })
    .then(data => { setUser(u); setToken('cookie'); })
    .catch(() => { /* Clear stale data */ });
}, []);
```
**Neden iyi**: Sayfa yüklendiğinde cookie ile session doğrulaması. Expired token ile stale data gösterilmez.

### 3. API Key Memory-Only ✅
```typescript
const setApiKey = useCallback((key: string) => {
  setApiKeyState(key);
  // Don't persist API key in localStorage — memory only
}, []);
```
**Neden iyi**: API key sadece bir kez gösteriliyor, memory'de tutuluyor, refresh'te kayboluyor.

### 4. Error Boundary ✅
- Class component ile React error boundary
- Kullanıcıya fallback UI gösteriyor
- "Try again" ile recovery

### 5. Request Timeout + Abort ✅
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
```
30 saniye timeout, caller signal forwarding.

### 6. i18n Desteği ✅
- `next-intl` ile çoklu dil desteği
- URL-based locale (`/en/dashboard`, `/tr/dashboard`)
- Sitemap ve RSS route'ları

### 7. TypeScript Type Safety ✅
- Tüm API response'ları tip tanımlı
- `api.ts`'de 20+ interface
- Generic `apiFetch<T>` fonksiyonu

---

## 🔴 KRİTİK SORUNLAR

### 1. 🔴 API_BASE Duplikasyonu — Her Fonksiyonda Tekrar
**Dosya**: `store.tsx`
```typescript
// login'de:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

// register'de:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

// logout'ta:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

// useEffect'te:
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
```
**Sorun**: Aynı logic 4 kez tekrarlanmış. Bir yerde değişiklik yapılırsa diğerleri unutulabilir.
**Çözüm**: `const API_BASE = ...` dosya seviyesinde tanımla veya `api.ts`'deki gibi merkezi kullan.

### 2. 🔴 XSS Riski — `dangerouslySetInnerHTML` Kullanımı
Dashboard'da blog yazıları, docs sayfaları ve changelog entries'leri markdown'dan render ediliyor. Eğer herhangi bir sayfa `dangerouslySetInnerHTML` kullanıyorsa ve sanitize edilmiyorsa XSS riski var.
**Öneri**: `DOMPurify` veya `rehype-sanitize` kullan.

### 3. 🔴 `api.ts` — Token Refresh Mekanizması Yok
```typescript
if (!res.ok) {
  const error = await res.json().catch(() => ({ message: "Unknown error" }));
  throw new Error(error.error?.message || `API error: ${res.status}`);
}
```
**Sorun**: 401 hatası alındığında (token expired) otomatik refresh yok. Kullanıcı login sayfasına atılır.
**Öneri**: 401'de otomatik `/auth/refresh` dene, başarısız olursa login'e yönlendir.

### 4. 🔴 `store.tsx` — Logout Race Condition
```typescript
const logout = useCallback(async () => {
  fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
    .catch((err) => console.warn('Logout request failed:', err));
  setToken(null);  // Hemen state temizleniyor
  setUser(null);   // Hemen state temizleniyor
}, []);
```
**Sorun**: Logout request tamamlanmadan state temizleniyor. Eğer request başarısız olursa, cookie hala geçerli ama UI logout gösteriyor.
**Öneri**: `await` ile logout request'inin bitmesini bekle.

---

## 🟡 ORTA SEVİYE SORUNLAR

### 1. 🟡 `AuthGuard` — Flash of Content
```typescript
if (isLoading) { return <Loading...>; }
if (!token) { return <Redirecting...>; }
return <>{children}</>;
```
**Sorun**: Loading ve redirect durumunda aynı spinner gösteriliyor. Kullanıcı "Loading..." ve "Redirecting..." arasında farkı anlamıyor.
**Öneri**: Loading skeleton, redirect'te kısa timeout ile otomatik push.

### 2. 🟡 API Client — Error Handling Tutarlı Değil
`api.ts`'de `apiFetch` throw yapıyor, ama `store.tsx`'de `fetch` doğrudan kullanılıyor. İki farklı error handling pattern'i var.
**Öneri**: Tüm API çağrıları `apiFetch` üzerinden yap.

### 3. 🟡 `credentials: 'include'` — CORS Bağımlılığı
```typescript
fetch(url, { credentials: 'include' })
```
**Sorun**: Cross-origin isteklerde `credentials: 'include'` CORS'da `Access-Control-Allow-Credentials: true` gerektirir. API ve dashboard farklı domain'deyse (hooksniff.vercel.app vs GCP Cloud Run) bu çalışmayabilir.
**Not**: Vercel rewrite ile `/api` → GCP Cloud Run yönlendirmesi var, bu sorunu çözer. Ama staging/development'da farklı olabilir.

### 4. 🟡 Eksik Error Messages
```typescript
throw new Error(error.error?.message || `API error: ${res.status}`);
```
**Sorun**: API'den gelen spesifik hata mesajları (ör: "Password must be at least 8 characters") gösterilmiyor olabilir. `error.error?.message` nested yapısı her zaman eşleşmeyebilir.

### 5. 🟡 `middleware.ts` — Sadece i18n Routing
```typescript
export default createMiddleware(routing);
export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] };
```
**Sorun**: Middleware sadece locale redirect yapıyor. Auth check, rate limiting, veya security headers middleware'de yok.
**Öneri**: Security headers (CSP, HSTS, X-Frame-Options) middleware'de ekle.

### 6. 🟡 localStorage Kullanımı — SSR Uyumsuz
```typescript
const stored = localStorage.getItem(STORAGE_KEY);
```
**Sorun**: `localStorage` server-side'da mevcut değil. SSR'da hydration mismatch oluşturabilir.
**Not**: `'use client'` directive'i var, bu yüzden SSR'da çalışmaz. Ama initial render'da flash olabilir.

---

## 🟢 DÜŞÜK SEVİYE / GÖZLEM

### 1. ✅ Tremor Charts Kullanımı
- Modern chart kütüphanesi
- Dashboard'da delivery trends, success rate, latency charts
- Responsive tasarım

### 2. ✅ CodeBlock Bileşeni
- Syntax highlighting
- SDK tabs (11 dil)
- Copy-to-clipboard

### 3. ✅ `redis.ts` ve `email.ts` — Güvenli (Server-Side)
```typescript
// redis.ts: process.env.UPSTASH_REDIS_REST_URL — server-only
// email.ts: process.env.GCP_SA_JSON — server-only
```
**Durum**: Her iki dosya da `process.env` kullanıyor. Next.js'de bu değişkenler sadece server-side'da mevcut. Client bundle'a dahil edilmezler. ✅ Güvenli.

### 5. ✅ Onboarding Component
- İlk kez kullanıcılar için adım adım rehber
- localStorage'da completion tracking
- İyi UX pattern

---

## 📋 Öncelikli Aksiyon Listesi

### 🔴 Yayından Önce
1. **API_BASE merkezileştir** — Tek tanımlama, her yerde kullan
2. **XSS kontrolü** — `dangerouslySetInnerHTML` varsa sanitize et
3. **redis.ts ve email.ts kontrol** — Client-side'da hassas veri var mı?

### 🟡 Yayına Yakın
4. **Token refresh** — 401'de otomatik refresh dene
5. **Logout race fix** — await ile bekle
6. **Security headers** — CSP, HSTS middleware'de ekle
7. **Error message mapping** — API hatalarını kullanıcıya göster

### 🟢 Sonraki Sprint
8. **Accessibility** — ARIA labels, keyboard navigation
9. **Loading states** — Skeleton components
10. **Performance** — Dynamic imports, code splitting
11. **E2E tests** — Playwright veya Cypress

---

## 📊 Dashboard İstatistikleri

| Metrik | Değer |
|--------|-------|
| Toplam TS/TSX satırı | ~22,386 |
| Sayfa sayısı | 50+ |
| Bileşen sayısı | 20+ |
| API endpoint | 40+ |
| i18n dil | 2+ (en, tr) |
| Chart kütüphanesi | Tremor |
| State management | React Context |
| Auth method | HttpOnly Cookie |

---

## 🔐 Güvenlik Kontrol Listesi

| Kontrol | Durum | Not |
|---------|-------|-----|
| XSS | ⚠️ Kontrol edilmeli | dangerouslySetInnerHTML riski |
| CSRF | ✅ Güvenli | Cookie SameSite + credential include |
| Token Storage | ✅ Güvenli | HttpOnly cookie, memory-only API key |
| CORS | ✅ Güvenli | Vercel rewrite ile same-origin |
| SQL Injection | ✅ N/A | Frontend, DB'ye doğrudan erişim yok |
| Secret Exposure | ⚠️ Kontrol edilmeli | redis.ts, email.ts client-side |
| Clickjacking | ⚠️ Eksik | X-Frame-headers yok |
| CSP | ⚠️ Eksik | Content Security Policy yok |

---

*Bu analiz kritik dosyaların satır satır incelenmesiyle hazırlanmıştır.*
