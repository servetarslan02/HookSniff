# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-15 20:20 GMT+8
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
