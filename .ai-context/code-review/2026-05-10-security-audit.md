# CODE REVIEW — 2026-05-10 07:59 GMT+8

## 🔴 Kritik (Yapılacak)

### 1. SSO client_secret şifreleme
- **Dosya:** `api/src/routes/sso.rs:147`
- **Sorun:** Sadece base64 encode, AES-GCM gerekli
- **Fix:** `aes-gcm` crate ekle, encrypt/decrypt fonksiyonları yaz

### 2. Dashboard API tutarsızlığı
- **Dosya:** 12 dashboard sayfası doğrudan `fetch()` kullanıyor
- **Sorun:** `apiFetch` yerine `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'` kullanıyor
- **Etkilenen sayfalar:**
  - `inbound/page.tsx`
  - `billing/page.tsx`
  - `playground/page.tsx`
  - `webhook-builder/page.tsx`
  - `endpoints/[id]/page.tsx`
  - `alerts/page.tsx`
  - `transforms/page.tsx`
  - `settings/page.tsx`
  - `api-keys/page.tsx`
  - `health/page.tsx`
  - `search/page.tsx`
- **Fix:** Tüm fetch() çağrılarını `apiFetch` ile değiştir

### 3. Domain validasyonu — SSRF riski
- **Dosya:** `api/src/routes/custom_domains.rs:244`
- **Sorun:** `dig`/`nslookup` komutlarına domain doğrudan geçiyor
- **Fix:** Domain regex ile sıkılaştırıldı ✅ (bu oturumda), ama SSRF için IP resolve kontrolü ekle

## 🟡 Orta Seviye

### 4. Console.log kalıntıları (Dashboard)
- `dashboard/src/lib/redis.ts:13` — `console.warn`
- `dashboard/src/lib/store.tsx:123` — `console.warn`
- `dashboard/src/lib/email.ts:182,189` — `console.error`
- **Fix:** Production'da kaldır veya debug moduna bağla

### 5. Blog dangerouslySetInnerHTML
- **Dosya:** `dashboard/src/app/[locale]/blog/[slug]/page.tsx:1764`
- **Sorun:** `tokenizeCode()` HTML escape yapıyor ama yeterince güvenli değil
- **Fix:** DOMPurify ekle veya statik content için güvenli hale getir

### 6. Cookie SameSite=None
- **Dosya:** `api/src/middleware/mod.rs:236`
- **Sorun:** Cross-origin gerekli ama CSRF riski artırıyor
- **Fix:** Mümkünse `SameSite=Lax` dene, olmuyorsa None kalsın

### 7. OAuth error URL sızıntısı (düzeltildi ✅)
- `details` parametresi kaldırıldı ✅

## ✅ Bu Oturumda Düzeltildi

1. OAuth CSRF koruması (state cookie)
2. OAuth refresh token (30 gün)
3. Custom CSS XSS (pattern engelleme)
4. Redis TLS (tokio-rustls-comp)
5. Google OAuth env var'ları
6. Domain validasyonu (regex)
7. IP spoofing (X-Real-IP öncelikli)
8. Error sızıntısı kaldırıldı

## 📊 Test Durumu
- Backend: 31/31 ✅
- Dashboard build: 0 hata ✅
- Cloud Run: revision 00051-hvj live ✅

## 🎯 Sonraki Oturumda
1. SSO AES-GCM şifreleme
2. Dashboard fetch() → apiFetch refactor
3. Gerçek kullanıcı akışı test et (register → login → endpoint → webhook → delivery)
