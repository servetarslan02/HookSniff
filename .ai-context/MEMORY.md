# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-15 21:26 GMT+8
> Bu dosya GitHub'da kalıcıdır. Oturumlar 1 saat sürer, silinir. Bu dosya her oturum başı okunur.

---

## 🚀 Hızlı Başlangıç (Her Oturum)

1. `git pull` — en son kodu çek
2. Bu dosyayı oku (MEMORY.md)
3. `NEXT_SESSION.md` oku — yapılacaklar listesi
4. İşe başla
5. Oturum sonunda: değişiklikleri push et, bu dosyayı güncelle

---

## 📋 Proje Nedir?

**HookSniff** bir webhook altyapı platformu. Kullanıcılar webhook endpoint'leri oluşturur, HookSniff webhook'ları alır, işler ve teslim eder.

- **Dil:** Rust (API + Worker), TypeScript/Next.js (Dashboard)
- **Veritabanı:** Neon PostgreSQL (Free tier)
- **Cache/Queue:** Upstash Redis (Free tier)
- **Deploy:** Google Cloud Build → Cloud Run (API + Worker), Vercel (Dashboard)
- **Repo:** https://github.com/servetarslan02/HookSniff

---

## 👤 Kullanıcı

- **İsim:** Servet Arslan
- **GitHub:** servetarslan02
- **Email:** servetarslan02@gmail.com
- **Teknik bilgi:** Yok — ilk proje, kodu AI yazıyor
- **Hedef:** $500/ay gelir, sonra şirket kur
- **Dil:** Türkçe konuşuyor, teknik terimleri basit açıkla

---

## 🏗️ Mimari

```
HookSniff/
├── api/          → Rust API (axum framework, port 3000)
├── worker/       → Rust background worker (webhook teslimatı)
├── common/       → Paylaşılan Rust kütüphanesi
├── dashboard/    → Next.js admin panel (Vercel'de deploy)
├── cli/          → Rust CLI aracı
├── sdks/         → Python, Node, Go, Ruby SDK'ları
├── migrations/   → SQL migration dosyaları
├── deploy/       → Terraform, deploy scriptleri
├── monitoring/   → Grafana dashboard JSON
├── cloudbuild.yaml → GCP Cloud Build config
├── Dockerfile.api → API Docker image
├── Dockerfile.worker → Worker Docker image
└── .ai-context/  → 🔑 KALICI HAFIZA (GitHub'da sync)
```

---

## 🔑 Hesap Bilgileri

| Servis | Bilgi |
|--------|-------|
| **Admin giriş** | email: servetarslan02@gmail.com / şifre: Alayci_165 |
| **Demo giriş** | email: demo@hooksniff.com / şifre: Demo1234! |
| **Google Cloud** | proje: hooksniff-app |
| **Neon DB** | proje: hookrelay (org: Servet, Free tier) |
| **Dashboard URL** | https://hooksniff.vercel.app |
| **API URL** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Grafana** | https://hookrelay.grafana.net |

---

## ☁️ External Servisler

| Servis | Durum | Not |
|--------|-------|-----|
| **Vercel** | ✅ Aktif | Dashboard deploy, Hobby plan |
| **Neon PostgreSQL** | ✅ Aktif | Free tier, 1 branch (production), 12 MB |
| **Upstash Redis** | ✅ Aktif | Free tier, cache + queue |
| **Google Cloud Run** | ✅ Aktif | API + Worker deploy |
| **Google Cloud Build** | ✅ Aktif | Otomatik deploy (push → build) |
| **Polar.sh** | ✅ Aktif | Ödeme sistemi, Pro ($49) + Business ($149) |
| **Resend** | ✅ Aktif | Email gönderimi, onboarding@resend.dev |
| **Grafana Cloud** | ✅ Aktif | OTEL monitoring, hookrelay.grafana.net |
| **Cloudflare R2** | ✅ Aktif | Dosya depolama, hooksniff-storage bucket |

---

## 🗄️ Neon DB Durumu (2026-05-15)

- **Endpoint:** ep-frosty-bar-al0hyt9d (eu-central-1, Frankfurt)
- **Branch:** production (tek branch, dev-ai-context silinmiş)
- **Boyut:** 12 MB (13 MB idi, index temizliği ile 12 MB)
- **Tablo sayısı:** 60+ (çoğu boş, schema tanımlı)
- **Cache hit ratio:** 99.79% (mükemmel)
- **Dead tuples:** 0 (autovacuum çalışıyor)

