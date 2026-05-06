# 🐛 10 Kod Hatası — Sub-agent Fix Sonrası Tespit

**Tarih:** 2026-05-06
**Durum:** Düzeltiliyor

---

## 🔴 BUG — Hatalı Kod

### 1. `init_tracing` — log mesajları kayboluyor
**Dosya:** `api/src/main.rs` ve `worker/src/main.rs`
`tracing::info!` çağrısı `.init()`'den önce yapılıyor, mesajlar asla görünmez.

### 2. Worker `ensure_queue_table` kaldırıldı ama race condition var
**Dosya:** `worker/src/main.rs`
Worker API'den önce başlarsa `webhook_queue` tablosu yokken crash olur.

### 3. `validate_secret` çok agresif
**Dosya:** `api/src/config.rs`
`"secret"` pattern'i tüm secret'ları reddeder — legitimate secret'lar bile.

### 4. Dashboard rewrite — production'da localhost
**Dosya:** `dashboard/next.config.js`
`destination: 'http://localhost:3000/v1/:path*'` hardcoded.

### 5. `is_production()` her seferinde env okuyor
**Dosya:** `api/src/config.rs`
Config zaten env'i parse ediyor ama `is_production()` tekrar okuyor.

## ⚠️ EKSİK — İşlevsiz Kod

### 6. Stripe invoice handler'ları boş
**Dosya:** `api/src/billing/stripe.rs`
Ödeme başarısız olduğunda sadece log, DB'ye yazmıyor, kullanıcıya bildirim yok.

### 7. Plan cache hiçbir zaman set edilmiyor
**Dosya:** `api/src/rate_limit.rs`
`set_plan()` var ama çağrılmıyor. Rate limiter her zaman Free plan uyguluyor.

### 8. `Plan::max_requests_per_minute()` kontrol
**Dosya:** `api/src/rate_limit.rs`
Bu metod tanımlı mı kontrol edilmedi.

### 9. Dashboard API URL production'da undefined
**Dosya:** `dashboard/src/lib/api.ts`
`NEXT_PUBLIC_API_URL` yoksa fallback yok, undefined ile istek atar.

### 10. `stripe_webhook_secret` boşsa bypass
**Dosya:** `api/src/routes/billing.rs`
Secret yoksa "skipping verification" diyor ama aslında hata alacak.
