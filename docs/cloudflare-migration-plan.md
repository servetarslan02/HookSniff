# HookSniff — Servis Karşılaştırma ve Taşıma Planı

> Oluşturma: 2026-06-04
> Amaç: Mevcut servislerin free tier limitlerini karşılaştırmak ve Cloudflare'a taşıma planı yapmak

---

## 1. Mevcut Servisler ve Kullanım Durumu

| Servis | Ne İçin | Güncel Kullanım | Free Tier Limiti | Risk |
|--------|---------|-----------------|------------------|------|
| **Neon PostgreSQL** | Ana veritabanı | 33 MB | 0.5 GB | 🟢 Düşük |
| **Upstash Redis** | Cache, queue, rate limiting | Aktif | 10K cmd/gün | 🟡 Orta |
| **Vercel** | Dashboard hosting | Aktif | 100 GB bandwidth/ay | 🟢 Düşük |
| **GCP Cloud Run** | API + Worker | 2 servis | 2M istek/ay | 🟢 Düşük |
| **Cloudflare CDN** | DNS, DDoS koruması | Aktif | Sınırsız | 🟢 Yok |
| **Cloudflare R2** | Dosya depolama | Yeni eklendi | 10 GB, 1M write, 10M read/ay | 🟢 Düşük |
| **Firebase FCM** | Push notification | Yeni eklendi | Sınırsız (ücretsiz) | 🟢 Yok |
| **Sentry** | Error tracking | Aktif | 5K error/ay | 🟡 Orta |
| **Polar.sh** | Ödeme sistemi | Aktif | Per-transaction | 🟢 Yok |
| **Gmail API** | Email gönderimi | Aktif | 1M email/ay (service account) | 🟢 Düşük |
| **Render** | Eski API + Worker | Askıya alındı | Free tier | ⚪ Kullanılmıyor |

---

## 2. Cloudflare Free Tier — Detaylı Limitler

### R2 (Object Storage)
| Metrik | Free Tier | Paid ($5/ay) |
|--------|-----------|--------------|
| Storage | **10 GB/ay** | $0.015/GB |
| Class A ops (write) | **1M/ay** | $4.50/milyon |
| Class B ops (read) | **10M/ay** | $0.36/milyon |
| Egress (data out) | **Sınırsız ücretsiz** | Sınırsız ücretsiz |
| Delete operations | **Ücretsiz** | Ücretsiz |

### Workers (Serverless Functions)
| Metrik | Free Tier | Paid ($5/ay) |
|--------|-----------|--------------|
| İstek/gün | **100,000** | Sınırsız |
| CPU time/istek | **10ms** | 5 dk |
| Memory | **128 MB** | 128 MB |
| Worker boyutu | **3 MB (gzip)** | 10 MB |
| Worker sayısı | **100** | 500 |
| Subrequest/istek | **50** | 10,000 |
| Cron trigger | **5** | 250 |

### Workers KV (Key-Value Store)
| Metrik | Free Tier | Paid ($5/ay) |
|--------|-----------|--------------|
| Read/gün | **100,000** | Sınırsız |
| Write/gün (farklı key) | **1,000** | Sınırsız |
| Write/snıf (aynı key) | **1/sn** | 1/sn |
| Storage/account | **1 GB** | Sınırsız |
| Value boyutu | **25 MiB** | 25 MiB |

### D1 Database (SQLite)
| Metrik | Free Tier | Paid ($5/ay) |
|--------|-----------|--------------|
| Rows read/gün | **5M** | 25B/ay dahil |
| Rows write/gün | **100K** | 50M/ay dahil |
| Storage | **5 GB** | 5 GB dahil + $0.75/GB |
| Egress | **Ücretsiz** | Ücretsiz |

### Pages (Static Hosting)
| Metrik | Free Tier | Paid |
|--------|-----------|------|
| Build/ay | **500** | 5,000 |
| Dosya sayısı | **20,000** | 100,000 |
| Dosya boyutu | **25 MiB** | 25 MiB |
| Custom domain | **100** | 250 |
| Bandwidth | **Sınırsız** | Sınırsız |

