# 🔧 Admin Panel Upgrade Plan — Detaylı Uygulama Rehberi

> **Tarih:** 2026-05-15
> **Güncelleme:** 2026-05-15 (Kapsamlı inceleme sonrası eksikler eklendi)
> **Durum:** PLANLANAN — uygulanmadı
> **Tahmini süre:** 5-6 oturum (1'er saat)

---

## 📌 Bu Dosya Neyi Anlatıyor?

HookSniff admin paneli şu an sadece "gözlüyor" — müşteri destek veremiyor, müdahale edemiyor.
Bu plan, admin panelini tam bir "operasyon merkezi" haline getirmeyi anlatıyor.

### ⚠️ Uygulama Kuralları (ZORUNLU)

1. **Sıralı ilerleme** — Aşamalar sırayla gidecek. Bir bitmeden diğerine geçilmez.
2. **Her aşamadan sonra `cargo test`** — Rust testleri geçmeden aşama bitmiş sayılmaz.
3. **Her aşamadan sonra `next build`** — Frontend build'i geçmeden aşama bitmiş sayılmaz.
4. **Her aşamadan sonra checklist güncelle** — Biten maddeler `[x]` ile işaretlenir.
5. **Her aşamadan sonra MEMORY.md güncelle** — Ne yapıldı, ne öğrenildi, sorunlar.
6. **Her aşamadan sonra NEXT_SESSION.md güncelle** — Sıradaki işler netleşir.
7. **Push zorunlu** — Her aşamanın sonunda `git commit` + `git push` yapılır.
8. **Aşama tamamlandıysa `✅ TAMAMLANDI` yazılır** — Tarih ve not ile.

Bunlar atlanamaz. Her aşama tek bir oturumda bitmeli ama bitmezse NEXT_SESSION.md'ye "yarıda kaldı" yazılır.

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

### Admin API (23 route → 28 HTTP endpoint)
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
GET    /admin/feature-flags            → Feature flag listesi
POST   /admin/feature-flags            → Feature flag oluştur
PUT    /admin/feature-flags/{id}       → Feature flag güncelle
DELETE /admin/feature-flags/{id}       → Feature flag sil
GET    /admin/deploy-info              → Deploy bilgisi (versiyon, commit)
```

### Eksikler
- ❌ Müşterinin webhook'larını göremiyorum
- ❌ Müşterinin endpoint'lerini göremiyorum
- ❌ Sistem geneli failed delivery'leri göremiyorum
- ❌ Rate limit ihlali göremiyorum
- ❌ Kullanıcı bazlı API usage göremiyorum
- ❌ İade/refund yapamıyorum
- ❌ Bulk email gönderemiyorum
- ❌ GDPR veri dışa aktarma/silme yapamıyorum

### Veritabanı Tutarsızlıkları ⚠️
- ⚠️ `api_keys` tablosu: Production'da aktif kullanılıyor (api_keys.rs CRUD + inbound.rs auth) ama migration'da yok. Ayrı bir migration ile eklenmeli — bu planın kapsamı dışında.
- ⚠️ `invoices` tablosu (migration 009) var ama admin API'sinde hiç endpoint yok — fatura verileri görünmüyor.
- ⚠️ `payment_transactions` tablosu (migration 009) var ama admin API'sinde hiç endpoint yok — ödeme geçmişi görünmüyor.
- ⚠️ `rate_limit_configs` tablosu var ama ihlal log'ları tutulmuyor (`rate_limit_violations` tablosu yok).

### Eksik — Müşteri İlişkileri Yönetimi
- ❌ **Müşteri notları** — Admin müşteri hakkında not yazamıyor (ör: "Enterprise'a geçmek istiyor, 2 hafta sonra ara")
- ❌ **Müşteri etiketleri/label'ları** — VIP, at-risk, churn-risk, enterprise-ready gibi etiketler yok
- ❌ **İletişim geçmişi** — Müşteriye ne zaman email gönderildi, ne zaman impersonate edildi, ne zaman refund yapıldı → tek bir yerde görünmüyor
- ❌ **Müşteri segmentasyonu** — "Son 30 günde 1000+ delivery yapan pro müşteriler" gibi sorgular yapılamıyor
- ❌ **Müşteri sağlık skoru** — Kullanım trendi düşen, endpoint'leri pasif, ödeme sorunu olan müşteriler otomatik tespit edilemiyor

### Eksik — Gelir & Fatura Yönetimi
- ❌ **Fatura görüntüleme** — `invoices` tablosu var ama admin panelinde fatura listesi/detayı yok
- ❌ **Ödeme geçmişi** — `payment_transactions` tablosu var ama admin panelinde görünmüyor
- ❌ **Refund tracking** — Yapılan iadelerin kaydı tutulmuyor (refunds tablosu yok)
- ❌ **ARPU** (Average Revenue Per User) — Hesaplanmıyor
- ❌ **LTV** (Customer Lifetime Value) — Hesaplanmıyor
- ❌ **NRR** (Net Revenue Retention) — Hesaplanmıyor
- ❌ **Expansion Revenue** — Plan yükseltmelerden gelen ek gelir ayrı gösterilmiyor
- ❌ **Cohort analizi** — Aylık müşteri cohort gelir karşılaştırması yok
- ❌ **Gelir projeksiyonu** — 3/6/12 aylık tahmini gelir grafiği yok
- ❌ **Promosyon/kupon yönetimi** — İndirim kuponu oluşturma ve takibi yok

### Mevcut Bug'lar (Düzeltilecek) 🐛
- 🐛 **Overview pie chart hardcoded** — Veri yoksa `pct: 60, 30, 10` statik gösteriyor → yanıltıcı
- 🐛 **Trend negatif gösterimi** — `Math.abs(diff)` kullanıldığı için negatif trend pozitif görünüyor
- 🐛 **Profile dropdown hover** — `group-hover` ile açılıyor, mobilde touch cihazlarda çalışmıyor
- 🐛 **Quick Search kapsamı** — Sadece kullanıcı arıyor, endpoint/delivery/event aramıyor
- 🐛 **Currency hardcoded** — ₺ hardcoded, uluslararası destek yok

### Eksik — Operasyonel
- ❌ **Maintenance mode toggle** — Settings'de bahsedilmiş ama API endpoint'i yok, sadece UI var
- ❌ **Bulk email queue** — Toplu email gönderimi kuyruğa alınmıyor, anlık gönderim deneniyor (büyük listelerde timeout riski)
- ❌ **Admin action audit logging** — Yeni eklenecek aksiyonlar (refund, GDPR delete, bulk email) için audit log kaydı zorunlu
- ❌ **Customer dashboard view** — Admin müşterinin gözünden dashboard'u göremiyor (impersonate var ama token ile, "view as" modu daha güvenli)
- ❌ **invoices/payment_transactions boş** — Tablolar var ama veri dolduran mekanizma yok (Polar.sh webhook ile fatura kaydetme gerekli)
- ❌ **webhook_queue izleme** — Tablo var (migration 009) ama admin panelinde queue depth görünmüyor
- ❌ **dead_letters izleme** — Tablo var (migration 001) ama admin panelinde kalıcı başarısızlıklar görünmüyor

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

### Hookdeck (Webhook Platform — Açık Kaynak Rakip)
- ✅ Multi-tenant müşteri yönetimi
- ✅ Application portal (müşteri self-servis)
- ✅ Delivery failure alerts
- ✅ Automatic + manual retries
- ✅ Event fanout (tek mesaj → çoklu endpoint)
- ✅ Deduplication (tekrarlayan event filtreleme)
- ✅ Quick filters (tek tıkla filtre)

### Hook0 (Açık Kaynak Webhook Platform)
- ✅ Event types katalog (dot-notation hiyerarşi)
- ✅ Subscription yönetimi (endpoint abonelikleri)
- ✅ Custom retry schedules
- ✅ Event log + replay

### Convoy (Enterprise Açık Kaynak)
- ✅ Circuit breaker (endpoint sağlık takibi)
- ✅ Tenant bazlı rate limiting
- ✅ Signature verification
- ✅ Slack/email alerting entegrasyonu

---

## 3. Yeni Admin Panel Yapısı

### 3.1 Sidebar (Güncellenmiş)

```
📊 Overview
👥 Users
💰 Revenue
🖥️ System
🚩 Feature Flags
🔔 Alerts          ← YENİ sayfa (API'de CRUD var, ayrı sayfa yok)
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
| **Endpoints** | Kullanıcının tüm endpoint'leri, URL'ler, aktif/pasif durumu, success rate | **YENİ** |
| **Webhooks** | Kullanıcının tüm delivery'leri, filtreleme (status/event/date), arama | **YENİ** |
| **Applications** | Kullanıcının uygulamaları, endpoint sayısı | **YENİ** |
| **Usage** | API kullanım istatistikleri, grafikler, event dağılımı | **YENİ** |
| Plan History | Plan değişiklik geçmişi | Mevcut |
| **Billing** | Fatura geçmişi (`invoices` tablosu), ödeme durumu (`payment_transactions`), refund geçmişi | **YENİ** |
| **Notes & Tags** | Admin notları, müşteri etiketleri (VIP, at-risk, enterprise-ready) | **YENİ** |
| **Communication** | Tüm etkileşim geçmişi (email, impersonate, refund, plan change) | **YENİ** |
| **Actions** | Email gönder, refund, test webhook, GDPR export/delete, hesap silme | **YENİ** |

#### 💰 Revenue (`/admin/revenue`)
**Mevcut:** Aylık gelir, plan bazlı gelir, churn
**Eklenecek:**
- **MRR kartı** — Monthly Recurring Revenue (₺) — ✅ Mevcut (Overview'de)
- **ARR kartı** — Annual Recurring Revenue (₺) — ✅ Mevcut (Overview'de)
- **ARPU kartı** — Average Revenue Per User (₺) — **YENİ**
- **LTV kartı** — Customer Lifetime Value (₺) — **YENİ**
- **NRR** — Net Revenue Retention (%) — **YENİ**
- **Expansion Revenue** — Plan yükseltmelerden gelen ek gelir — **YENİ**
- Refund geçmişi — **YENİ**
- Fatura detayları (tek tek inceleme) — **YENİ** (`invoices` tablosundan okunacak)
- Ödeme geçmişi — **YENİ** (`payment_transactions` tablosundan okunacak)
- Gelir projeksiyonu (3/6/12 ay tahmini) — **YENİ**
- Cohort analizi (aylık müşteri cohort karşılaştırması) — **YENİ**

#### 🖥️ System (`/admin/system`)
**Mevcut:** DB, Redis, API, queue sağlık durumu, test webhook console (15sn auto-refresh)
**Eklenecek:**
- **Global Failed Deliveries** — Tüm kullanıcıların başarısız delivery'leri
- **Dead Letters** — Kalıcı olarak başarısız olmuş delivery'ler (`dead_letters` tablosu — migration 001)
- **Queue Depth** — Kuyrukta bekleyen/failed webhook'lar (`webhook_queue` tablosu — migration 009)
- **Rate Limit Violations** — Son ihlaller
- **API Latency** — Endpoint bazlı response time
- **Deploy History** — Son deploy'lar, versiyon

#### 🚩 Feature Flags (`/admin/feature-flags`)
**Mevcut:** CRUD (GET, POST, PUT, DELETE) — değişiklik yok
**Not:** Planın eski versiyonunda atlanmış ama API'de mevcut. Sidebar'da doğru şekilde listeleniyor.

#### 🔔 Alerts (`/admin/alerts`) — YENİ SAYFA
**Mevcut:** API'de CRUD endpoint'leri var ama ayrı sayfası yok (Overview'de sayılıyor)
**Eklenecek:**
- Alert listesi (aktif/pasif filtresi)
- Alert oluşturma formu (şartlar, eşikler, bildirim kanalı)
- Alert düzenleme/silme
- Son incident geçmişi

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
GET /admin/users/{id}/webhooks?page=1&per_page=50&status=failed&event=order.created&since=7d
Response: PaginatedResponse<DeliveryInfo> {
    id, endpoint_id, event_type, status, attempt_count,
    response_status, created_at, response_body, error_message
}
// NOT: deliveries tablosunda sütun adı `event_type` (plan'ın eski versiyonunda `event` yazılmıştı)
// `error_message` deliveries'da YOK — delivery_attempts tablosundan subquery ile çekilecek
// `response_body` deliveries tablosunda mevcut

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

// Kullanıcının faturalarını listele
GET /admin/users/{id}/invoices
Response: Vec<InvoiceInfo> {
    id, amount_cents, currency, plan, status, provider,
    provider_invoice_id, paid_at, created_at
}
// Kaynak: invoices tablosu (migration 009)

// Kullanıcının ödeme geçmişini listele
GET /admin/users/{id}/payments
Response: Vec<PaymentInfo> {
    id, amount_cents, currency, status, provider,
    provider_transaction_id, created_at
}
// Kaynak: payment_transactions tablosu (migration 009)
```

### 4.2 Admin Aksiyonları

```rust
// İade/refund
POST /admin/users/{id}/refund
Body: { amount_cents: 2900, reason: "Customer request" }
Response: { refund_id, status, amount }
// YENİ TABLO GEREKLİ: refunds (id, customer_id, amount_cents, reason,
//   admin_user_id, provider_refund_id, status, created_at)
// Polar.sh refund API entegrasyonu + audit log kaydı zorunlu

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
Response: { job_id, estimated_count }
// NOT: Anlık gönderim yerine kuyruk sistemi gerekli (background worker)
// Rate limit: Dakikada max 100 email, batch 50'şer
// Audit log zorunlu

// Kullanıcı verisini dışa aktarma (GDPR)
GET /admin/users/{id}/export
Response: JSON file download
// İçerik: customer profile, endpoints, deliveries, api_keys, applications,
//   invoices, payment_transactions, audit_log (kullanıcıya ait olanlar)

// Kullanıcı verisini silme (GDPR)
DELETE /admin/users/{id}/data
Response: { deleted_records, status }
// Soft delete önerisi: customers.is_deleted = true, veriler 30 gün sonra temizlenir
// Hard delete: CASCADE ile tüm ilişkili kayıtlar silinir
// İade edilemez → onay dialogu + audit log zorunlu

// Müşteri notu ekleme
POST /admin/users/{id}/notes
Body: { content: "Enterprise'a geçmek istiyor" }
Response: { id, content, admin_email, created_at }
// YENİ TABLO: customer_notes

// Müşteri etiketi ekleme/çıkarma
POST /admin/users/{id}/tags
Body: { tag: "vip" }
DELETE /admin/users/{id}/tags/{tag}
// YENİ TABLO: customer_tags

// İletişim geçmişi
GET /admin/users/{id}/communications
Response: Vec<CommunicationEntry> {
    type, subject, details, admin_email, created_at
}
// YENİ TABLO: communication_history (otomatik kayıt: email, impersonate,
//   refund, plan change, ban, GDPR action)
```

### 4.3 Sistem Geneli

```rust
// Global failed deliveries
GET /admin/deliveries/failed?limit=50&since=24h&user_id=xxx
Response: Vec<FailedDelivery> {
    id, user_id, user_email, endpoint_url, event_type,
    response_body, error_message, attempt_count, created_at
}
// error_message: delivery_attempts tablosundan subquery ile

// Rate limit violations
GET /admin/rate-limit-violations?limit=50
Response: Vec<RateLimitViolation> {
    user_id, user_email, endpoint_id, ip,
    requests_count, limit, window, timestamp
}
// YENİ TABLO: rate_limit_violations (id, customer_id, endpoint_id, ip,
//   requests_count, limit_per_window, window_seconds, created_at)
// NOT: rate_limit_configs tablosu var ama ihlal log'ları tutulmuyor

// API latency
GET /admin/api-latency?period=24h
Response: Vec<EndpointLatency> {
    endpoint, method, avg_ms, p95_ms, p99_ms, error_rate
}

// Refund listesi (tüm müşteriler)
GET /admin/refunds?limit=50
Response: Vec<RefundEntry> {
    id, customer_id, customer_email, amount_cents, reason,
    admin_email, status, created_at
}
// Kaynak: refunds tablosu (yeni oluşturulacak)

// Fatura listesi (tüm müşteriler)
GET /admin/invoices?limit=50&status=failed
Response: Vec<InvoiceEntry> {
    id, customer_id, customer_email, amount_cents, plan,
    status, provider, paid_at, created_at
}
// Kaynak: invoices tablosu (migration 009 — mevcut)

// Müşteri segmentasyonu
GET /admin/segments
POST /admin/segments
Body: { name: "High-volume Pro", filter: { plan: "pro", min_deliveries: 1000 } }
Response: { segment_id, user_count, users: [...] }
// Opsiyonel — ilk aşamada basit filtre, ileride kayıtlı segment
```

---

## 5. Adım Adım Uygulama

> **Sıralama mantığı:** Bağımsız ve hızlı kazanımlar önce, Polar.sh bağımlılığı olan refund en sonda.

### AŞAMA 0: Veritabanı Hazırlığı + Bug Fix (1 oturum)

**Hedef:** Eksik tabloları oluştur, mevcut bug'ları düzelt.

**Yeni Migration: `019_admin_upgrade.sql`**

```sql
-- 1. Refund tracking
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    reason TEXT,
    admin_user_id UUID,
    provider TEXT NOT NULL DEFAULT 'polar',
    provider_refund_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refunds_customer ON refunds(customer_id);
CREATE INDEX idx_refunds_created ON refunds(created_at DESC);

-- 2. Customer notes
CREATE TABLE IF NOT EXISTS customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    admin_user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customer_notes_customer ON customer_notes(customer_id);

-- 3. Customer tags
CREATE TABLE IF NOT EXISTS customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    admin_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, tag)
);
CREATE INDEX idx_customer_tags_customer ON customer_tags(customer_id);
CREATE INDEX idx_customer_tags_tag ON customer_tags(tag);

-- 4. Communication history (otomatik kayıt)
CREATE TABLE IF NOT EXISTS communication_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- email, impersonate, refund, plan_change, ban, gdpr_export, gdpr_delete
    subject TEXT,
    details JSONB,
    admin_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comm_history_customer ON communication_history(customer_id);
CREATE INDEX idx_comm_history_type ON communication_history(type);

-- 5. Rate limit violations (logging)
CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    endpoint_id UUID REFERENCES endpoints(id) ON DELETE SET NULL,
    ip TEXT,
    requests_count INT NOT NULL,
    limit_per_window INT NOT NULL,
    window_seconds INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_rl_violations_created ON rate_limit_violations(created_at DESC);
CREATE INDEX idx_rl_violations_customer ON rate_limit_violations(customer_id);

-- 6. Polar.sh webhook ile fatura kaydetme (invoices tablosunu doldurmak için)
-- NOT: api_keys tablosu zaten production'da mevcut (api_keys.rs CRUD + inbound.rs auth)
-- Migration'da yok ama ayrı migration ile eklenmeli — bu planın kapsamı dışında
-- invoices ve payment_transactions tabloları migration 009'da var ama boş.
-- Polar.sh webhook'u (invoice.created, payment.created) ile veri doldurulacak.
-- Bu AŞAMA 5'te implemente edilecek.
```

**Bug Fix'ler:**
- Overview pie chart: Veri yoksa placeholder gösterme, "No data" mesajı
- Trend negatif: `Math.abs(diff)` yerine gerçek negatif değeri göster
- Profile dropdown: `group-hover` → `click` event (mobil uyumluluk)
- Currency: ₺ hardcoded → platform_settings'den oku (dinamik)

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
   -- NOT: error_message delivery_attempts tablosunda, deliveries'da yok
   SELECT d.id, d.endpoint_id, d.event_type, d.status, d.attempt_count,
          d.response_status, d.created_at, d.response_body,
          (SELECT da.error_message FROM delivery_attempts da
           WHERE da.delivery_id = d.id ORDER BY da.attempt_number DESC LIMIT 1) as error_message
   FROM deliveries d
   WHERE d.customer_id = $1
   AND ($2::text IS NULL OR d.status = $2)
   ORDER BY d.created_at DESC
   LIMIT $3 OFFSET $4;

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
   .route("/users/{id}/applications", get(admin_user_applications))
   .route("/users/{id}/usage", get(admin_user_usage))
   .route("/users/{id}/test-webhook", post(admin_user_test_webhook))
   .route("/users/{id}/webhooks/{delivery_id}/replay", post(admin_user_replay_delivery))
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
   ```

### AŞAMA 2: Sistem Geneli (1 oturum)

**Hedef:** Admin sistem geneli sorunları görebilsin. (Bağımsız — AŞAMA 1'den sonra yapılabilir)

**Backend:**
1. `GET /admin/deliveries/failed` — Tüm kullanıcıların failed delivery'leri
2. `GET /admin/deliveries/dead-letters` — Kalıcı başarısızlıklar (`dead_letters` tablosundan)
3. `GET /admin/queue/status` — Queue depth (`webhook_queue` tablosundan: pending/failed sayısı)
4. `GET /admin/rate-limit-violations` — Rate limit ihlalleri
5. `GET /admin/api-latency` — API performans metrikleri

**Frontend:**
6. System sayfasına yeni section'lar ekle:
   - Failed deliveries tablosu (kullanıcı linkli)
   - Dead letters tablosu (en kritik — kalıcı hatalar)
   - Queue depth göstergesi (pending/processing/failed)
   - Rate limit violation listesi
   - Latency grafikleri

### AŞAMA 3: Müşteri İlişkileri (1 oturum)

**Hedef:** Admin müşteri hakkında not yazabilsin, etiketleyebilsin, geçmişi görebilsin. (Bağımsız)

**Backend:**
1. `POST /admin/users/{id}/notes` — Not ekle
2. `GET /admin/users/{id}/notes` — Notları listele
3. `POST /admin/users/{id}/tags` — Etiket ekle
4. `DELETE /admin/users/{id}/tags/{tag}` — Etiket kaldır
5. `GET /admin/users/{id}/communications` — İletişim geçmişini listele
6. Mevcut aksiyonları `communication_history` tablosuna otomatik logla:
   - Email gönderildiğinde → `type: 'email'`
   - Impersonate edildiğinde → `type: 'impersonate'`
   - Plan değiştirildiğinde → `type: 'plan_change'`
   - Ban/activate edildiğinde → `type: 'ban'`

**Frontend:**
7. User detail sayfasına "Notes & Tags" sekmesi
8. User detail sayfasına "Communication" sekmesi
9. Etiket renkleri: VIP=gold, at-risk=red, enterprise=purple, churn-risk=orange

### AŞAMA 4: Fatura, Ödeme & Gelir Metrikleri (1 oturum)

**Hedef:** Admin fatura/ödeme geçmişini görebilsin + gelir metrikleri. (Bağımsız)

**Backend:**
1. `GET /admin/users/{id}/invoices` — Kullanıcının faturaları (invoices tablosundan)
2. `GET /admin/users/{id}/payments` — Kullanıcının ödemeleri (payment_transactions tablosundan)
3. `GET /admin/invoices` — Tüm faturalar (sistem geneli)
4. Revenue API'sine yeni metrikler ekle:
   - ARPU = MRR / toplam ücretli kullanıcı
   - LTV = ARPU / churn_rate
   - NRR = (dönem başı MRR + expansion - contraction - churn) / dönem başı MRR
   - Expansion Revenue = plan yükseltmelerden gelen ek gelir

**Frontend:**
5. User detail sayfasına "Billing" sekmesi (fatura + ödeme geçmişi)
6. Revenue sayfasına fatura listesi section'ı
7. Revenue sayfasına yeni metrik kartları (ARPU, LTV, NRR, Expansion Revenue)
8. Cohort analizi tablosu (opsiyonel — ilk aşamada basit)

### AŞAMA 5: Refund + Polar.sh Entegrasyonu (1 oturum) — EN SONA BIRAKILDI

**Hedef:** Admin müşteriye iade yapabilsin. (Polar.sh bağımlılığı var — riskli)

**Backend:**
1. `POST /admin/users/{id}/refund` — Polar.sh refund API entegrasyonu
   - Polar.sh docs'dan refund endpoint'ini kontrol et
   - Idempotency key ile mükerrer gönderimi engelle
   - `refunds` tablosuna kayıt + audit log
2. `GET /admin/refunds` — Sistem geneli refund listesi
3. Polar.sh webhook handler:
   - `invoice.created` → `invoices` tablosuna kaydet
   - `payment.created` → `payment_transactions` tablosuna kaydet
   - `refund.created` → `refunds` tablosunu güncelle

**Frontend:**
4. User detail sayfasına "Actions" sekmesinde refund formu
5. Onay dialogu (miktar + sebep)
6. Revenue sayfasına refund geçmişi section'ı

**Risk:** Polar.sh API entegrasyonu beklenenden uzun sürebilir. Bu aşama ertelenirse diğer aşamaları etkilemez.

### AŞAMA 6: Alerts Sayfası + Final (0.5 oturum)

**Hedef:** Alerts'i ayrı sayfaya taşı, genel polish.

**Backend:**
1. Mevcut alerts endpoint'leri zaten var (GET, POST, PUT, DELETE) — yeni endpoint gerekmez

**Frontend:**
2. Yeni `/admin/alerts` sayfası oluştur
3. Alert listesi (aktif/pasif filtresi)
4. Alert oluşturma/düzenleme formu
5. Son incident geçmişi
6. Sidebar'a Alerts linki ekle

---

## 6. Kontrol Listesi

### Aşama 0 — Veritabanı + Bug Fix
- [ ] `019_admin_upgrade.sql` migration yaz
- [ ] `refunds` tablosu CREATE TABLE
- [ ] `customer_notes` tablosu CREATE TABLE
- [ ] `customer_tags` tablosu CREATE TABLE
- [ ] `communication_history` tablosu CREATE TABLE
- [ ] `rate_limit_violations` tablosu CREATE TABLE
- [ ] Overview pie chart bug fix (hardcoded pct → "No data")
- [ ] Trend negatif bug fix (Math.abs → gerçek değer)
- [ ] Profile dropdown bug fix (group-hover → click)
- [ ] Currency bug fix (₺ hardcoded → platform_settings'den oku)
- [ ] `cargo test` ile doğrula

### Aşama 1 — Kullanıcı Kaynakları
- [ ] `GET /admin/users/{id}/endpoints` — Backend endpoint
- [ ] `GET /admin/users/{id}/webhooks` — Backend endpoint (filtre: status, event_type, since)
- [ ] `GET /admin/users/{id}/applications` — Backend endpoint
- [ ] `GET /admin/users/{id}/usage` — Backend endpoint
- [ ] `POST /admin/users/{id}/test-webhook` — Backend endpoint (per-user test webhook)
- [ ] `POST /admin/users/{id}/webhooks/{delivery_id}/replay` — Backend endpoint (per-user replay)
- [ ] `admin.ts` — Yeni API fonksiyonları
- [ ] `/admin/users/[id]` — Endpoints tab component
- [ ] `/admin/users/[id]` — Webhooks tab component (filtre + arama + replay butonu)
- [ ] `/admin/users/[id]` — Applications tab component
- [ ] `/admin/users/[id]` — Usage tab component (grafikler)
- [ ] `/admin/users/[id]` — Test webhook butonu (endpoint bazlı)
- [ ] Build test + push

### Aşama 2 — Sistem Geneli
- [ ] `GET /admin/deliveries/failed` — Backend endpoint
- [ ] `GET /admin/deliveries/dead-letters` — Backend endpoint
- [ ] `GET /admin/queue/status` — Backend endpoint
- [ ] `GET /admin/rate-limit-violations` — Backend endpoint
- [ ] `GET /admin/api-latency` — Backend endpoint
- [ ] `/admin/system` — Failed deliveries section
- [ ] `/admin/system` — Dead letters section
- [ ] `/admin/system` — Queue depth göstergesi
- [ ] `/admin/system` — Rate limit violations section
- [ ] `/admin/system` — API latency section
- [ ] Build test + push

### Aşama 3 — Müşteri İlişkileri
- [ ] `POST /admin/users/{id}/notes` — Backend endpoint
- [ ] `GET /admin/users/{id}/notes` — Backend endpoint
- [ ] `POST /admin/users/{id}/tags` — Backend endpoint
- [ ] `DELETE /admin/users/{id}/tags/{tag}` — Backend endpoint
- [ ] `GET /admin/users/{id}/communications` — Backend endpoint
- [ ] Mevcut aksiyonları communication_history'ye otomatik loglama
- [ ] `/admin/users/[id]` — Notes & Tags sekmesi
- [ ] `/admin/users/[id]` — Communication sekmesi
- [ ] Build test + push

### Aşama 4 — Fatura, Ödeme & Gelir Metrikleri
- [ ] `GET /admin/users/{id}/invoices` — Backend endpoint
- [ ] `GET /admin/users/{id}/payments` — Backend endpoint
- [ ] `GET /admin/invoices` — Backend endpoint (sistem geneli)
- [ ] Revenue API'sine ARPU, LTV, NRR, Expansion Revenue ekle
- [ ] `/admin/users/[id]` — Billing sekmesi (fatura + ödeme geçmişi)
- [ ] `/admin/revenue` — Fatura listesi section'ı
- [ ] `/admin/revenue` — Yeni metrik kartları
- [ ] Cohort analizi tablosu (opsiyonel)
- [ ] Build test + push

### Aşama 5 — Refund + Polar.sh
- [ ] Polar.sh refund API entegrasyonu — docs kontrol + test
- [ ] `POST /admin/users/{id}/refund` — Backend endpoint
- [ ] `GET /admin/refunds` — Backend endpoint (sistem geneli)
- [ ] Polar.sh webhook handler (invoice.created, payment.created, refund.created)
- [ ] `/admin/users/[id]` — Actions sekmesinde refund formu + onay dialogu
- [ ] `/admin/revenue` — Refund geçmişi section'ı
- [ ] Build test + push

### Aşama 6 — Alerts Sayfası + Final
- [ ] `/admin/alerts` — Yeni sayfa oluştur
- [ ] Alert listesi (aktif/pasif filtresi)
- [ ] Alert oluşturma/düzenleme formu
- [ ] Son incident geçmişi
- [ ] Sidebar'a Alerts linki ekle
- [ ] Build test + push

### Aşama 7 — Bulk Email + GDPR (ileride)
- [ ] `POST /admin/bulk-email` — Backend endpoint (kuyruk sistemi, batch 50'şer)
- [ ] `GET /admin/users/{id}/export` — Backend endpoint (GDPR data export)
- [ ] `DELETE /admin/users/{id}/data` — Backend endpoint (GDPR data delete)
- [ ] `/admin/users/[id]` — Actions sekmesinde GDPR export/delete butonları
- [ ] `/admin/settings` — Bulk email section (segment filtresi + gönderim)
- [ ] Build test + push

---

## 7. Dosya Haritası

```
api/migrations/019_admin_upgrade.sql      ← YENİ migration (6 tablo)
api/src/routes/admin.rs                    ← YENİ endpoint'ler eklenecek (~18 yeni fonksiyon)
dashboard/src/lib/api.ts                   ← YENİ adminApi fonksiyonları
dashboard/src/app/[locale]/admin/
├── page.tsx                               ← Overview: bug fix + failed deliveries/alerts
├── users/page.tsx                         ← Mevcut (değişmez)
├── users/[id]/page.tsx                    ← YENİ tab'lar eklenecek (9 yeni sekme)
├── system/page.tsx                        ← YENİ section'lar (dead letters, queue depth, latency)
├── revenue/page.tsx                       ← YENİ metrik kartları + fatura listesi + refund geçmişi
├── alerts/page.tsx                        ← YENİ sayfa
└── (diğer sayfalar değişmez)
```

---

## 8. Riskler

| Risk | Çözüm |
|------|-------|
| Polar.sh refund API entegrasyonu | Polar.sh docs kontrol et, test et; AŞAMA 5 en sonda — diğer aşamaları etkilemez |
| Büyük veri seti yavaşlık | Pagination, limit, index |
| Admin yetki kontrolü | Her endpoint'te `is_admin` kontrolü |
| GDPR silme geri alınamaz | Soft delete, onay dialogu |
| SQL injection | Parametrize query (zaten var) |
| `api_keys` tablo tutarsızlığı | inbound.rs'deki sorguyu kontrol et, karar ver |
| Bulk email timeout | Kuyruk sistemi (background worker), batch 50'şer |
| Refund mükerrer gönderim | Idempotency key + provider_refund_id unique constraint |
| Communication history boyutu | Eski kayıtları arşivle (>90 gün), index'le |
| Fatura tablosu boş | Polar.sh webhook handler ekle (AŞAMA 5) |
| Dead letters büyüyor | TTL policy — 30 gün sonra otomatik temizle |

---

## 9. Öncelik Sırası

| Sıra | Özellik | Neden | Aşama |
|------|---------|-------|-------|
| 0 | **Veritabanı migration + bug fix** | Temel — diğer her şey bunun üzerine kurulur | 0 |
| 1 | Kullanıcı endpoint'lerini görme | Müşteri destek için en çok lazım olan | 1 |
| 2 | Kullanıcı webhook'larını görme | "Webhook'larım gelmiyor" sorunu | 1 |
| 3 | Kullanıcı API key'leri | Key kaybı durumu | 1 |
| 4 | Global failed deliveries | Sistem geneli izleme | 2 |
| 5 | Dead letters | Kalıcı başarısızlıklar — en kritik veri | 2 |
| 6 | Queue depth | Kuyruk sağlığı | 2 |
| 7 | Rate limit violations | Güvenlik | 2 |
| 8 | Müşteri notları + etiketleri | Operasyonel verimlilik | 3 |
| 9 | İletişim geçmişi | Müşteri ilişkileri | 3 |
| 10 | Fatura + ödeme geçmişi | Finans | 4 |
| 11 | ARPU, LTV, NRR metrikleri | Büyüme takibi | 4 |
| 12 | Refund | Müşteri memnuniyeti (Polar.sh bağımlı) | 5 |
| 13 | Alerts sayfası | Operasyon | 6 |
| 14 | Bulk email | Operasyon | — (ileride) |
| 15 | GDPR tools | Uyumluluk | — (ileride) |

---

## 10. Karar Gereken Noktalar ⚠️

| # | Konu | Seçenek A | Seçenek B | Tavsiye |
|---|------|-----------|-----------|---------|
| 1 | Refund provider | Polar.sh API | Manuel kayıt + admin takibi | Önce manuel, sonra Polar.sh entegrasyonu |
| 2 | GDPR silme | Hard delete (CASCADE) | Soft delete (is_deleted + 30 gün) | Soft delete — geri dönüş mümkün olsun |
| 3 | Bulk email | Anlık gönderim | Kuyruk (background worker) | Kuyruk — timeout riski var |
| 4 | Communication log | Manuel kayıt | Otomatik (middleware) | Otomatik — mevcut aksiyonları intercept et |
| 5 | Cohort analizi | Tam implementasyon | Basit tablo | Önce basit, sonra geliştir |
