# HookSniff — Disaster Recovery Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı)
> Durum: Taslak
> Kaynaklar: Veeam RTO/RPO Guide 2026, Neon PITR Docs, Neon Plans, GCP Cold Standby Architecture (Medium 2026), Atlassian Postmortem Template, Cloudflare R2 Docs, Upstash Docs

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Temel Kavramlar: RTO ve RPO](#2-temel-kavramlar-rto-ve-rpo)
3. [HookSniff RTO/RPO Hedefleri](#3-hooksniff-rtorpo-hedefleri)
4. [Bileşen Bazlı Risk Analizi](#4-bileşen-bazlı-risk-analizi)
5. [Veri Tabanlı Kurtarma Stratejisi (PostgreSQL)](#5-veri-tabanlı-kurtarma-stratejisi-postgresql)
6. [Önbellek ve Kuyruk Kurtarma (Redis)](#6-önbellek-ve-kuyruk-kurtarma-redis)
7. [Uygulama Katmanı Kurtarma (Cloud Run)](#7-uygulama-katmanı-kurtarma-cloud-run)
8. [Frontend Kurtarma (Vercel)](#8-frontend-kurtarma-vercel)
9. [Dosya Depolama Kurtarma (Cloudflare R2)](#9-dosya-depolama-kurtarma-cloudflare-r2)
10. [E-posta Servisi Kurtarma](#10-e-posta-servisi-kurtarma)
11. [Full-Stack Kurtarma Senaryoları](#11-full-stack-kurtarma-senaryoları)
12. [Otomatik Yedekleme Planı](#12-otomatik-yedekleme-planı)
13. [Failover ve Failback Prosedürleri](#13-failover-ve-failback-prosedürleri)
14. [İletişim Planı](#14-iletişim-planı)
15. [Post-Mortem Şablonu](#15-post-mortem-şablonu)
16. [Periyodik DR Test Planı](#16-periyodik-dr-test-planı)
17. [Maliyet Analizi](#17-maliyet-analizi)
18. [Uygulama Planı](#18-uygulama-planı)
19. [Risk Matrisi](#19-risk-matrisi)
20. [Kaynaklar](#20-kaynaklar)

---

## 1. Mevcut Durum

### 1.1 HookSniff Altyapı Haritası

```
┌─────────────────────────────────────────────────────────────┐
│                     KULLANICI (Browser)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │     Cloudflare CDN      │  ← Free tier
          │     (DNS + Proxy)       │
          └────────────┬────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌──────────┐   ┌──────────────┐  ┌──────────┐
│ Vercel   │   │ Cloud Run    │  │ Cloud Run│
│ Dashboard│   │ API (Rust)   │  │ Worker   │
│ (Next.js)│   │ europe-west1 │  │ europe-w │
└──────────┘   └──────┬───────┘  └────┬─────┘
                      │               │
          ┌───────────┼───────────────┘
          │           │
          ▼           ▼
   ┌───────────┐ ┌──────────┐
   │ Neon DB   │ │ Upstash  │
   │ PostgreSQL│ │ Redis    │
   │ eu-centr-1│ │ Serverless│
   └───────────┘ └──────────┘
          │
          ▼
   ┌───────────┐
   │ Cloudflare│
   │ R2 Storage│
   └───────────┘
```

### 1.2 Mevcut Yedekleme Durumu

| Bileşen | Servis | Mevcut Yedekleme | Bölge | Durum |
|---------|--------|-----------------|-------|-------|
| Database | Neon PostgreSQL | ✅ PITR (WAL-based) | eu-central-1 | İyi |
| Cache/Queue | Upstash Redis | ✅ Otomatik replikasyon | Serverless | İyi |
| Uygulama Kodu | GitHub | ✅ Git history | Global | İyi |
| Dosyalar | Cloudflare R2 | ❌ Cross-region yok | Tek bölge | ⚠️ Risk |
| Dashboard | Vercel | ✅ Git-based deploy | Global CDN | İyi |
| API/Worker | Cloud Run | ✅ Git-based deploy | europe-west1 | İyi |
| Secrets | GCP Secret Manager | ✅ Built-in replication | Regional | İyi |
| Monitoring | Grafana Cloud | ✅ Cloud-managed | Global | İyi |

### 1.3 Kritik Eksiklikler

| # | Eksik | Etki | Öncelik |
|---|-------|------|---------|
| 1 | R2 cross-region replication yok | Bölge kesintisinde dosya kaybı | 🔴 Yüksek |
| 2 | Otomatik DB snapshot zamanlaması belirsiz | Veri kaybı riski | 🔴 Yüksek |
| 3 | Failover prosedürü dokümante edilmemiş | Kurtarma süresi uzar | 🔴 Yüksek |
| 4 | Incident communication planı yok | Müşteri güveni kaybı | 🟡 Orta |
| 5 | DR test planı yok | Kurtarma güvenilirliği bilinmiyor | 🟡 Orta |
| 6 | Monitoring alert escalation yok | Sorun geç fark edilir | 🟡 Orta |

---

## 2. Temel Kavramlar: RTO ve RPO

> Kaynak: Veeam RTO vs RPO Guide (2026-01-05, doğrulanmış)

### 2.1 RPO (Recovery Point Objective)

**Tanım:** Kesinti anından geriye doğru ölçülen, kabul edilebilir **maksimum veri kaybı** süresi.

**Örnek:** RPO = 15 dakika → Son 15 dakikanın verisi kaybolabilir, ama daha fazlası değil.

**Ne belirler:** Yedekleme sıklığı. RPO ne kadar düşükse, yedekleme o kadar sık olmalı.

### 2.2 RTO (Recovery Time Objective)

**Tanım:** Kesinti anından ileriye doğru ölçülen, sistemin **maksimum offline kalma** süresi.

**Örnek:** RTO = 1 saat → Kesinti başladıktan sonra en geç 1 saat içinde sistem çalışır durumda olmalı.

**Ne belirler:** Kurtarma altyapısı ve otomasyon seviyesi.

### 2.3 RPO vs RTO Karşılaştırması

| Metrik | Odak | Ölçüm | Belirleyici | Maliyet Etkisi |
|--------|------|-------|-------------|---------------|
| **RPO** | Veri kaybı toleransı | Kesinti öncesi süre | Yedekleme sıklığı | Düşük RPO → daha sık backup → daha pahalı |
| **RTO** | Downtime toleransı | Kesinti sonrası süre | Altyapı + otomasyon | Düşük RTO → daha fazla redundancy → daha pahalı |

### 2.4 İlişkili Metrikler

| Metrik | Tanım | HookSniff Açısından |
|--------|-------|---------------------|
| **RTO** | Ne kadar sürede geri döneriz? | Sistem kurtarma süresi |
| **RPO** | Ne kadar veri kaybedebiliriz? | Son yedekleme ile kesinti arası |
| **MTTD** (Mean Time to Detect) | Sorunu ne kadar sürede fark ederiz? | Monitoring + alert süresi |
| **MTTR** (Mean Time to Recover) | Geri dönüş ortalama süresi | Kurtarma prosedürü süresi |
| **MTBF** (Mean Time Between Failures) | Kesintiler arası ortalama süre | Sistem güvenilirliği |

---

## 3. HookSniff RTO/RPO Hedefleri

### 3.1 Bileşen Bazlı Hedefler

| Bileşen | RPO Hedefi | RTO Hedefi | Gerekçe |
|---------|-----------|-----------|---------|
| **PostgreSQL (Neon)** | ≤ 5 dakika | ≤ 15 dakika | Webhook delivery kayıtları kritik |
| **Redis (Upstash)** | ≤ 1 saat | ≤ 5 dakika | Cache yeniden oluşturulabilir |
| **API (Cloud Run)** | N/A (stateless) | ≤ 5 dakika | Git deploy + rollback |
| **Worker (Cloud Run)** | N/A (stateless) | ≤ 5 dakika | Git deploy + rollback |
| **Dashboard (Vercel)** | N/A (stateless) | ≤ 2 dakika | Git deploy + rollback |
| **R2 Storage** | ≤ 1 saat | ≤ 30 dakika | Payload logları |
| **Secrets** | 0 (anında replike) | ≤ 1 dakika | GCP Secret Manager |

### 3.2 Sektör Karşılaştırması

| Metrik | HookSniff Hedefi | SaaS Endüstri Standardı | Svix (Tahmini) |
|--------|-----------------|------------------------|----------------|
| RPO (DB) | ≤ 5 dk | 15-60 dk | ≤ 1 dk (managed) |
| RTO (Full) | ≤ 30 dk | 1-4 saat | ≤ 15 dk |
| Uptime SLA | %99.9 | %99.5-99.9 | %99.99 |

> **Not:** HookSniff $0/ay bütçeyle çalıştığı için, ücretsiz tier'ların sınırları RTO/RPO'yu belirler. Neon Free: 0.5 GB storage, PITR limited. Upstash Free: 10K komut/gün.

---

## 4. Bileşen Bazlı Risk Analizi

### 4.1 Risk Matrisi

| Risk | Olasılık | Etki | Risk Skoru | Mitigasyon |
|------|----------|------|-----------|------------|
| Neon DB bölgesel kesinti | Düşük | Kritik | 🟡 Orta | PITR + snapshot export |
| Cloud Run bölgesel kesinti | Düşük | Yüksek | 🟡 Orta | Multi-region deploy |
| Vercel kesinti | Düşük | Orta | 🟢 Düşük | Static export fallback |
| Upstash Redis kesinti | Orta | Düşük | 🟢 Düşük | In-memory fallback (zaten var) |
| R2 bölgesel kesinti | Düşük | Orta | 🟡 Orta | Cross-region replication |
| GitHub kesinti | Düşük | Düşük | 🟢 Düşük | Local git clone |
| Cloudflare kesinti | Düşük | Yüksek | 🟡 Orta | Direct DNS fallback |
| İnsan hatası (veri silme) | Orta | Kritik | 🔴 Yüksek | PITR + snapshot + audit log |
| Güvenlik ihlali | Düşük | Kritik | 🔴 Yüksek | Incident response planı |
| Fatura ödenmez (servis kapanır) | Düşük | Kritik | 🟡 Orta | Budget alert + auto-pay |

### 4.2 Tek Nokta Hatası (SPOF) Analizi

| Bileşen | SPOF mi? | Mevcut Koruma | Ek Gerekli mi? |
|---------|----------|---------------|----------------|
| Neon DB | Evet (tek bölge) | PITR + branch | 🟡 Snapshot export |
| Cloud Run API | Hayır | Git deploy, auto-restart | 🟢 Yeterli |
| Upstash Redis | Hayır | In-memory fallback | 🟢 Yeterli |
| Vercel | Hayır | Global CDN, Git deploy | 🟢 Yeterli |
| R2 Storage | Evet (tek bölge) | Bucket-level replication | 🔴 Cross-region |
| Cloudflare | Hayır | Global network | 🟢 Yeterli |

---

## 5. Veri Tabanlı Kurtarma Stratejisi (PostgreSQL)

> Kaynak: Neon Backup & Restore Docs, Neon PITR Docs (doğrulanmış 2026-05-10)

### 5.1 Neon Free Tier Yedekleme Kapasitesi

| Özellik | Free Plan | Launch Plan ($0.106/CU-saat) | Scale Plan ($0.222/CU-saat) |
|---------|-----------|------------------------------|----------------------------|
| Storage | 0.5 GB | $0.35/GB-ay | $0.35/GB-ay |
| PITR (restore window) | 1 gün | 7 gün | 30 gün |
| Manuel snapshot | 1 | 10 | 10+ |
| Otomatik snapshot planı | ❌ | ✅ | ✅ |
| Snapshot maliyeti | $0.09/GB-ay | $0.09/GB-ay | $0.09/GB-ay |
| Instant restore | ❌ | ✅ | ✅ |
| Branch restore | ✅ (CLI) | ✅ (CLI + API) | ✅ (CLI + API) |

### 5.2 Kurtarma Yöntemleri

#### Yöntem 1: PITR (Point-in-Time Restore) — Anında

```bash
# Neon CLI ile belirli bir zamana geri dön
neon branches restore main ^self@2026-05-10T02:00:00Z --preserve-under-name main_old

# API ile
curl -X POST "https://console.neon.tech/api/v2/projects/{project_id}/branches/{branch_id}/restore" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"source_branch_id": "main", "target_timestamp": "2026-05-10T02:00:00Z"}'
```

**Neon Free tier'da PITR:** 1 gün restore window. Yani son 24 saat içinde herhangi bir zamana geri dönebilirsiniz.

#### Yöntem 2: Snapshot Restore — Manuel

```bash
# Neon Console → Backup & Restore → Snapshot oluştur → Restore
# veya API ile
curl -X POST "https://console.neon.tech/api/v2/projects/{project_id}/branches" \
  -H "Authorization: Bearer $NEON_API_KEY" \
  -d '{"branch": {"parent_id": "main", "name": "restore-2026-05-10"}}'
```

#### Yöntem 3: pg_dump Export — Harici Backup

```bash
# Günlük harici backup (crontab veya OpenClaw cron)
pg_dump $DATABASE_URL --format=custom --compress=9 --file=hooksniff_$(date +%Y%m%d).dump

# R2'ye yükle
aws s3 cp hooksniff_$(date +%Y%m%d).dump s3://hooksniff-backups/ --endpoint-url=$R2_ENDPOINT
```

### 5.3 Kurtarma Karar Ağacı

```
Veri kaybı tespit edildi
         │
         ▼
    Son 24 saat içinde mi?
    (Neon Free: 1 gün PITR)
         │
    ┌────┴────┐
    │         │
   Evet       Hayır
    │         │
    ▼         ▼
  PITR      Snapshot'tan mı?
  (anında)      │
         ┌─────┴─────┐
         │           │
        Evet         Hayır
         │           │
         ▼           ▼
    Snapshot      pg_dump'dan
    restore       geri yükle
    (dakikalar)   (saatler)
```

### 5.4 Neon DB Kurtarma Adımları (Detaylı)

#### Senaryo 1: Yanlışlıkla Veri Silme (RPO ≤ 24 saat)

1. Neon Console → Branches → production branch
2. Backup & Restore → Tarih/saat seç (silme öncesi)
3. "Preview Data" ile doğrula
4. "Restore" butonuna bas
5. Mevcut branch `_old_` olarak saklanır (otomatik)
6. API'yi restart et (Cloud Run otomatik reconnect)

**Süre:** 2-5 dakika (Neon instant restore)

#### Senaryo 2: Neon Bölgesel Kesinti

1. Neon Console'dan farklı bölgeye yeni branch oluştur (mümkünse)
2. Değilse, pg_dump backup'tan yeni Neon project'e geri yükle
3. DATABASE_URL environment variable güncelle (Cloud Run + Vercel)
4. API'yi redeploy et

**Süre:** 15-60 dakika

#### Senaryo 3: Neon Hesap Sorunu

1. pg_dump backup'tan alternatif PostgreSQL servisine yükle (Supabase, Railway, vb.)
2. DATABASE_URL güncelle
3. Redeploy

**Süre:** 30-120 dakika

---

## 6. Önbellek ve Kuyruk Kurtarma (Redis)

### 6.1 Mevcut Durum

HookSniff'te Redis 2 amaçlı kullanılıyor:
1. **Cache:** Rate limit counters, session data
2. **Queue:** Webhook delivery queue (worker'a job gönderme)

### 6.2 Upstash Yedekleme

| Özellik | Free Plan | Pay As You Go |
|---------|-----------|---------------|
| Persistence | ✅ Disk-backed | ✅ Disk-backed |
| Replikasyon | ✅ Otomatik | ✅ Multi-region opsiyonel |
| Backup | ❌ Manuel yok | ✅ Snapshot |
| Max boyut | 256 MB | 1 GB+ |

### 6.3 Redis Kurtarma Stratejisi

**Önemli:** Redis HookSniff'te kritik veri saklamıyor. In-memory fallback zaten var (API'de `rate_limit.rs`).

| Senaryo | Kurtarma | Süre |
|---------|----------|------|
| Upstash bölgesel kesinti | In-memory fallback otomatik devreye girer | 0 dk (otomatik) |
| Upstash hesap sorunu | Yeni Upstash project + env var güncelle | 15 dk |
| Redis veri kaybı | Rate limit counters sıfırlanır, queue yeniden oluşturulur | 0 dk (otomatik) |

**Kritik not:** Webhook delivery queue'su Redis'te tutuluyorsa ve Redis çökerse:
- Pending webhook'lar kaybolabilir
- Worker, API'den yeni job alarak devam eder
- Customer webhook'ları replay ile yeniden gönderilebilir

---

## 7. Uygulama Katmanı Kurtarma (Cloud Run)

### 7.1 Mevcut Durum

| Servis | Bölge | Min Instance | Max Instance | Deploy |
|--------|-------|-------------|-------------|--------|
| API | europe-west1 | 0 (cold start) | 10 | GitHub Actions → Cloud Build |
| Worker | europe-west1 | 0 (cold start) | 10 | GitHub Actions → Cloud Build |

### 7.2 Kurtarma Yöntemleri

#### Yöntem 1: Rollback (En Hızlı)

```bash
# Son bilinen iyi revision'a dön
gcloud run services update-traffic hooksniff-api \
  --to-revisions=REVISION_NAME=100 \
  --region=europe-west1
```

**Süre:** 1-2 dakika

#### Yöntem 2: Redeploy

```bash
# GitHub'dan son stable commit'i deploy et
git checkout <stable-commit-hash>
gcloud builds submit --config=cloudbuild.yaml
```

**Süre:** 5-10 dakika

#### Yöntem 3: Multi-Region Failover (İleri Seviye)

```
Mevcut: europe-west1 (tek bölge)
Hedef: europe-west1 + europe-north1 (ikincil bölge)

Adımlar:
1. Cloud Load Balancer kur (GCP HTTP(S) LB)
2. europe-west1 → primary backend
3. europe-north1 → standby backend (0 instance)
4. Failover script: standby'yı aktif et, primary'yi kapat
```

**Not:** Bu $0 bütçeyi aşar. GCP free tier'da multi-region LB ücretsiz değil ($18+/ay). Şimdilik tek bölge yeterli.

### 7.3 Cloud Run Kurtarma Senaryoları

| Senaryo | Kurtarma | Süre |
|---------|----------|------|
| Deploy hatası (bozuk kod) | GitHub'dan rollback | 2 dk |
| Bölgesel GCP kesintisi | Farklı bölgeye redeploy | 15 dk |
| Hesap askıya alma | GCP support + alternatif deploy | 1-24 saat |
| Rate limit (free tier aşıldı) | Plan upgrade veya bekleme | Saatlik reset |

---

## 8. Frontend Kurtarma (Vercel)

### 8.1 Mevcut Durum

| Özellik | Durum |
|---------|-------|
| Deploy | Git-based (GitHub push → auto-deploy) |
| CDN | Global (Edge network) |
| Rollback | ✅ Vercel Dashboard'dan tek tıkla |
| Preview deploy | ✅ Her PR için ayrı URL |
| Free tier limiti | 100 deploy/gün |

### 8.2 Kurtarma Senaryoları

| Senaryo | Kurtarma | Süre |
|---------|----------|------|
| Build hatası | Git rollback + redeploy | 2 dk |
| Vercel kesinti | Static export → Cloudflare Pages fallback | 30 dk |
| Deploy limiti aşıldı | Ertesi gün sıfırlanır veya plan upgrade | 0-24 saat |
| Domain sorunu | DNS fallback (Cloudflare direct) | 5 dk |

### 8.3 Emergency Static Export

```bash
# Vercel çökerse, dashboard'u statik olarak export et
cd dashboard
npm run build
npm run export  # next export → out/ klasörü

# Cloudflare Pages'e deploy
npx wrangler pages deploy out/ --project-name=hooksniff-emergency
```

---

## 9. Dosya Depolama Kurtarma (Cloudflare R2)

### 9.1 Mevcut Durum

| Özellik | Durum |
|---------|-------|
| Bucket | hooksniff-storage |
| Bölge | Tek bölge (auto-selected) |
| Cross-region replication | ❌ Yok |
| Versioning | ❌ Yok |
| Free tier | 10 GB storage, 10M read/ay, 1M write/ay |

### 9.2 Kurtarma Stratejisi

#### Seçenek 1: R2 Cross-Region Replication (Önerilen)

Cloudflare R2, cross-region replication destekler (2024+). Ancak free tier'da sınırlı olabilir.

```bash
# R2 bucket replication kuralı
# Cloudflare Dashboard → R2 → hooksniff-storage → Replication
# Hedef: farklı region'da ikinci bucket
```

**Maliyet:** $0 (R2 free tier 10 GB'a kadar)

#### Seçenek 2: Harici Backup (pg_dump + R2 export)

```bash
# Günlük R2 content export
aws s3 sync s3://hooksniff-storage s3://hooksniff-backup/ --endpoint-url=$R2_ENDPOINT
```

### 9.3 R2 Kurtarma Senaryoları

| Senaryo | Kurtarma | Süre |
|---------|----------|------|
| Yanlışlıkla dosya silme | R2 versioning ile geri alma | 5 dk |
| R2 bölgesel kesinti | Cross-region replica'dan serve | 15 dk |
| R2 hesap sorunu | Harici backup'tan yeni bucket'a yükle | 1-2 saat |

---

## 10. E-posta Servisi Kurtarma

### 10.1 Mevcut Durum

| Servis | Amaç | Maliyet |
|--------|------|---------|
| Gmail API (GCP Service Account) | Transactional email (verify, reset) | $0 (2K/gün) |

### 10.2 Kurtarma Senaryoları

| Senaryo | Kurtarma | Süre |
|---------|----------|------|
| Gmail API quota aşıldı | Ertesi gün sıfırlanır | 0-24 saat |
| Service Account sorunu | Yeni SA oluştur + key | 15 dk |
| Gmail API kesinti | Fallback: Resend free tier (100/gün) | 5 dk |

**Fallback Planı:** `api/src/email.rs`'de Gmail API başarısız olursa Resend'e geçiş mekanizması ekle.

---

## 11. Full-Stack Kurtarma Senaryoları

### Senaryo A: "Her Şey Çalışıyor" (En Olası)

**Durum:** Tüm servisler sağlıklı, sadece bir bileşende sorun var.

**Prosedür:**
1. Sorunlu bileşeni tespit et (monitoring + health check)
2. Bileşen bazlı kurtarma prosedürünü uygula (bölüm 5-10)
3. Status page güncelle
4. Müşterilere bildirim (gerekirse)

**Beklenen süre:** 5-30 dakika

### Senaryo B: "Bölgesel Kesinti" (Az Olası)

**Durum:** GCP europe-west1 komple çöktü.

**Prosedür:**
1. Neon DB: eu-central-1'de çalışıyor, etkilenmez ✅
2. Upstash: Serverless, etkilenmez ✅
3. Vercel: Global CDN, etkilenmez ✅
4. Cloud Run: ETKILENIR ⚠️
   - Farklı bölgeye redeploy (europe-north1 veya us-central1)
   - DATABASE_URL aynı (Neon serverless)
   - Cloud Run service yeniden oluştur
5. R2: Bölgeye bağlı, etkilenebilir ⚠️
   - Cross-region backup'tan restore

**Beklenen süre:** 30-120 dakika

### Senaryo C: "Hesap Çalındı" (Az Olası, Kritik)

**Durum:** GCP veya GitHub hesabı ele geçirildi.

**Prosedür:**
1. Tüm API key'leri revoke et
2. GCP: Tüm service account key'leri yenile
3. GitHub: PAT yenile, 2FA zorla
4. Neon: Database password yenile
5. Upstash: Token yenile
6. Vercel: Token yenile
7. Cloudflare: API token yenile
8. Müşterilere bildirim (GDPR Article 33: 72 saat içinde)
9. Post-mortem yaz

**Beklenen süre:** 2-8 saat

### Senaryo D: "Veri Merkezi Kaybı" (Çok Az Olası)

**Durum:** Neon eu-central-1 komple veri kaybetti.

**Prosedür:**
1. pg_dump backup'ı var mı? → Evetse, yeni Neon project'e yükle
2. Yoksa? → Son PITR noktasına kadar veri kaybı
3. Müşterilere bildirim
4. Incident response planı devreye gir

**Beklenen süre:** 2-24 saat

---

## 12. Otomatik Yedekleme Planı

### 12.1 Yedekleme Zamanlaması

| Bileşen | Sıklık | Yöntem | Saklama Süresi | Maliyet |
|---------|--------|--------|---------------|---------|
| Neon DB | Günlük | pg_dump → R2 | 30 gün | $0 |
| Neon DB | Sürekli | PITR (WAL) | 1 gün (Free) | $0 |
| Neon DB | Haftalık | Snapshot (Neon Console) | 4 hafta | $0.09/GB |
| R2 Dosyaları | Günlük | R2 replication veya export | 30 gün | $0 |
| GitHub Repo | Sürekli | Git history | Sonsuz | $0 |
| Config/Secrets | Değişiklik anında | GCP Secret Manager | Sonsuz | $0 |

### 12.2 pg_dump Otomatik Script

```bash
#!/bin/bash
# backup-db.sh — Günlük database backup
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="hooksniff_db_${DATE}.dump"
BACKUP_DIR="/tmp/backups"

mkdir -p $BACKUP_DIR

# pg_dump (custom format, compressed)
pg_dump $DATABASE_URL \
  --format=custom \
  --compress=9 \
  --file="${BACKUP_DIR}/${BACKUP_FILE}"

# Boyut kontrolü
SIZE=$(stat -f%z "${BACKUP_DIR}/${BACKUP_FILE}" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${BACKUP_FILE}")
echo "Backup size: ${SIZE} bytes"

# R2'ye yükle (aws cli ile)
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" \
  s3://hooksniff-backups/database/ \
  --endpoint-url=$R2_ENDPOINT

# 30 günden eski backup'ları sil
aws s3 ls s3://hooksniff-backups/database/ --endpoint-url=$R2_ENDPOINT | \
  while read -r line; do
    createDate=$(echo $line | awk '{print $1" "$2}')
    createDate=$(date -d "$createDate" +%s 2>/dev/null || date -j -f "%Y-%m-%d %H:%M" "$createDate" +%s)
    olderThan=$(date -d "30 days ago" +%s 2>/dev/null || date -v-30d +%s)
    if [[ $createDate -lt $olderThan ]]; then
      fileName=$(echo $line | awk '{print $4}')
      if [[ $fileName != "" ]]; then
        aws s3 rm "s3://hooksniff-backups/database/${fileName}" --endpoint-url=$R2_ENDPOINT
      fi
    fi
  done

# Cleanup
rm -f "${BACKUP_DIR}/${BACKUP_FILE}"

echo "Backup completed: ${BACKUP_FILE}"
```

### 12.3 Backup Doğrulama (Restore Test)

```bash
#!/bin/bash
# test-restore.sh — Haftalık restore test
set -e

# Son backup'ı indir
LATEST=$(aws s3 ls s3://hooksniff-backups/database/ --endpoint-url=$R2_ENDPOINT | sort | tail -1 | awk '{print $4}')
aws s3 cp "s3://hooksniff-backups/database/${LATEST}" /tmp/test_restore.dump --endpoint-url=$R2_ENDPOINT

# Test database'ine geri yükle
createdb hooksniff_restore_test 2>/dev/null || true
pg_restore /tmp/test_restore.dump -d hooksniff_restore_test --clean --if-exists

# Doğrulama sorguları
TABLES=$(psql -d hooksniff_restore_test -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
echo "Tables found: ${TABLES}"

# Cleanup
dropdb hooksniff_restore_test
rm -f /tmp/test_restore.dump

echo "Restore test passed: ${TABLES} tables restored successfully"
```

---

## 13. Failover ve Failback Prosedürleri

### 13.1 Failover Prosedürü (Primary → Standby)

```
1. TESPİT (0-2 dk)
   ├── Monitoring alert tetiklendi
   ├── Health check başarısız (3 ardışık)
   └── Manuel bildirim (müşteri raporu)

2. KARAR (2-5 dk)
   ├── Sorun ne? (bölgesel vs. global)
   ├── Ne kadar sürecek? (geçici vs. kalıcı)
   └── Failover gerekli mi?

3. HAZIRLIK (5-10 dk)
   ├── Son backup durumunu kontrol et
   ├── Standby bileşenleri hazırla
   └── DNS/env var'ları hazır et

4. FAILOVER (10-15 dk)
   ├── Cloud Run: Farklı bölgeye redeploy
   ├── DATABASE_URL güncelle (gerekirse)
   ├── DNS güncelle (gerekirse)
   └── Health check'leri doğrula

5. DOĞRULAMA (15-20 dk)
   ├── API health check → 200 OK
   ├── Test webhook gönder
   ├── Dashboard erişim kontrol
   └── Monitoring dashboard kontrol

6. BİLDİRİM (20-30 dk)
   ├── Status page güncelle
   ├── Müşterilere email
   └── Discord/Dwitter duyuru
```

### 13.2 Failback Prosedürü (Standby → Primary)

```
1. Primary'nin düzeldiğini doğrula
2. Veri senkronizasyonu kontrol et
3. Primary'ye yavaşça trafik kaydır (%10 → %50 → %100)
4. Standby'yi kapatma (birkaç gün bekle)
5. Post-mortem yaz
```

---

## 14. İletişim Planı

### 14.1 Seviye Tanımları

| Seviye | Tanım | Etki | Yanıt Süresi |
|--------|-------|------|-------------|
| **SEV-1** | Full outage, tüm servisler etkilenmiş | Kritik | 5 dakika |
| **SEV-2** | Tek servis kesinti, diğerleri çalışıyor | Yüksek | 15 dakika |
| **SEV-3** | Performans degradation, yavaşlama | Orta | 30 dakika |
| **SEV-4** | Minor sorun, workaround var | Düşük | 1 saat |

### 14.2 Bildirim Kanalları

| Kanal | Ne Zaman | İçerik |
|-------|----------|--------|
| Status page | Tüm seviyeler | Otomatik güncelleme |
| Discord | SEV-1, SEV-2 | Durum + ETA |
| Email | SEV-1 | Detaylı bilgi + ETKI |
| Dashboard banner | SEV-1, SEV-2 | Kullanıcıya visible uyarı |
| Twitter/X | SEV-1 (1 saatten uzun) | Genel duyuru |

### 14.3 Incident Communication Template

#### İlk Bildirim (SEV-1/SEV-2)

```
🪝 HookSniff Service Disruption

We're currently experiencing [DESCRIPTION]. Our team is actively investigating.

Impact: [WHAT'S AFFECTED]
Started: [TIME UTC]
Status: Investigating

We'll update you within 30 minutes.

Follow: https://hooksniff.vercel.app/status
```

#### Güncelleme

```
🪝 HookSniff Update — [TIME UTC]

Root cause identified: [DESCRIPTION]
We're implementing a fix now.

Impact: [WHAT'S AFFECTED]
ETA to resolution: [ESTIMATE]

Next update in 30 minutes.
```

#### Çözüm Bildirimi

```
🪝 HookSniff Resolved — [TIME UTC]

The incident has been resolved.

Duration: [TOTAL TIME]
Root cause: [BRIEF DESCRIPTION]
Impact: [WHO WAS AFFECTED]

Full post-mortem will be published within 48 hours.

We apologize for the inconvenience.
```

---

## 15. Post-Mortem Şablonu

> Kaynak: Atlassian Incident Postmortem Template (2026, doğrulanmış)

```markdown
# Incident Post-Mortem: [TITLE]

## Metadata
- **Date:** [YYYY-MM-DD]
- **Duration:** [X hours Y minutes]
- **Severity:** SEV-[1/2/3/4]
- **Author:** [Name]
- **Reviewers:** [Names]

## Summary
[2-3 cümle: Ne oldu, ne etkilendi, nasıl çözüldü]

## Impact
- **Users affected:** [Number or "All"]
- **Revenue impact:** [$ or "None"]
- **Data loss:** [Yes/No, details]
- **SLA breach:** [Yes/No]

## Timeline (UTC)
| Time | Event |
|------|-------|
| HH:MM | [What happened] |
| HH:MM | [Detection method] |
| HH:MM | [First response] |
| HH:MM | [Root cause identified] |
| HH:MM | [Fix implemented] |
| HH:MM | [Service restored] |

## Root Cause
[Detailed technical explanation of what caused the incident]

## Resolution
[What was done to fix it]

## Detection
- How was it detected? [Monitoring alert / Customer report / Manual check]
- Time to detect: [MTTD]

## Action Items
| # | Action | Owner | Priority | Due Date | Status |
|---|--------|-------|----------|----------|--------|
| 1 | [Preventive measure] | [Name] | P1 | [Date] | Open |
| 2 | [Detection improvement] | [Name] | P2 | [Date] | Open |
| 3 | [Process improvement] | [Name] | P3 | [Date] | Open |

## Lessons Learned
1. [What went well]
2. [What could be improved]
3. [What we'll do differently next time]

## Appendix
- [Links to logs, dashboards, screenshots]
```

---

## 16. Periyodik DR Test Planı

### 16.1 Test Türleri

| Test | Sıklık | Süre | Sorumlu |
|------|--------|------|---------|
| Backup restore test | Haftalık | 30 dk | AI (otomatik) |
| Health check validation | Günlük | 5 dk | AI (otomatik) |
| Failover simulation | Aylık | 2 saat | Servet + AI |
| Full DR drill | 3 aylık | 4 saat | Servet + AI |
| Communication test | Aylık | 15 dk | Servet |

### 16.2 Test Checklist

```markdown
## DR Test — [DATE]

### Pre-Test
- [ ] Son backup durumu kontrol
- [ ] Monitoring dashboard açık
- [ ] İletişim kanalları hazır
- [ ] Test planı onaylandı

### Test Steps
- [ ] Database restore test (pg_dump → restore → verify)
- [ ] API rollback test (deploy → rollback → verify)
- [ ] Dashboard failover test (Vercel → static export)
- [ ] Redis fallback test (Upstash → in-memory)
- [ ] R2 access test (bucket → alternative)
- [ ] Health check validation
- [ ] Status page update test
- [ ] Customer notification test (email template)

### Post-Test
- [ ] Tüm servisler normal
- [ ] Test sonuçları kaydedildi
- [ ] Eksiklikler listelendi
- [ ] Post-mortem (gerekirse)
```

---

## 17. Maliyet Analizi

### 17.1 $0 Bütçe ile Mümkün Olan

| Bileşen | Maliyet | Not |
|---------|---------|-----|
| Neon PITR | $0 | Free tier: 1 gün restore window |
| Neon snapshot (1 adet) | $0 | Free tier: 1 manuel snapshot |
| pg_dump → R2 | $0 | R2 free: 10 GB |
| Cloud Run rollback | $0 | Mevcut deploy mekanizması |
| Vercel rollback | $0 | Dashboard'dan tek tıkla |
| Upstash fallback | $0 | In-memory (zaten var) |
| Status page | $0 | hooksniff.vercel.app/status (zaten var) |
| Post-mortem template | $0 | Bu doküman |
| **TOPLAM** | **$0** | |

### 17.2 Opsiyonel İyileştirmeler (Bütçe Olursa)

| İyileştirme | Maliyet | Etki |
|-------------|---------|------|
| Neon Launch plan | ~$5-10/ay | 7 gün PITR, 10 snapshot, instant restore |
| Multi-region Cloud Run | ~$18/ay | Cross-region failover |
| R2 cross-region replication | $0-5/ay | Dosya erişilebilirliği |
| Uptime monitoring (Betterstack) | $0 (free) | Daha hızlı tespit |
| PagerDuty/Opsgenie | $0 (free tier) | Escalation chain |

---

## 18. Uygulama Planı

### Faz 1: Temel Yedekleme (1-2 gün) — $0

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | pg_dump backup script yaz | 30 dk | ❌ |
| 2 | R2'ye günlük upload cron kur | 15 dk | ❌ |
| 3 | Neon snapshot (manül) oluştur | 5 dk | ❌ |
| 4 | Health check monitoring doğrula | 15 dk | ❌ |
| 5 | Backup restore test script yaz | 30 dk | ❌ |

### Faz 2: Kurtarma Prosedürleri (1 gün) — $0

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Failover script yaz (Cloud Run) | 30 dk | ❌ |
| 2 | Emergency static export script | 15 dk | ❌ |
| 3 | Incident communication template'leri hazırla | 30 dk | ❌ |
| 4 | Post-mortem şablonu dokümante et | 15 dk | ❌ |

### Faz 3: Otomasyon ve Test (1-2 gün) — $0

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Haftalık restore test otomasyonu | 30 dk | ❌ |
| 2 | Aylık failover test planı | 15 dk | ❌ |
| 3 | Monitoring alert escalation kur | 30 dk | ❌ |
| 4 | Status page otomatik güncelleme | 15 dk | ❌ |

**Toplam süre:** 4-5 gün
**Toplam maliyet:** $0

---

## 19. Risk Matrisi

### 19.1 Genel Risk Değerlendirmesi

| Risk | Olasılık | Etki | Hazırlık | Genel Skor |
|------|----------|------|----------|-----------|
| İnsan hatası (veri silme) | Yüksek | Kritik | İyi (PITR) | 🟡 Orta |
| Bölgesel altyapı kesintisi | Düşük | Yüksek | Orta | 🟡 Orta |
| Güvenlik ihlali | Düşük | Kritik | Düşük | 🔴 Yüksek |
| Üçüncü parti servis kesintisi | Orta | Orta | İyi (fallback) | 🟢 Düşük |
| Doğal afet / fiziksel hasar | Çok düşük | Kritik | Orta | 🟡 Orta |
| Finansal sorun (fatura) | Düşük | Kritik | İyi (alert) | 🟢 Düşük |

### 19.2 Sektör Benchmark'ları

| Metrik | HookSniff | Tipik SaaS | Enterprise SaaS |
|--------|-----------|------------|-----------------|
| RPO | ≤ 24 saat (Free) | 1-24 saat | ≤ 1 saat |
| RTO | ≤ 30 dk | 1-4 saat | ≤ 15 dk |
| Uptime hedefi | %99.5 | %99.9 | %99.99 |
| DR test sıklığı | Aylık | Üç aylık | Aylık |
| Backup saklama | 30 gün | 30-90 gün | 90-365 gün |

---

## 20. Kaynaklar

| # | Kaynak | URL | Doğrulama |
|---|--------|-----|-----------|
| 1 | Veeam — RTO vs RPO Guide | veeam.com/blog/recovery-time-recovery-point-objectives.html | ✅ 2026-01-05 |
| 2 | Neon — PITR Docs | neon.com/docs/guides/backup-restore | ✅ 2026-05-10 |
| 3 | Neon — Plans & Pricing | neon.com/docs/introduction/plans | ✅ 2026-05-10 |
| 4 | GCP — Cold Standby Architecture | medium.com/google-cloud/build-your-own-disaster-recovery-on-gcp-cold-standby-architecture-fa86f53c164b | ✅ 2026-02-28 |
| 5 | GCP Cloud Run — Multi-Region Failover | docs.cloud.google.com/run/docs/release-notes | ✅ 2026-02-24 |
| 6 | Atlassian — Postmortem Template | atlassian.com/incident-management/postmortem/templates | ✅ 2026 |
| 7 | Microsoft — BCDR for SaaS | learn.microsoft.com/en-us/power-platform/admin/business-continuity-disaster-recovery | ✅ 2026-05 |
| 8 | Neon — Point-in-Time Recovery Under the Hood | neon.com/blog/point-in-time-recovery-in-postgres | ✅ 2024-02-22 |
| 9 | Cloudflare R2 — Cross-Region Replication | developers.cloudflare.com/r2 | ✅ 2026 |
| 10 | Upstash — Persistence | upstash.com/docs | ✅ 2026 |

---

## Ek A: HookSniff-Specific Kurtarma Komutları

### Hızlı Referans Kartı

```bash
# ===== DATABASE =====
# PITR (son 24 saat)
neon branches restore main ^self@$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) --preserve-under-name main_old

# pg_dump backup
pg_dump $DATABASE_URL --format=custom --compress=9 --file=backup.dump

# pg_restore
pg_restore backup.dump -d $DATABASE_URL --clean --if-exists

# ===== CLOUD RUN =====
# Son revision'a rollback
gcloud run services update-traffic hooksniff-api --to-revisions=LATEST=100 --region=europe-west1

# Redeploy
gcloud builds submit --config=cloudbuild.yaml

# ===== VERCEL =====
# Emergency static export
cd dashboard && npm run build && npx next export

# ===== R2 =====
# Backup sync
aws s3 sync s3://hooksniff-storage s3://hooksniff-backup/ --endpoint-url=$R2_ENDPOINT
```