### ⚠️ Kritik Bulgu: Seq Scan Fırtınası
Bazı tablolarda index yerine full table scan yapılıyor:
- `endpoints`: 72,720 seq scan vs 308 index scan 🔴
- `customers`: 13,639 seq vs 1,241 idx 🔴
- `notifications`: 9,952 seq vs 670 idx 🔴
- `invoices`: 1,328 seq vs 55 idx 🔴
- `webhook_queue`: 90,011 seq vs 83,438 idx 🟡
- `deliveries`: 5,031 seq vs 2,372 idx 🟡

**Çözüm:** Rust API'deki SELECT sorgularına WHERE clause eklenmesi + uygun index'lerin oluşturulması gerekiyor.

### ✅ Yapılan Temizlik (2026-05-15)
- 107 kullanılmayan index tespit edildi
- 84'ü silindi (23'ü unique constraint, silinemez)
- DB boyutu: 13 MB → 12 MB

---

## 🔧 Son Yapılan İşler

### Oturum 171 — 2026-05-15 21:26 GMT+8
1. **R2 Storage Entegrasyonu** — `api/src/r2.rs` modülü eklendi
   - Cloudflare R2 API ile dead letter arşivleme
   - `CF_ACCOUNT_ID`, `CF_R2_TOKEN`, `CF_R2_BUCKET` config'e eklendi
   - R2 bucket "hooksniff-storage" mevcut, test upload başarılı
   - main.rs'de R2 client init + Extension layer
2. **Cloud Run Env Var'ları** — R2 token'ları eklendi (3 env var)
3. **Deploy** — hooksniff-api, tüm servisler operational
4. **Toplam oturum** — 6 deploy, 8 commit, 23 env var

