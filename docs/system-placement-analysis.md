# HookSniff — Sistem Yerleşim Analizi

> Tarih: 2026-06-04
> Amaç: Her servisin nerede olması gerektiğini belirlemek

---

## Mevcut Durum vs Önerilen Yer

| Servis | Şu An Nerede | Nerede Olmalı | Değişiklik |
|--------|-------------|---------------|-----------|
| **Rust API** | GCP Cloud Run | **GCP Cloud Run** ✅ | Kal |
| **Rust Worker** | GCP Cloud Run | **GCP Cloud Run** ✅ | Kal |
| **Dashboard (Next.js)** | Vercel | **Vercel** ✅ | Kal |
| **PostgreSQL** | Neon | **Neon** ✅ | Kal |
| **Redis** | Upstash | **Upstash** ✅ | Kal |
| **Static Assets** | Vercel | **Cloudflare R2** 🔄 | Taşı |
| **API Cache** | Upstash Redis | **Workers KV** 🔄 | Taşı |
| **Health Check** | Cloud Run | **Cloudflare Workers** 🔄 | Taşı |
| **Analytics DB** | PostgreSQL | **Cloudflare D1** 🔄 | Taşı |
| **Landing Page** | Vercel | **Cloudflare Pages** 🔄 | Taşı |
| **Webhook Arşiv** | Yok | **Cloudflare R2** 🆕 | Yeni |
| **Email** | Gmail API | **Gmail API** ✅ | Kal |
| **Error Tracking** | Sentry | **Sentry** ✅ | Kal |
| **Payments** | Polar.sh | **Polar.sh** ✅ | Kal |
| **Push Notifications** | Firebase | **Firebase** ✅ | Kal |
| **CDN/DNS** | Cloudflare | **Cloudflare** ✅ | Kal |
| **Eski API** | Render | **Sil** ❌ | Sil |
| **Eski Worker** | Render | **Sil** ❌ | Sil |

---

## Her Servis İçin Detaylı Analiz

### 1. Rust API → GCP Cloud Run ✅ KALMALI

**Neden Cloud Run'da kalmalı:**
- Rust kodu 22K satır, Workers 10ms CPU limiti ile çalışmaz
- sqlx compile-time SQL checking sadece PostgreSQL ile çalışır
- Axum middleware ecosystem (tower) sadece Rust runtime'da çalışır
- Cloud Run free tier: 2M istek/ay, 360K GB-saniye — yeterli
- Cold start 1-3 sn ama istek geldiğinde aktif oluyor

**Neden Workers'a taşınamaz:**
- 10ms CPU limiti: Her istek ortalama 45ms sürüyor
- Rust → WASM derleme karmaşık ve performans kaybı var
- sqlx, redis crate'leri WASM'da çalışmaz

### 2. Rust Worker → GCP Cloud Run ✅ KALMALI

**Neden:**
- Worker webhook delivery yapıyor, retry/backoff logic var
- Redis Lua scripting kullanıyor (rate limiting)
- Uzun süren işler var (batch replay)
- Cloud Run'da kalmalı

### 3. Dashboard (Next.js 16) → Vercel ✅ KALMALI

**Neden Vercel'de kalmalı:**
- Next.js 16 SSR/ISR Vercel'de native çalışıyor
- App Router, Server Components, Streaming SSR
- Vercel free tier: 100 GB bandwidth, 1000 build dk/ay
- Turbopack desteği Vercel'de en iyi

**Neden Pages'e taşınamaz:**
- Cloudflare Pages sadece static site destekler
- Next.js SSR/ISR Pages'de çalışmaz
- `@cloudflare/next-on-pages` var ama karmaşık ve limitli

### 4. PostgreSQL → Neon ✅ KALMALI

**Neden Neon'da kalmalı:**
- 33 MB kullanıyor, 500 MB free tier — %6.6 doluluk
- sqlx compile-time checking PostgreSQL ile çalışır
- Neon serverless, connection pooling dahil
- Branching özelliği (test DB kopyası)

**Neden D1'e taşınamaz:**
- D1 SQLite, PostgreSQL'in tüm özelliklerini desteklemez
- JSONB, advisory lock, PERCENTILE_CONT yok
- sqlx sadece PostgreSQL/MySQL destekler
- Mevcut tüm migration'lar PostgreSQL syntax