### Queues (Message Queue)
| Metrik | Free Tier | Paid ($5/ay) |
|--------|-----------|--------------|
| Operations/gün | **10,000** | 1M/ay dahil |
| Message retention | **24 saat** | 4-14 gün |
| Message boyutu | **64 KB** | 64 KB |

---

## 3. Mevcut Servisler vs Cloudflare Karşılaştırması

### A. Vercel → Cloudflare Pages

| Konu | Vercel Free | CF Pages Free | Kazanan |
|------|-------------|---------------|---------|
| Bandwidth | 100 GB/ay | **Sınırsız** | 🏆 CF |
| Build | 1,000 dk/ay | 500 build/ay | Vercel |
| Dosya limiti | Sınırsız | 20,000 | Vercel |
| Cold start | Var | **Yok** | 🏆 CF |
| Edge network | 18 region | **335 data center** | 🏆 CF |
| Custom domain | 50 | 100 | 🏆 CF |
| ISR/SSR | ✅ | ❌ (Pages static) | Vercel |

**Sonuç:** Dashboard Next.js SSR kullandığı için Pages'e taşımak zor. Ama static asset'ler (logo, screenshot, doküman) R2'ye taşınabilir.

### B. Upstash Redis → Workers KV + Queues

| Konu | Upstash Free | CF KV Free | CF Queues Free |
|------|-------------|------------|----------------|
| Read/gün | 10K cmd | **100K** | - |
| Write/gün | 10K cmd | **1K** | 10K op |
| Storage | 256 MB | **1 GB** | - |
| Pub/Sub | ✅ | ❌ | ❌ |
| Lua scripting | ✅ | ❌ | ❌ |
| Atomic ops | ✅ | ❌ | ❌ |
| Message queue | ❌ | ❌ | ✅ (24h retention) |
| TTL support | ✅ | ✅ (min 60sn) | ✅ |

**Sonuç:** KV cache için yeterli ama Redis'in Pub/Sub ve Lua scripting'i Workers KV'da yok. Rate limiting (Lua INCR+EXPIRE) Redis'te kalmalı.

### C. Neon PostgreSQL → D1 Database

| Konu | Neon Free | D1 Free | Kazanan |
|------|-----------|---------|---------|
| Storage | 0.5 GB | **5 GB** | 🏆 D1 |
| Read/gün | Sınırsız | **5M rows** | Neon |
| Write/gün | Sınırsız | **100K rows** | Neon |
| PostgreSQL | ✅ | ❌ (SQLite) | Neon |
| SQLx compile-time | ✅ | ❌ | Neon |
| Connection pool | ✅ | Edge-native | D1 |
| Egress | 192 MB/gün | **Ücretsiz** | 🏆 D1 |

**Sonuç:** D1 storage olarak daha büyük ama SQLite. Mevcut Rust API PostgreSQL/sqlx ile yazıldığı için D1'e taşımak büyük refactor gerektirir. Ama analytics, logs gibi hafif tablolar D1'e taşınabilir.

### D. GCP Cloud Run → Cloudflare Workers

| Konu | Cloud Run Free | CF Workers Free | Kazanan |
|------|---------------|-----------------|---------|
| İstek/ay | 2M | **3M** (100K/gün) | 🏆 CF |
| CPU time | 360K GB-sn/ay | 10ms/istek | Cloud Run |
| Memory | 512 MB | 128 MB | Cloud Run |
| Cold start | 1-3 sn | **Yok** | 🏆 CF |
| Runtime | Herhangi bir dil | JS/WASM | Cloud Run |
| Max payload | 32 MB | **100 MB** | 🏆 CF |
| Cron | ✅ | ✅ (5 trigger) | Cloud Run |

**Sonuç:** Rust API'yi Workers'a taşımak çok zor (Rust → WASM derleme gerekli). Ama lightweight endpoint'ler (health check, webhook proxy, static API) Workers'a taşınabilir.

---

## 4. Taşıma Önerileri — Öncelik Sırası

### 🟢 Hemen Yapılabilir (Düşük Risk)

