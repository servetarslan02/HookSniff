# 2026-05-20 — Bug Fixes: Billing, Devices, Webhook Replay

## Oturum: 18:23–18:55 GMT+8

### Kullanıcı: Servet Arslan (servetarslan02)

---

## Yapılan İşler

### 1. Billing Portal 404 Fix
- **Sorun:** "Kart değiştir" butonu 404 veriyordu
- **Neden:** `polar_customer_id` boşken Polar API'ye boş string gönderiliyordu, fallback URL `localhost:3001` idi
- **Düzeltme:** `api/src/billing/mod.rs` — boş polar_customer_id'de billing sayfasına yönlendirme, fallback URL `hooksniff.vercel.app`
- **Commit:** `73f7daa9`

### 2. Edge Proxy Dev URL Fix
- **Sorun:** Dashboard'da `servetarslan92.werker.dev` görünüyordu
- **Neden:** `API_BASE` Cloudflare Workers dev URL'ini kullanıyordu
- **Düzeltme:** `dashboard/src/lib/api.ts` + `dashboard/next.config.js` — Cloud Run production URL'ine değiştirildi
- **Commit:** `9c3c3656`

### 3. Delivery Model Missing Columns
- **Sorun:** Inbound webhook DATABASE_ERROR (500)
- **Neden:** DB'de `custom_headers` ve diğer kolonlar vardı ama Rust struct'ta yoktu
- **Düzeltme:** `api/src/models/delivery.rs` — 7 eksik kolon eklendi (event, processed_at, idempotency_key, source_ip, request_headers, application_id, payload_hash, custom_headers)
- **Commit:** `188ad49f`, `61d16ed6`

### 4. Webhook Replay 500 Fix
- **Sorun:** Webhook replay 500 Internal Server Error
- **Neden:** `SELECT *` kullanıyordu, struct'ta olmayan DB kolonları mapping hatası
- **Düzeltme:** `api/src/routes/webhooks.rs` + `api/src/routes/auth.rs` — tüm `SELECT *` explicit column list'e çevrildi
- **Commit:** `61d16ed6`

### 5. Devices 500 Fix
- **Sorun:** Devices endpoint 500 DATABASE_ERROR
- **Neden:** `last_used_at` kolonu struct'ta vardı ama DB'de yoktu
- **Düzeltme:** `api/src/routes/devices.rs` — olmayan kolon kaldırıldı
- **Commit:** `61d16ed6`

---

## Test Sonuçları (50+ endpoint)

### ✅ Çalışan (45+)
- Health, Auth, Endpoints, Webhooks (send+list), API Keys, Applications
- Subscription, Usage, Invoices, Billing Settings, Billing Portal
- Notifications, Analytics, Search, Templates, Teams, Broadcasts
- Audit Log, SSO Config, Custom Domains, Rate Limits, Service Tokens
- Outbound IPs, Plans, Feature Flags, Status, Endpoint Health, Stats
- Transforms, OAuth Providers, Playground, Alerts, Embed, Simulator (POST)
- Endpoint Secret Rotate, Inbound Configs

### ❌ Düzeltildi (deploy bekliyor)
- Webhook Replay → fixed
- Devices → fixed
- Inbound Webhook → fixed (önceki commit)

### ⏳ Cloud Build Deploy Gerekiyor
Tüm fix'ler push edildi ama Cloud Run'da aktif olması için Cloud Build tetiklenmeli.

---

## Kritik Notlar
- `device_tokens` tablosunda `last_used_at` kolonu yok — migration eksik olabilir
- `deliveries` tablosunda struct'ta olmayan birçok kolon var (manuel eklenmiş)
- `SELECT *` kullanmaktan kaçın — explicit column list daha güvenli
- Neon DB connection string bu oturumda paylaşıldı

## Sıradaki
- Cloud Build deploy (tüm fix'ler için)
- `device_tokens.last_used_at` migration oluştur
- P2 kalan sorunlar
