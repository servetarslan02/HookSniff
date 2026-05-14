# 🔧 Admin Panel Upgrade Plan — Detaylı Uygulama Rehberi

> **Tarih:** 2026-05-15
> **Durum:** PLANLANAN — uygulanmadı
> **Tahmini süre:** 3-4 oturum (1'er saat)

---

## 📌 Bu Dosya Neyi Anlatıyor?

HookSniff admin paneli şu an sadece "gözlüyor" — müşteri destek veremiyor, müdahale edemiyor.
Bu plan, admin panelini tam bir "operasyon merkezi" haline getirmeyi anlatıyor.

**Referanslar:**
- **Stripe Dashboard** — Admin olarak müşteri hesabını görme, refund, plan değiştirme
- **Svix Application Portal** — Webhook delivery izleme, debug, retry
- **Retool** — Internal admin panel best practices: customer lookup, refunds, feature flags
- **Refine.dev** — "Admin panels are action-oriented, not just read-only"

---

## 1. Mevcut Durum

### Admin Panel (7 sayfa)
```
/admin                → Overview (istatistikler)
/admin/users          → Kullanıcı listesi (ban, plan değiştir, impersonate)
/admin/users/[id]     → Kullanıcı detayı
/admin/revenue        → Gelir grafikleri
/admin/feature-flags  → Feature flag yönetimi
/admin/system         → Sistem sağlık durumu
/admin/settings       → Platform ayarları
/admin/activity       → Audit log
```

### Admin API (23 endpoint)
```
GET    /admin/stats                    → Sistem istatistikleri
GET    /admin/users                    → Kullanıcı listesi
GET    /admin/users/export             → CSV export
GET    /admin/users/{id}               → Kullanıcı detayı
PUT    /admin/users/{id}/plan          → Plan değiştir
GET    /admin/users/{id}/plan-history  → Plan geçmişi
POST   /admin/users/{id}/send-email    → Email gönder
PUT    /admin/users/{id}/status        → Ban/unban
POST   /admin/users/{id}/impersonate   → Impersonate
GET    /admin/users/{id}/analytics     → Kullanıcı analitik
GET    /admin/revenue                  → Gelir raporu
GET    /admin/revenue/export           → CSV export
GET    /admin/churn                    → Churn raporu
GET    /admin/audit-logs               → Audit log
POST   /admin/deliveries/{id}/replay   → Delivery replay
POST   /admin/test-webhook             → Test webhook
POST   /admin/sdk-update               → SDK güncelleme bildirimi
GET    /admin/settings                 → Platform ayarları
PUT    /admin/settings                 → Platform ayarları güncelle
GET    /admin/alerts                   → Alert listesi
POST   /admin/alerts                   → Alert oluştur
PUT    /admin/alerts/{id}              → Alert güncelle
DELETE /admin/alerts/{id}              → Alert sil
```

### Eksikler
- ❌ Müşterinin webhook'larını göremiyorum
- ❌ Müşterinin endpoint'lerini göremiyorum
- ❌ Müşterinin API key'lerini göremiyorum
- ❌ Sistem geneli failed delivery'leri göremiyorum
- ❌ Rate limit ihlali göremiyorum
- ❌ Kullanıcı bazlı API usage göremiyorum
- ❌ İade/refund yapamıyorum
- ❌ Bulk email gönderemiyorum
- ❌ GDPR veri dışa aktarma/silme yapamıyorum

---

## 2. Rakip Analizi — Diğer Admin Panelleri Ne Yapıyor?

### Stripe Dashboard (Admin Perspective)
- ✅ Customer lookup (email, ID, metadata search)
- ✅ View customer's payments, subscriptions, invoices
- ✅ Issue refunds (full/partial)
- ✅ Manual subscription changes
- ✅ View customer's API keys (masked)
- ✅ Send emails to customer
- ✅ View customer's webhook endpoints
- ✅ View payment disputes/chargebacks
- ✅ Export data (CSV, JSON)

### Svix (Webhook Platform)
- ✅ Application portal (customer self-service)
- ✅ Delivery monitoring per endpoint
- ✅ Debug failed deliveries
- ✅ Retry/replay messages
- ✅ Event filtering per endpoint
- ✅ Payload transformation
- ✅ Rate limiting per endpoint

### Retool (Internal Tool Builder)
- ✅ Customer lookup by any field
- ✅ One-click refund button
- ✅ Feature flag toggles
- ✅ Audit log for all admin actions
- ✅ Role-based access (support, ops, admin)

---

## 3. Yeni Admin Panel Yapısı

### 3.1 Sidebar (Güncellenmiş)

```
📊 Overview
👥 Users
💰 Revenue
🖥️ System
🚩 Feature Flags
⚙️ Settings
📋 Activity Log
```

### 3.2 Detaylı Sayfa İçerikleri

#### 📊 Overview (`/admin`)
**Mevcut:** İstatistikler, son aktivite
**Eklenecek:**
- Son 24 saatteki failed delivery sayısı
- Rate limit ihlali sayısı
- Sistem geneli API response time
- Aktif incident/alert sayısı

#### 👥 Users (`/admin/users`)
**Mevcut:** Kullanıcı listesi, ban, plan değiştir, impersonate
**Eklenecek:**

**Kullanıcı Detay Sayfası (`/admin/users/[id]`):**

| Sekme | İçerik | Yeni mi? |
|-------|--------|----------|
| Overview | Profil, plan, kullanım istatistikleri | Mevcut |
| **Endpoints** | Kullanıcının tüm endpoint'leri, URL'ler, aktif/pasif durumu | **YENİ** |
| **Webhooks** | Kullanıcının tüm delivery'leri, filtreleme, arama | **YENİ** |
| **API Keys** | Kullanıcının API key'leri (maskelenmiş), oluşturma tarihi | **YENİ** |
| **Applications** | Kullanıcının uygulamaları | **YENİ** |
| **Usage** | API kullanım istatistikleri, grafikler | **YENİ** |
| Plan History | Plan değişiklik geçmişi | Mevcut |
| **Billing** | Fatura geçmişi, ödeme durumu | **YENİ** |
| **Actions** | Email gönder, refund, hesap silme | **YENİ** |

#### 💰 Revenue (`/admin/revenue`)
**Mevcut:** Aylık gelir, plan bazlı gelir, churn
**Eklenecek:**
- Refund geçmişi
- Fatura detayları (tek tek inceleme)

#### 🖥️ System (`/admin/system`)
**Mevcut:** DB, Redis, API, queue sağlık durumu
**Eklenecek:**
- **Global Failed Deliveries** — Tüm kullanıcıların başarısız delivery'leri
- **Rate Limit Violations** — Son ihlaller
- **API Latency** — Endpoint bazlı response time
- **Deploy History** — Son deploy'lar, versiyon

#### 🚩 Feature Flags (`/admin/feature-flags`)
**Mevcut:** CRUD — değişiklik yok

#### ⚙️ Settings (`/admin/settings`)
**Mevcut:** Platform ayarları
**Eklenecek:**
- **Bulk Email** — Toplu email gönderme
- **Maintenance Mode** — Bakım modu açma/kapama

#### 📋 Activity Log (`/admin/activity`)
**Mevcut:** Audit log — değişiklik yok

---

## 4. Yeni API Endpoint'leri

### 4.1 Kullanıcı Kaynakları (Admin → User)

```rust
// api/src/routes/admin.rs — YENİ endpoint'ler

// Kullanıcının endpoint'lerini listele
GET /admin/users/{id}/endpoints
Response: Vec<EndpointInfo> {
    id, url, description, is_active, created_at,
    last_delivery_at, success_rate, total_deliveries
}

// Kullanıcının webhook'larını listele
GET /admin/users/{id}/webhooks?page=1&per_page=50&status=failed
Response: PaginatedResponse<DeliveryInfo> {
    id, endpoint_id, event, status, attempt_count,
    response_status, created_at, error_message
}

// Kullanıcının API key'lerini listele
GET /admin/users/{id}/api-keys
Response: Vec<ApiKeyInfo> {
    id, name, prefix, created_at, last_used_at, is_active
}

// Kullanıcının uygulamalarını listele
GET /admin/users/{id}/applications
Response: Vec<ApplicationInfo> {
    id, name, description, endpoint_count, created_at
}

// Kullanıcının kullanım istatistikleri
GET /admin/users/{id}/usage?period=30d
Response: UsageStats {
    total_deliveries, success_rate, failed_count,
    api_calls, bandwidth_bytes, top_events
}
```

### 4.2 Admin Aksiyonları

```rust
// İade/refund
POST /admin/users/{id}/refund
Body: { amount_cents: 2900, reason: "Customer request" }
Response: { refund_id, status, amount }

// Kullanıcıya test webhook gönder
POST /admin/users/{id}/test-webhook
Body: { endpoint_id, event: "test.ping", data: {} }
Response: { delivery_id, status }

// Kullanıcının failed delivery'sini replay et
POST /admin/users/{id}/webhooks/{delivery_id}/replay
Response: { new_delivery_id, status }

// Bulk email
POST /admin/bulk-email
Body: { subject, body, filter: { plan: "pro", status: "active" } }
Response: { sent_count, failed_count }

// Kullanıcı verisini dışa aktarma (GDPR)
GET /admin/users/{id}/export
Response: JSON file download

// Kullanıcı verisini silme (GDPR)
DELETE /admin/users/{id}/data
Response: { deleted_records, status }
```

### 4.3 Sistem Geneli

```rust
// Global failed deliveries
GET /admin/deliveries/failed?limit=50&since=24h
Response: Vec<FailedDelivery> {
    id, user_id, user_email, endpoint_url, event,
    error_message, attempt_count, created_at
}

// Rate limit violations
GET /admin/rate-limit-violations?limit=50
Response: Vec<RateLimitViolation> {
    user_id, user_email, endpoint_id, ip,
    requests_count, limit, window, timestamp
}

// API latency
GET /admin/api-latency?period=24h
Response: Vec<EndpointLatency> {
    endpoint, method, avg_ms, p95_ms, p99_ms, error_rate
}
```

---

## 5. Adım Adım Uygulama

### AŞAMA 1: Kullanıcı Kaynakları (1-2 oturum)

**Hedef:** Admin bir müşterinin tüm kaynaklarını görebilsin.

**Backend (Rust):**

1. `api/src/routes/admin.rs` dosyasına yeni endpoint'ler ekle:
   - `GET /admin/users/{id}/endpoints`
   - `GET /admin/users/{id}/webhooks`
   - `GET /admin/users/{id}/api-keys`
   - `GET /admin/users/{id}/applications`
   - `GET /admin/users/{id}/usage`

2. Her endpoint için SQL query yaz:
   ```sql
   -- Endpoints
   SELECT e.id, e.url, e.description, e.is_active, e.created_at,
          COUNT(d.id) as total_deliveries,
          MAX(d.created_at) as last_delivery_at
   FROM endpoints e
   LEFT JOIN deliveries d ON d.endpoint_id = e.id
   WHERE e.customer_id = $1
   GROUP BY e.id
   ORDER BY e.created_at DESC;

   -- Webhooks (with filters)
   SELECT id, endpoint_id, event_type, status, attempt_count,
          response_status, created_at, error_message
   FROM deliveries
   WHERE customer_id = $1
   AND ($2::text IS NULL OR status = $2)
   ORDER BY created_at DESC
   LIMIT $3 OFFSET $4;

   -- API Keys
   SELECT id, name, prefix, created_at, last_used_at, is_active
   FROM api_keys
   WHERE customer_id = $1
   ORDER BY created_at DESC;

   -- Applications
   SELECT id, name, description, created_at,
          (SELECT COUNT(*) FROM endpoints WHERE application_id = a.id) as endpoint_count
   FROM applications a
   WHERE customer_id = $1
   ORDER BY created_at DESC;
   ```

3. `admin.rs`'de router'a yeni route'lar ekle:
   ```rust
   .route("/users/{id}/endpoints", get(admin_user_endpoints))
   .route("/users/{id}/webhooks", get(admin_user_webhooks))
   .route("/users/{id}/api-keys", get(admin_user_api_keys))
   .route("/users/{id}/applications", get(admin_user_applications))
   .route("/users/{id}/usage", get(admin_user_usage))
   ```

**Frontend (Next.js):**

4. `dashboard/src/app/[locale]/admin/users/[id]/page.tsx` dosyasını güncelle:
   - Yeni tab'lar ekle: Endpoints, Webhooks, API Keys, Applications, Usage
   - Her tab için component oluştur
   - `adminApi` fonksiyonlarını ekle (`dashboard/src/lib/api.ts`)

5. `dashboard/src/lib/api.ts`'ye yeni fonksiyonlar ekle:
   ```typescript
   getUserEndpoints: (token: string, userId: string) =>
     apiFetch(`/admin/users/${userId}/endpoints`, { token }),
   getUserWebhooks: (token: string, userId: string, params?: {status?: string, page?: number}) =>
     apiFetch(`/admin/users/${userId}/webhooks${qs}`, { token }),
   getUserApiKeys: (token: string, userId: string) =>
     apiFetch(`/admin/users/${userId}/api-keys`, { token }),
   ```

### AŞAMA 2: Admin Aksiyonları (1 oturum)

**Hedef:** Admin müşteri adına aksiyon yapabilsin.

**Backend:**
1. `POST /admin/users/{id}/refund` — Polar.sh API ile entegrasyon
2. `POST /admin/users/{id}/test-webhook` — Mevcut webhook gönderme mantığını kullan
3. `POST /admin/users/{id}/webhooks/{delivery_id}/replay` — Mevcut replay mantığını kullan

**Frontend:**
4. Kullanıcı detay sayfasına "Actions" sekmesi ekle
5. Refund formu, test webhook butonu, replay butonu

### AŞAMA 3: Sistem Geneli (1 oturum)

**Hedef:** Admin sistem geneli sorunları görebilsin.

**Backend:**
1. `GET /admin/deliveries/failed` — Tüm kullanıcıların failed delivery'leri
2. `GET /admin/rate-limit-violations` — Rate limit ihlalleri
3. `GET /admin/api-latency` — API performans metrikleri

**Frontend:**
4. System sayfasına yeni section'lar ekle
5. Failed deliveries tablosu, rate limit violation listesi, latency grafikleri

---

## 6. Kontrol Listesi

### Aşama 1 — Kullanıcı Kaynakları
- [ ] `GET /admin/users/{id}/endpoints` — Backend endpoint
- [ ] `GET /admin/users/{id}/webhooks` — Backend endpoint
- [ ] `GET /admin/users/{id}/api-keys` — Backend endpoint
- [ ] `GET /admin/users/{id}/applications` — Backend endpoint
- [ ] `GET /admin/users/{id}/usage` — Backend endpoint
- [ ] `admin.ts` — Yeni API fonksiyonları
- [ ] `/admin/users/[id]` — Endpoints tab component
- [ ] `/admin/users/[id]` — Webhooks tab component
- [ ] `/admin/users/[id]` — API Keys tab component
- [ ] `/admin/users/[id]` — Applications tab component
- [ ] `/admin/users/[id]` — Usage tab component
- [ ] Build test + push

### Aşama 2 — Admin Aksiyonları
- [ ] `POST /admin/users/{id}/refund` — Backend endpoint
- [ ] `POST /admin/users/{id}/test-webhook` — Backend endpoint
- [ ] `POST /admin/users/{id}/webhooks/{id}/replay` — Backend endpoint
- [ ] `/admin/users/[id]` — Actions tab component
- [ ] Build test + push

### Aşama 3 — Sistem Geneli
- [ ] `GET /admin/deliveries/failed` — Backend endpoint
- [ ] `GET /admin/rate-limit-violations` — Backend endpoint
- [ ] `GET /admin/api-latency` — Backend endpoint
- [ ] `/admin/system` — Failed deliveries section
- [ ] `/admin/system` — Rate limit violations section
- [ ] `/admin/system` — API latency section
- [ ] Build test + push

---

## 7. Dosya Haritası

```
api/src/routes/admin.rs                    ← YENİ endpoint'ler eklenecek
dashboard/src/lib/api.ts                   ← YENİ adminApi fonksiyonları
dashboard/src/app/[locale]/admin/
├── page.tsx                               ← Overview güncellenecek
├── users/page.tsx                         ← Mevcut (değişmez)
├── users/[id]/page.tsx                    ← YENİ tab'lar eklenecek
├── system/page.tsx                        ← YENİ section'lar eklenecek
└── (diğer sayfalar değişmez)
```

---

## 8. Riskler

| Risk | Çözüm |
|------|-------|
| Polar.sh refund API entegrasyonu | Polar.sh docs kontrol et, test et |
| Büyük veri seti yavaşlık | Pagination, limit, index |
| Admin yetki kontrolü | Her endpoint'te `is_admin` kontrolü |
| GDPR silme geri alınamaz | Soft delete, onay dialogu |
| SQL injection | Parametrize query (zaten var) |

---

## 9. Öncelik Sırası

| Sıra | Özellik | Neden |
|------|---------|-------|
| 1 | Kullanıcı endpoint'lerini görme | Müşteri destek için en çok lazım olan |
| 2 | Kullanıcı webhook'larını görme | "Webhook'larım gelmiyor" sorunu |
| 3 | Test webhook gönderme | Debug için kritik |
| 4 | Failed delivery replay | Müşteri adına retry |
| 5 | Kullanıcı API key'leri | Key kaybı durumu |
| 6 | Global failed deliveries | Sistem geneli izleme |
| 7 | Rate limit violations | Güvenlik |
| 8 | Refund | Müşteri memnuniyeti |
| 9 | Bulk email | Operasyon |
| 10 | GDPR tools | Uyumluluk |