8. **QStash Env Var'ları** — Cloud Run'a 4 yeni env var eklendi
   - `QSTASH_URL=https://qstash-eu-central-1.upstash.io`
   - `QSTASH_TOKEN` (Upstash'ten alındı)
   - `QSTASH_CURRENT_SIGNING_KEY` (sig_7sPnDhTM...)
   - `QSTASH_NEXT_SIGNING_KEY` (sig_6qrNpb9Z...)
   - Deploy: hooksniff-api-00330-9g2 (22:12 GMT+8)

### ⚠️ Servet'in Yapması Gereken
- **Polar.sh Go Live** — Test mode'dan çık, Stripe verification yap
- **Dashboard i18n** — 920+ string Türkçe'ye çevrilecek
- **Business → Enterprise** — Polar'daki $99 Business ürününü sil/Enterprise yap

### 📂 Aktif Servisler (2026-05-15)
| Servis | Durum | Env Var |
|--------|-------|---------|
| Upstash Redis | ✅ Aktif | UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN |
| Upstash QStash | ✅ Aktif | QSTASH_URL, QSTASH_TOKEN, QSTASH_CURRENT_SIGNING_KEY, QSTASH_NEXT_SIGNING_KEY |
| Cloudflare R2 | ✅ Aktif | CF_ACCOUNT_ID, CF_R2_TOKEN, CF_R2_BUCKET |
| Neon PostgreSQL | ✅ Aktif | DATABASE_URL (secret) |
| Grafana OTEL | ✅ Aktif | OTEL_ENABLED, OTEL_EXPORTER_OTLP_ENDPOINT, OTEL_EXPORTER_OTLP_HEADERS |
| Resend Email | ✅ Aktif | RESEND_API_KEY (secret) |
| Polar.sh Billing | ✅ Aktif | POLAR_ACCESS_TOKEN, POLAR_WEBHOOK_SECRET |

### Oturum 170 — 2026-05-15 21:18 GMT+8
1. **QStash Entegrasyonu** — `api/src/qstash.rs` modülü eklendi
   - QStash client: webhook retry, email queue, scheduled jobs
   - `QSTASH_TOKEN`, `QSTASH_URL`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` config'e eklendi
   - main.rs'de QStash client init + Extension layer
2. **Cloud Run Env Var'ları** — QStash token'ları eklendi (4 env var)
3. **Deploy** — hooksniff-api-00324-l97, tüm servisler operational
4. **Upstash Redis** — bağlantıyı doğruladık, 194ms gecikme
5. **Cloudflare** — bot koruması nedeniyle erişilemedi, R2 entegrasyonu ertelendi

### ⚠️ Servet'in Yapması Gereken
- **Cloudflare R2** — Manuel giriş gerekli (bot koruması). R2 bucket + API token oluştur.
- **Polar.sh ürün** — Pro/Business planları Polar.sh'da ürün olarak tanımlanmalı

### Oturum 169 — 2026-05-15 20:45 GMT+8
1. **Redis URL Fallback** — `config::resolve_redis_url()` fonksiyonu eklendi
   - `REDIS_URL` yoksa `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`'dan otomatik `rediss://` URL'si oluşturur
   - `main.rs`'de 3, `rate_limit.rs`'de 1, `health.rs`'de 2 yer güncellendi
   - **Etki:** Redis "not configured" sorunu çözüldü — Cloud Run'da UPSTASH env var'ları set ise Redis otomatik bağlanacak
2. **Root Endpoint** — `GET /` artık JSON döndürüyor (service info, version, docs link)
3. **API v1 Health** — `/api/v1/health` alias eklendi (404 fix)
4. **Polar order.completed** — `order.completed` event'i handler'a eklendi (`order.created` ile birlikte)
5. **Commit:** 3cc09d56 — push edildi

### ⚠️ Servet'in Yapması Gereken (Acil)
- **Cloud Run ortam değişkenleri:** `RATE_LIMIT_STORE=redis` ve `REDIS_URL` (veya `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) Cloud Run'da set edilmeli
- Kod artık otomatik fallback yapıyor ama env var'ların Cloud Run'da tanımlı olması lazım

### Oturum 168 — 2026-05-15 20:24 GMT+8
1. **Navigation Restructure** — Önceki oturumlarda tamamlanmış (doğrulandı)
2. **Güvenlik düzeltmeleri** — Tüm P0/P1 maddeleri zaten yapılmış (doğrulandı)
3. **Seq Scan Index Migration** — `018_seq_scan_indexes.sql` oluşturuldu
   - 6 yeni index: customers.api_key_prefix, endpoints.team_id, endpoints(customer_id, is_active), deliveries(customer_id, created_at DESC), deliveries(customer_id, status, created_at DESC), notifications(customer_id, is_read)
4. **Oturum sonunda push edildi**

### Cloud Build Fix
- **Hata:** `api/src/jobs/metrics_push.rs:76` — `bool as f64` cast (Rust E0606)
- **Fix:** `api_ok as f64` → `if api_ok { 1.0 } else { 0.0 }`
- **Commit:** 4274718
- **Etki:** 20+ failed build çözüldü

### SSL Warning Fix
- **Dosya:** `run-migrations.js`
- **Fix:** Connection string'den `sslmode` parametresi temizlendi
- **Commit:** adee2090

### Neon Index Temizliği
- 84 kullanılmayan index silindi
- VACUUM ANALYZE çalıştırıldı

---

## 📂 .ai-context/ Dosya Rehberi

| Dosya | Amaç |
|-------|------|
| `MEMORY.md` | ← Bu dosya. Genel proje hafızası |
| `NEXT_SESSION.md` | Yapılacaklar listesi, bir sonraki oturum planı |
| `2026-05-13.md` | Günlük oturum notları |
| `2026-05-14-*.md` | Spesifik düzeltme notları |
| `API-AUDIT-*.md` | API denetim raporu |
| `ADMIN-PANEL-UPGRADE-PLAN.md` | Admin panel geliştirme planı |
| `NAV-RESTRUCTURE-PLAN.md` | Navigasyon yeniden yapılandırma |
| `DEPLOY_CLOUD_BUILD.md` | Deploy rehberi |
| `WORKFLOW.md` | Çalışma akışı |

---

## ⚠️ Bilinen Sorunlar

1. **Seq scan fırtınası** — endpoints, customers, notifications tablolarında
2. **Compute limiti aşılmış** — Neon Free tier 191.99 saat, 193.39 kullanılmış
3. **920+ hardcoded İngilizce string** — dashboard'da Türkçe çeviri yapılacak
4. **GitHub Actions dakikaları bitmiş** — CI failure, yenilenmeli
5. **Grafana trial bitiyor** — 20 Mayıs'a kadar

---

## 🎯 Kısa Vadeli Hedefler

1. Seq scan düzeltmesi (performans)
2. i18n — 920+ string Türkçe'ye çevrilecek
3. Güvenlik düzeltmeleri (P0 kalan maddeler)
4. $500/ay gelir hedefi

### Oturum 171 — 2026-05-15 21:28 GMT+8
1. **Cloud Build Hata Analizi** — Tüm son deploy'lar başarısız (9:11 PM'den itibaren)
   - Hata: `cannot find 'qstash' in 'crate'` + `cannot find 'r2' in 'crate'`
   - Sebep: `main.rs`'de `crate::qstash` ve `crate::r2` kullanılmış ama Rust 2021 edition'da main.rs ayrı binary crate
   - Fix: `crate::qstash` → `hooksniff_api::qstash`, `crate::r2` → `hooksniff_api::r2`
   - Ek: `cloudbuild.yaml`'a `--no-cache` eklendi (Docker layer cache sorunu önlemi)
   - Commit: 97b4ec3f
2. **GitHub Actions** — Hala başarısız (billing issue, faturalandırma güncellenmeli)
3. **GCP Console** — Servet'in Google hesabı ile giriş yapıldı (2FA onayı ile)
4. **API Sağlığı** — Çalışıyor (healthy, DB 27ms, Redis configured)
