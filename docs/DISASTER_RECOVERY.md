# HookSniff — Disaster Recovery (Felaket Kurtarma) Prosedürü

> Son güncelleme: 2026-05-12
> Sahip: DevOps / AI Agent
> İlgili: [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md), [RUNBOOK.md](./RUNBOOK.md)

---

## İçindekiler

1. [RTO/RPO Hedefleri](#rtorpo-hedefleri)
2. [Servis Mimarisi Özeti](#servis-mimarisi-özeti)
3. [Scenario 1: Veritabanı Arızası](#scenario-1-veritabanı-arızası)
4. [Scenario 2: API/Worker Crash](#scenario-2-apiworker-crash)
5. [Scenario 3: Dashboard Down](#scenario-3-dashboard-down)
6. [Scenario 4: Tüm Bölge Çöküşü](#scenario-4-tüm-bölge-çöküşü)
7. [Kurtarma Kontrol Listesi](#kurtarma-kontrol-listesi)
8. [Backup Stratejisi](#backup-stratejisi)
9. [Periyodik DR Testleri](#periyodik-dr-testleri)
10. [İletişim ve Escalation](#iletişim-ve-escalation)

---

## RTO/RPO Hedefleri

| Metrik | Hedef | Açıklama |
|--------|-------|----------|
| **RTO** (Recovery Time Objective) | **< 15 dakika** | Servisin tekrar çalışır duruma gelme süresi |
| **RPO** (Recovery Point Objective) | **< 1 saat** | Kabul edilebilir veri kaybı süresi |
| **MTTR** (Mean Time To Recovery) | **< 30 dakika** | Ortalama kurtarma süresi |
| **Veri Kaybı** | **0 webhook event** | Webhook event'leri asla kaybolmamalı |

### Servis Bazlı Hedefler

| Servis | RTO | RPO | Öncelik |
|--------|-----|-----|---------|
| Neon PostgreSQL | 10 dk | 1 saat (point-in-time) | 🔴 Kritik |
| Cloud Run API | 5 dk | 0 (stateless) | 🔴 Kritik |
| Cloud Run Worker | 5 dk | 0 (stateless) | 🔴 Kritik |
| Vercel Dashboard | 2 dk | 0 (static) | 🟡 Yüksek |
| Upstash Redis | 5 dk | Cache-only, rebuildable | 🟢 Normal |

---

## Servis Mimarisi Özeti

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Kullanıcı   │────▶│  Cloudflare CDN  │────▶│ Vercel Dashbrd │
└──────────────┘     └──────────────────┘     └────────────────┘
                            │
                            ▼
                     ┌──────────────┐     ┌────────────────┐
                     │  Cloud Run   │────▶│  Neon Postgres  │
                     │  API (Axum)  │     │  (Serverless)   │
                     └──────┬───────┘     └────────────────┘
                            │                    ▲
                            ▼                    │
                     ┌──────────────┐     ┌────────────────┐
                     │  Cloud Run   │────▶│  Upstash Redis  │
                     │   Worker     │     │  (Cache/Queue)  │
                     └──────────────┘     └────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Customer    │
                     │  Webhooks    │
                     └──────────────┘
```

---

## Scenario 1: Veritabanı Arızası (Neon PostgreSQL)

### Belirtiler
- API 500 hataları döndürüyor
- `db_query_duration_seconds` metrikleri anormal yüksek
- Neon dashboard'da "Degraded" veya "Down" durumu
- Worker webhook delivery'leri durmuş

### Tanılama

```bash
# 1. Neon durumunu kontrol et
# https://console.neon.tech → Project → Status

# 2. Bağlantı testi
psql "$DATABASE_URL" -c "SELECT 1;"

# 3. Son backup'ları listele
ls -lt /var/backups/hooksniff/ | head -10

# 4. Grafana'da DB metriklerini kontrol et
# https://hookrelay.grafana.net → Dashboards → HookSniff
```

### Kurtarma Adımları

```bash
# ── Adım 1: Neon Console'dan restore ──
# https://console.neon.tech → Branches → Restore
# Point-in-time recovery: Son 24 saat (Neon free tier)
# Neon Pro: 7 gün point-in-time recovery

# ── Adım 2: Backup'tan restore (Neon erişilemezse) ──
# En son backup'ı bul
LATEST_BACKUP=$(ls -t /var/backups/hooksniff/hooksniff-backup-*.sql | head -1)
echo "Restore edilecek backup: $LATEST_BACKUP"

# Yeni Neon branch oluştur veya mevcut DB'ye restore
# Neon CLI veya console üzerinden
psql "$DATABASE_URL" < "$LATEST_BACKUP"

# ── Adım 3: Migration'ları çalıştır ──
cd /root/.openclaw/workspace/HookSniff
# (Eğer migration'lar varsa)
# cargo run --bin migrate

# ── Adım 4: Veri doğrulama ──
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM webhooks;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM endpoints;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# ── Adım 5: Servisleri yeniden başlat ──
# Cloud Run'da revision deploy (aynı image, yeni env)
gcloud run deploy hooksniff-api --image="$API_IMAGE" --region=europe-west1 --no-traffic
gcloud run deploy hooksniff-worker --image="$WORKER_IMAGE" --region=europe-west1 --no-traffic

# ── Adım 6: Health check + traffic ──
./deploy/cloud-run/blue-green.sh hooksniff-api
./deploy/cloud-run/blue-green.sh hooksniff-worker
```

### Önleme
- ✅ Neon backup cron her gün 03:00 UTC (aktif)
- ✅ Backup retention: 30 gün
- ⚠️ Neon free tier: Point-in-time recovery yok (sadece daily backup)
- 📋 Öneri: Neon Pro'ya yükselt ($19/ay) → 7 gün PITR

---

## Scenario 2: API/Worker Crash (Cloud Run)

### Belirtiler
- Cloud Run servis "Down" veya sürekli restart
- `APIServiceDown` veya `WorkerServiceDown` alert'i aktif
- Health check endpoint yanıt vermiyor
- Container log'larında crash loop

### Tanılama

```bash
# 1. Servis durumunu kontrol et
gcloud run services describe hooksniff-api --region=europe-west1 --format="json"

# 2. Son deploy'u kontrol et
gcloud run revisions list --service=hooksniff-api --region=europe-west1 \
    --sort-by="~metadata.creationTimestamp" --limit=5

# 3. Container log'larını kontrol et
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=hooksniff-api" \
    --limit=50 --format="json" --project=hooksniff-app

# 4. Son bilinen iyi revision
gcloud run services describe hooksniff-api --region=europe-west1 \
    --format="value(status.traffic)"
```

### Kurtarma Adımları

```bash
# ── Hızlı rollback (en yaygın senaryo) ──
# Bir önceki revision'a geri dön
./deploy/cloud-run/rollback.sh hooksniff-api
./deploy/cloud-run/rollback.sh hooksniff-worker

# ── Manuel revision rollback ──
# Belirli bir revision'a dön
./deploy/cloud-run/rollback.sh hooksniff-api hooksniff-api-00042-abc

# ── Sıfırdan deploy (rollback de başarısızsa) ──
# Son bilinen iyi image'ı deploy et
gcloud run deploy hooksniff-api \
    --image=europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:last-known-good \
    --region=europe-west1 \
    --no-traffic

# Blue-green ile traffic aktar
./deploy/cloud-run/blue-green.sh hooksniff-api
```

### Önleme
- ✅ Blue-green deployment stratejisi
- ✅ Health check endpoint (`/health`)
- ✅ Auto-scaling: min 0, max 10 instance
- ✅ OOM kill koruması: memory limit 512Mi
- 📋 Öneri: Canary deployment'a geçiş (daha granüler traffic control)

---

## Scenario 3: Dashboard Down (Vercel)

### Belirtiler
- `https://hooksniff.vercel.app` yüklenmiyor
- Vercel dashboard'da "Error" veya "Build Failed"
- Kullanıcılar API'ye erişebiliyor ama dashboard göremiyor

### Tanılama

```bash
# 1. Vercel durumunu kontrol et
# https://vercel.com/servetarslan02/hooksniff → Deployments

# 2. Son deployment'ları listele
# Vercel CLI (varsa)
vercel ls hooksniff

# 3. HTTP kontrolü
curl -sI https://hooksniff.vercel.app | head -5
```

### Kurtarma Adımları

```bash
# ── Adım 1: Vercel'den rollback ──
# Vercel Dashboard → Deployments → Son çalışan deployment → "..." → Promote to Production

# ── Adım 2: Vercel CLI ile rollback ──
# Son başarılı deployment ID'sini bul
vercel ls hooksniff --token="$VERCEL_TOKEN"

# O deployment'ı production'a promote et
vercel promote <DEPLOYMENT_URL> --token="$VERCEL_TOKEN"

# ── Adım 3: GitHub'dan rollback (Vercel otomatik deploy yapar) ──
# Son çalışan commit'e dön
git log --oneline -10
git revert HEAD
git push origin main
# Vercel otomatik deploy edecek

# ── Adım 4: Build hatası düzeltme ──
# Dashboard dizininde build test et
cd dashboard
npm run build
# Hataları düzelt, commit, push
```

### Önleme
- ✅ Vercel otomatik rollback (Preview → Production promote)
- ✅ GitHub Actions: build test her push'ta
- 📋 Öneri: Vercel Preview deployment'ları test ortamı olarak kullan

---

## Scenario 4: Tüm Bölge Çöküşü (europe-west1)

### Belirtiler
- Tüm Cloud Run servisleri erişilemez
- GCP Status Dashboard'da europe-west1 outage
- Neon (eu-central-1) çalışıyor olabilir

### Kurtarma Adımları

```bash
# ── Adım 1: Farklı bölgeye deploy ──
# europe-west4 (Amsterdam) veya us-central1 (Iowa) kullan
REGION_BACKUP="europe-west4"

gcloud run deploy hooksniff-api \
    --image="$API_IMAGE" \
    --region="$REGION_BACKUP" \
    --set-env-vars="DATABASE_URL=$DATABASE_URL,REDIS_URL=$REDIS_URL"

gcloud run deploy hooksniff-worker \
    --image="$WORKER_IMAGE" \
    --region="$REGION_BACKUP" \
    --set-env-vars="DATABASE_URL=$DATABASE_URL,REDIS_URL=$REDIS_URL"

# ── Adım 2: DNS güncelle (Cloudflare) ──
# API endpoint'ini yeni bölgeye yönlendir
# Cloudflare Dashboard → DNS → api.hooksniff.dev → güncelle

# ── Adım 3: Dashboard etkilenmez ──
# Vercel global CDN, bölge bağımsız çalışır
```

### Önleme
- 📋 Öneri: Multi-region Cloud Run deployment
- 📋 Öneri: Cloudflare Load Balancer ile bölgesel failover

---

## Kurtarma Kontrol Listesi

Her felaket kurtarma senaryosunda aşağıdaki adımları sırasıyla uygulayın:

### Acil Müdahale (İlk 5 dakika)

- [ ] **1. Alarm doğrulama** — Grafana dashboard'dan sorunu teyit et
- [ ] **2. Etki alanı belirle** — Hangi servisler etkileniyor?
- [ ] **3. Incident Response başlat** — [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) takip et
- [ ] **4. Servis durumu** — Tüm servislerin health check'ini yap

### Kurtarma (5-15 dakika)

- [ ] **5. Root cause identification** — Log'ları ve metrikleri incele
- [ ] **6. Rollback uygula** — İlgili servis için rollback script çalıştır
- [ ] **7. Health check** — Rollback sonrası servis durumunu doğrula
- [ ] **8. Traffic doğrulama** — Kullanıcı trafiğinin normal aktığını kontrol et

### Doğrulama (15-30 dakika)

- [ ] **9. E2E test** — Kritik yolları test et (webhook delivery, dashboard erişimi)
- [ ] **10. Monitoring** — Grafana'da hata oranlarının düştüğünü doğrula
- [ ] **11. Log inceleme** — Yeni hata var mı kontrol et
- [ ] **12. Kullanıcı doğrulama** — Customer portal'ı kontrol et

### Kurtarma Sonrası

- [ ] **13. Incident report yaz** — Root cause, timeline, etki, aksiyonlar
- [ ] **14. MEMORY.md güncelle** — Olayı ve dersleri kaydet
- [ ] **15. Önleme aksiyonları** — Tekrarlanmaması için adımlar belirle
- [ ] **16. Servet'e bildir** — Kullanıcı etkilenmişse bilgilendir

---

## Backup Stratejisi

### Neon PostgreSQL

| Backup Türü | Sıklık | Retention | Yöntem |
|-------------|--------|-----------|--------|
| Otomatik backup | Günlük 03:00 UTC | 30 gün | `backup-cron.sh` |
| Neon built-in | Günlük | 24 saat (free tier) | Neon console |
| Manuel backup | Değişiklik öncesi | Sınırsız | `pg_dump` |

```bash
# Manuel backup alma
cd /root/.openclaw/workspace/HookSniff
node scripts/neon-backup.mjs --out /var/backups/hooksniff/

# Backup doğrulama
pg_restore --list /var/backups/hooksniff/hooksniff-backup-*.sql | head -20
```

### Konfigürasyon Backup

| Öğe | Konum | Güncelleme |
|-----|-------|------------|
| `.env.production` | GitHub (encrypted) | Her deploy |
| Cloud Run env vars | GCP Secret Manager | Manuel |
| Grafana dashboards | `monitoring/grafana/` | Otomatik |
| Terraform state | `deploy/terraform-provider-hooksniff/` | Manuel |

---

## Periyodik DR Testleri

### Aylık Testler

- [ ] **Backup restore testi** — Backup'tan staging DB'ye restore
- [ ] **Rollback testi** — Blue-green rollback'ı staging'de test et
- [ ] **Health check validation** — Tüm health endpoint'lerinin çalıştığını doğrula

### Üç Aylık Testler

- [ ] **Full DR drill** — Scenario 1-3'ü staging'de simüle et
- [ ] **Backup integrity** — Backup'ların geri yüklenebilirliğini doğrula
- [ ] **RTO measurement** — Gerçek kurtarma süresini ölç

### Yıllık Testler

- [ ] **Bölge failover** — Farklı GCP bölgeye tam geçiş
- [ ] **Full restore** — Sıfırdan tüm sistemi kurma
- [ ] **Documentation review** — Tüm DR dokümanlarını güncelle

---

## İletişim ve Escalation

### Escalation Zinciri

| Seviye | Kişi/Platform | Süre |
|--------|---------------|------|
| L1 | Grafana Alert → Slack/Discord | Otomatik |
| L2 | AI Agent müdahalesi | 5 dakika |
| L3 | Servet Arslan (manuel müdahale) | 15 dakika |
| L4 | Neon/GCP/Vercel support | 30 dakika |

### Faydalı Linkler

- **Grafana Dashboard:** https://hookrelay.grafana.net
- **Neon Console:** https://console.neon.tech
- **GCP Cloud Run:** https://console.cloud.google.com/run
- **Vercel Dashboard:** https://vercel.com/servetarslan02/hooksniff
- **GCP Status:** https://status.cloud.google.com
- **Neon Status:** https://neon.statuspage.io
- **Vercel Status:** https://www.vercel-status.com

---

> **Not:** Bu doküman her DR testinden sonra güncellenmelidir.
> Son test tarihi: _Henüz test edilmedi_
