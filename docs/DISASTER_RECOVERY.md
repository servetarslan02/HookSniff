# HookSniff — Disaster Recovery Procedures

> Last updated: 2026-06-03
> Owner: DevOps / AI Agent
> Related: [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md), [RUNBOOK.md](./RUNBOOK.md)

---

## Table of Contents

1. [RTO/RPO Targets](#rtorpo-targets)
2. [Service Architecture Summary](#service-architecture-summary)
3. [Scenario 1: Database Failure](#scenario-1-database-failure)
4. [Scenario 2: API/Worker Crash](#scenario-2-apiworker-crash)
5. [Scenario 3: Dashboard Down](#scenario-3-dashboard-down)
6. [Scenario 4: Full Region Outage](#scenario-4-full-region-outage)
7. [Recovery Checklist](#recovery-checklist)
8. [Backup Strategy](#backup-strategy)
9. [Periodic DR Tests](#periodic-dr-tests)
10. [Escalation](#escalation)

---

## RTO/RPO Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **RTO** (Recovery Time Objective) | **< 15 minutes** | Time to restore service |
| **RPO** (Recovery Point Objective) | **< 1 hour** | Acceptable data loss window |
| **MTTR** (Mean Time To Recovery) | **< 30 minutes** | Average recovery time |
| **Data Loss** | **0 webhook events** | Webhook events must never be lost |

### Per-Service Targets

| Service | RTO | RPO | Priority |
|---------|-----|-----|----------|
| Neon PostgreSQL | 10 min | 1 hour (point-in-time) | 🔴 Critical |
| Cloud Run API | 5 min | 0 (stateless) | 🔴 Critical |
| Cloud Run Worker | 5 min | 0 (stateless) | 🔴 Critical |
| Vercel Dashboard | 2 min | 0 (static) | 🟡 High |
| Upstash Redis | 5 min | Cache-only, rebuildable | 🟢 Normal |

---

## Service Architecture Summary

```
┌──────────────┐     ┌──────────────────┐     ┌────────────────┐
│    User      │────▶│  Cloudflare CDN  │────▶│ Vercel Dashboard│
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

## Scenario 1: Database Failure (Neon PostgreSQL)

### Symptoms
- API returning 500 errors
- `db_query_duration_seconds` metrics abnormally high
- Neon dashboard shows "Degraded" or "Down" status
- Worker webhook deliveries stopped

### Diagnosis

```bash
# 1. Check Neon status
# https://console.neon.tech → Project → Status

# 2. Connection test
psql "$DATABASE_URL" -c "SELECT 1;"

# 3. List recent backups
ls -lt /var/backups/hooksniff/ | head -10

# 4. Check DB metrics in Grafana
# https://hookrelay.grafana.net → Dashboards → HookSniff
```

### Recovery Steps

```bash
# ── Step 1: Restore from Neon Console ──
# https://console.neon.tech → Branches → Restore
# Point-in-time recovery: Last 24 hours (Neon free tier)
# Neon Pro: 7 days point-in-time recovery

# ── Step 2: Restore from backup (if Neon unreachable) ──
# Find latest backup
LATEST_BACKUP=$(ls -t /var/backups/hooksniff/hooksniff-backup-*.sql | head -1)
echo "Backup to restore: $LATEST_BACKUP"

# Create new Neon branch or restore to existing DB
# Via Neon CLI or console
psql "$DATABASE_URL" < "$LATEST_BACKUP"

# ── Step 3: Run migrations ──
cd /root/.openclaw/workspace/HookSniff
# (If migrations exist)
# cargo run --bin migrate

# ── Step 4: Data validation ──
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM webhooks;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM endpoints;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# ── Step 5: Restart services ──
# Cloud Run revision deploy (same image, new env)
gcloud run deploy hooksniff-api --image="$API_IMAGE" --region=europe-west1 --no-traffic
gcloud run deploy hooksniff-worker --image="$WORKER_IMAGE" --region=europe-west1 --no-traffic

# ── Step 6: Health check + traffic ──
./deploy/cloud-run/blue-green.sh hooksniff-api
./deploy/cloud-run/blue-green.sh hooksniff-worker
```

### Prevention
- ✅ Neon backup cron daily at 03:00 UTC (active)
- ✅ Backup retention: 30 days
- ⚠️ Neon free tier: No point-in-time recovery (daily backup only)
- 📋 Recommendation: Upgrade to Neon Pro ($19/mo) → 7-day PITR

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