| # | İş | Neden | Tasarruf |
|---|---|-------|----------|
| 1 | **Static assets → R2** | Logo, screenshot, doküman dosyaları | Vercel bandwidth tasarrufu |
| 2 | **Cache → Workers KV** | API response cache, rate limit counters | Upstash read tasarrufu |
| 3 | **Health check → Workers** | /health endpoint'i Workers'a taşı | Cloud Run request tasarrufu |
| 4 | **Analytics → D1** | Hafif analytics tabloları | Neon storage tasarrufu |

### 🟡 Orta Vadede (Orta Risk)

| # | İş | Neden | Tasarruf |
|---|---|-------|----------|
| 5 | **Webhook payload arşiv → R2** | Egress ücretsiz (AWS $0.09/GB) | Büyük tasarruf |
| 6 | **Background jobs → Queues** | Email, notification kuyruğu | Upstash queue tasarrufu |
| 7 | **Landing page → Pages** | Static site, sınırsız bandwidth | Vercel bandwidth |
| 8 | **Email routing → CF Email** | Gelen email yönlendirme | Gmail API limit tasarrufu |

### 🔴 Zor / Uzun Vade (Yüksek Risk)

| # | İş | Neden | Not |
|---|---|-------|-----|
| 9 | **API → Workers** | Rust WASM derleme, 10ms CPU limiti | Çok zor |
| 10 | **DB → D1** | SQLite, mevcut PostgreSQL kodu uyumsuz | Büyük refactor |
| 11 | **Queue → CF Queues** | 24h retention, Lua scripting yok | Redis daha güçlü |

---

## 5. Güncel Maliyet Tablosu

### Mevcut (Tümü Free Tier)

| Servis | Aylık Maliyet | Limit Aşımı Riski |
|--------|--------------|-------------------|
| Neon PostgreSQL | $0 | 0.5 GB → %6 dolu |
| Upstash Redis | $0 | 10K cmd/gün → dikkatli kullanım |
| Vercel | $0 | 100 GB bandwidth |
| GCP Cloud Run | $0 | 2M istek/ay |
| Cloudflare CDN | $0 | Sınırsız |
| Cloudflare R2 | $0 | 10 GB storage |
| Firebase FCM | $0 | Sınırsız |
| Sentry | $0 | 5K error/ay |
| Polar.sh | %5 komisyon | Per-transaction |
| **Toplam** | **~$0/ay** | |

### Cloudflare'a Taşıma Sonrası (Tahmini)

| Servis | Aylık Maliyet | Kazanç |
|--------|--------------|--------|
| Neon PostgreSQL | $0 | Aynı |
| Upstash Redis | $0 | KV ile read tasarrufu |
| **Vercel → CF Pages** | $0 | Sınırsız bandwidth |
| GCP Cloud Run | $0 | Aynı |
| Cloudflare R2 | $0 | Egress ücretsiz |
| Workers KV | $0 | 100K read/gün |
| D1 (analytics) | $0 | 5 GB storage |
| **Toplam** | **~$0/ay** | Daha yüksek limitler |

---

## 6. Risk Analizi

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Workers CPU limiti aşımı | Düşük | Yüksek | CPU-intensive işleri Cloud Run'da tut |
| KV write limiti aşımı | Orta | Düşük | Rate limiting Redis'te kalsın |
| D1 write limiti aşımı | Düşük | Orta | Analytics tabloları zaten düşük write |
| R2 storage limiti | Düşük | Düşük | 10 GB yeterli, lifecycle policy ile temizle |
| Vendor lock-in | Orta | Orta | R2 S3-uyumlu, KV standart API |

---

## 7. Özet — Ne Yapmalı?

### Hemen Yap (Bu Hafta)
1. ✅ R2 credentials eklendi (tamamlandı)
2. ✅ Firebase FCM kuruldu (tamamlandı)
3. Static asset'leri R2'ye taşı (logo, screenshot)
4. Workers KV ile API response cache

### Kısa Vadede (Bu Ay)
5. Landing page'i Pages'e taşı
6. Health check endpoint'ini Workers'a taşı
7. Analytics tablolarını D1'e taşı

### Orta Vadede (Gelecek Ay)
8. Webhook payload arşivleme → R2
9. Background jobs → Queues
10. Email routing → CF Email

### Uzun Vadede (Gelecek Quarter)
11. API'nin bir kısmını Workers'a taşı (mümkünse)
12. D1 ile read replica stratejisi