**Ama D1'e taşınabilir:**
- Analytics tabloları (hafif, sorgu basit)
- Audit log (write-heavy, okuma nadir)
- Session store (basit key-value)

### 5. Redis → Upstash ✅ KALMALI

**Neden Upstash'te kalmalı:**
- Lua scripting: Rate limiting (INCR+EXPIRE atomik)
- Pub/Sub: Real-time event yayını
- Queue: Background job processing
- Upstash free tier: 10K cmd/gün — dikkatli kullanım gerektirir

**Neden Workers KV ile değiştirilemez:**
- KV'da Lua scripting yok → rate limiting bozulur
- KV'da Pub/Sub yok → real-time events bozulur
- KV'da atomic ops yok → race condition riski

**Ama KV ile desteklenebilir:**
- API response cache → KV (100K read/gün, Upstash'ten 10x fazla)
- Config cache → KV (nadiren değişen ayarlar)
- Endpoint metadata cache → KV

### 6. Static Assets → Cloudflare R2 🔄 TAŞINMALI

**Neden R2'ye taşınmalı:**
- Logo, screenshot, doküman, OG image dosyaları
- R2 free: 10 GB storage, 1M write, 10M read/ay
- **Egress ücretsiz** (Vercel'de 100 GB limit var)
- S3-uyumlu API, mevcut tool'larla uyumlu

**Nasıl taşınır:**
1. Dashboard'daki `/public` klasöründeki statik dosyaları R2'ye yükle
2. R2 public bucket oluştur
3. `static.hooksniff.vercel.app` → `static.hooksniff.com` (R2)
4. Next.js `next.config.js`'de `images.domains` güncelle

### 7. API Cache → Workers KV 🔄 TAŞINMALI

**Neden KV'ye taşınmalı:**
- API response cache (GET istekleri)
- Endpoint metadata cache (nadiren değişen veri)
- KV free: 100K read/gün (Upstash 10K cmd/gün'den 10x fazla)
- Edge'de çalışır, daha düşük latency

**Nasıl taşınır:**
1. Cloudflare Workers'da bir cache proxy yaz
2. API istekleri önce KV'ye bak, miss ise Cloud Run API'ye git
3. KV'ye yaz, TTL ile otomatik temizle

**Dikkat:**
- KV write limiti: 1,000/gün (farklı key) — write-heavy cache için uygun değil
- Rate limiting Redis'te kalmalı (Lua scripting gerekli)

### 8. Health Check → Cloudflare Workers 🔄 TAŞINMALI

**Neden Workers'a taşınmalı:**
- `/health` endpoint'i basit bir kontrol
- Workers free: 100K istek/gün — fazlasıyla yeterli
- Cold start yok, her zaman hızlı
- Cloud Run'dan bir istek tasarrufu

**Nasıl taşınır:**
1. Basit bir Worker yaz: Cloud Run API'ye fetch, sonucu döndür
2. `health.hooksniff.com` domain'ini Worker'a yönlendir
3. Monitoring araçları bu URL'yi kullansın

### 9. Analytics DB → Cloudflare D1 🔄 TAŞINMALI

**Neden D1'e taşınmalı:**
- Analytics tabloları hafif (delivery trends, success rates)
- D1 free: 5 GB storage, 5M read/gün, 100K write/gün
- Edge'de çalışır, dashboard'dan hızlı sorgu
- PostgreSQL'den ayrılarak ana DB yükü azalır

**Nasıl taşınır:**
1. Analytics tablolarını D1'e taşı (delivery_stats, endpoint_health)
2. Worker'da D1 binding kullan
3. Dashboard analytics sayfası D1'den okusun
4. Ana DB sadece transactional veri tutsun

**Dikkat:**
- D1 SQLite → PostgreSQL syntax uyumsuzluğu
- Mevcut SQL sorgularını D1 syntax'ına çevirmek gerekli
- Write limiti 100K/gün → analytics için yeterli

### 10. Landing Page → Cloudflare Pages 🔄 TAŞINMALI

**Neden Pages'e taşınmalı:**
- Landing page tamamen static (SSR yok)
- Pages free: Sınırsız bandwidth, 500 build/ay
- 335 data center'da deploy (Vercel 18 region)
- Cold start yok

**Nasıl taşınır:**
1. Landing page'i ayrı bir Next.js projesi yap (static export)
2. `npx next export` ile static HTML oluştur
3. Pages'e deploy et
4. `hooksniff.com` domain'ini Pages'e yönlendir

### 11. Webhook Arşiv → Cloudflare R2 🆕 YENİ

**Neden R2'ye arşivlemeli:**
- Webhook payload'larını arşivlemek gerekebilir (debugging, compliance)
- R2 egress ücretsiz → müşteriler arşiv indirdiğinde maliyet yok
- S3-uyumlu → mevcut tool'larla uyumlu
- Lifecycle policy ile eski dosyaları otomatik temizle

### 12-15. Email, Sentry, Polar, Firebase ✅ KALMALI

Hepsi iyi çalışıyor, free tier'da, değiştirmeye gerek yok.

### 16-17. Render Servisleri ❌ SİLİNMELİ

**Neden silinmeli:**
- GCP Cloud Run'a geçildi
- Free tier'da olsa bile gereksiz karmaşıklık
- GitHub repo linkleri hâlâ aktif (auto-deploy tetikleyebilir)

---

## Özet — Nerede Ne Olmalı

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare (Free)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Pages   │  │ Workers  │  │    R2    │  │   D1    │ │
│  │ Landing  │  │  Health  │  │ Assets   │  │Analytics│ │
│  │  Page    │  │  Cache   │  │ Archive  │  │  Logs   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   CDN    │  │    KV    │  │  Queues  │              │
│  │   DNS    │  │  Cache   │  │  Jobs    │              │
│  │   SSL    │  │          │  │          │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 GCP Cloud Run (Free)                     │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │     Rust API         │  │    Rust Worker       │    │
│  │  (Axum, 22K lines)   │  │  (Webhook delivery)  │    │
│  │  Auth, CRUD, Logic   │  │  Retry, Backoff      │    │
│  └──────────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Diğer Servisler (Free)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Vercel  │  │  Neon    │  │ Upstash  │  │ Sentry  │ │
│  │Dashboard │  │PostgreSQL│  │  Redis   │  │  Error  │ │
│  │ Next.js  │  │  33 MB   │  │  Cache   │  │Tracking │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Firebase │  │  Polar   │  │  Gmail   │              │
│  │   FCM    │  │ Payments │  │  Email   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## Taşıma Sırası (Öncelik)

| # | İş | Zorluk | Süre | Kazanç |
|---|---|--------|------|--------|
| 1 | Render servislerini sil | ⭐ | 5 dk | Karmaşıklık azalır |
| 2 | Static assets → R2 | ⭐⭐ | 30 dk | Egress tasarrufu |
| 3 | Health check → Workers | ⭐⭐ | 1 sa | Cloud Run tasarrufu |
| 4 | API cache → KV | ⭐⭐⭐ | 2 sa | Read limit 10x artar |
| 5 | Landing page → Pages | ⭐⭐⭐ | 3 sa | Sınırsız bandwidth |
| 6 | Analytics → D1 | ⭐⭐⭐⭐ | 1 gün | Ana DB yükü azalır |
| 7 | Webhook arşiv → R2 | ⭐⭐⭐ | 2 sa | Debugging kolaylığı |

---

## Risk Değerlendirmesi

| Risk | Olasılık | Etki | Çözüm |
|------|----------|------|-------|
| Workers CPU aşımı | Düşük | Yüksek | Sadece hafif işler için kullan |
| KV write limiti | Orta | Düşük | Write-heavy işler Redis'te kalsın |
| D1 uyumsuzluk | Orta | Orta | Sadece yeni tablolar için D1 kullan |
| R2 storage limiti | Düşük | Düşük | 10 GB yeterli, lifecycle policy |
| Vendor lock-in | Düşük | Orta | S3-uyumlu R2, standart API |

---

## Sonuç

**Mevcut yerleşim %85 doğru.** Rust API, Worker, Dashboard, PostgreSQL, Redis hepsi doğru yerde.

**Taşınması gerekenler:**
1. Static assets → R2 (en kolay, en büyük kazanç)
2. API cache → KV (Orta zorluk, 10x read limit artışı)
3. Landing page → Pages (Orta zorluk, sınırsız bandwidth)
4. Analytics → D1 (Zor, ama uzun vadede değerli)

**Silinmesi gerekenler:**
1. Render API servisi
2. Render Worker servisi
