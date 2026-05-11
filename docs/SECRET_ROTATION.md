# Secret Rotation Policy — HookSniff

> Son güncelleme: 2026-05-12
> Sahip: Servet Arslan + AI Agent

---

## 1. Secret Envanteri

| # | Secret | Kullanım Yeri | Rotation Frequency | Son Rotation | Severity |
|---|--------|---------------|-------------------|--------------|----------|
| 1 | `JWT_SECRET` | API — token imzalama | 90 gün | — | 🔴 CRITICAL |
| 2 | `DATABASE_URL` (Neon) | API + Worker — PostgreSQL | 90 gün | — | 🔴 CRITICAL |
| 3 | `REDIS_URL` (Upstash) | API — rate limiting, cache | 90 gün | — | 🟡 HIGH |
| 4 | `POLAR_SECRET_KEY` | API — ödeme (Polar.sh) | 90 gün | — | 🔴 CRITICAL |
| 5 | `POLAR_WEBHOOK_SECRET` | API — webhook doğrulama | 90 gün | — | 🟡 HIGH |
| 6 | `RESEND_API_KEY` | API — email gönderimi | 90 gün | — | 🟡 HIGH |
| 7 | `OTEL_EXPORTER_OTLP_HEADERS` | API + Worker — Grafana OTEL | 180 gün | — | 🟢 LOW |
| 8 | `GRAFANA_SERVICE_ACCOUNT_TOKEN` | Monitoring — Grafana API | 180 gün | — | 🟢 LOW |
| 9 | `CLOUDFLARE_R2_*` | API — dosya depolama | 90 gün | — | 🟡 HIGH |
| 10 | `ADMIN_API_KEY` | API — admin endpoint'ler | 30 gün | — | 🔴 CRITICAL |
| 11 | `NEON_API_KEY` | Backup script — Neon API | 90 gün | — | 🟡 HIGH |
| 12 | `GOOGLE_OAUTH_CLIENT_SECRET` | Dashboard — Google login | 180 gün | — | 🟡 HIGH |

---

## 2. Rotation Frequency Kuralları

| Severity | Frequency | Açıklama |
|----------|-----------|----------|
| 🔴 CRITICAL | 30-90 gün | JWT, ödeme, admin key |
| 🟡 HIGH | 90 gün | Database, cache, email, storage |
| 🟢 LOW | 180 gün | Monitoring, OTEL, non-critical API |

### Zorunlu Rotation Durumları
- ⚠️ **Immediate**: Herhangi bir secret'ın sızdığı tespit edilirse
- ⚠️ **Immediate**: Ekip üyesi projeden ayrılırsa
- ⚠️ **Immediate**: Güvenlik ihlali şüphesi varsa
- 📅 **Scheduled**: Takvime göre (yukarıdaki frequency tablosu)
- 📅 **Post-incident**: Herhangi bir güvenlik olayından sonra

---

## 3. Rotation Procedure (Adım Adım)

### 3.1 Genel Akış

```
1. Yeni secret oluştur (servis provider'da)
2. Yeni secret'ı test et (staging veya local)
3. Cloud Run'da secret'ı güncelle
4. Servisi yeniden deploy et
5. Eski secret'ı deaktif et / sil
6. Rotation tarihini kaydet
```

### 3.2 JWT_SECRET Rotation

```bash
# 1. Yeni secret oluştur
NEW_JWT_SECRET=$(openssl rand -base64 48)

# 2. GCP Secret Manager'da güncelle
gcloud secrets versions add jwt-secret --data-file=<(echo "$NEW_JWT_SECRET")

# 3. Cloud Run'da güncelle (API + Worker)
gcloud run services update hooksniff-api \
  --region=europe-west1 \
  --update-secrets=JWT_SECRET=jwt-secret:latest

gcloud run services update hooksniff-worker \
  --region=europe-west1 \
  --update-secrets=JWT_SECRET=jwt-secret:latest

# 4. Deploy
gcloud run services update-traffic hooksniff-api --to-latest
gcloud run services update-traffic hooksniff-worker --to-latest

# 5. Doğrulama
curl -s https://hooksniff-api-*.run.app/health | jq .

# 6. Kaydet
./scripts/rotate-secrets.sh --update JWT_SECRET "$(date +%Y-%m-%d)"
```

### 3.3 DATABASE_URL Rotation (Neon)

```bash
# 1. Neon Dashboard → Settings → Connection → Reset password
#    veya Neon CLI:
neon projects connection-string reset --project-id <id>

# 2. Yeni connection string'i al
NEW_DB_URL="postgresql://..."

# 3. GCP Secret Manager
gcloud secrets versions add database-url --data-file=<(echo "$NEW_DB_URL")

# 4. Cloud Run güncelle (API + Worker)
gcloud run services update hooksniff-api \
  --region=europe-west1 \
  --update-secrets=DATABASE_URL=database-url:latest

gcloud run services update hooksniff-worker \
  --region=europe-west1 \
  --update-secrets=DATABASE_URL=database-url:latest

# 5. Backup script'indeki credentials'ı güncelle
# scripts/backup-cron.sh — Neon connection string
```

### 3.4 Polar.sh Secret Rotation

```bash
# 1. Polar.sh Dashboard → Settings → API Keys → Revoke old + Create new
# 2. Webhook secret'i de yenile (Settings → Webhooks → Secret)

# 3. GCP Secret Manager
gcloud secrets versions add polar-secret --data-file=<(echo "$NEW_POLAR_KEY")
gcloud secrets versions add polar-webhook-secret --data-file=<(echo "$NEW_POLAR_WH_SECRET")

# 4. Cloud Run
gcloud run services update hooksniff-api \
  --region=europe-west1 \
  --update-secrets=POLAR_SECRET_KEY=polar-secret:latest,POLAR_WEBHOOK_SECRET=polar-webhook-secret:latest
```

### 3.5 RESEND_API_KEY Rotation

```bash
# 1. Resend Dashboard → API Keys → Create new key
# 2. Eski key'i revoke et

# 3. GCP Secret Manager + Cloud Run
gcloud secrets versions add resend-api-key --data-file=<(echo "$NEW_RESEND_KEY")
gcloud run services update hooksniff-api \
  --region=europe-west1 \
  --update-secrets=RESEND_API_KEY=resend-api-key:latest
```

---

## 4. Emergency Rotation (Compromise Durumunda)

### 4.1 İlk 5 Dakika

```bash
# ⚠️ ACİL — Bu adımları SIRA ile uygula

# 1. Compromised secret'ı hemen deaktif et
# (İlgili provider dashboard'dan revoke/disable)

# 2. Tüm servisleri durdur (opsiyonel, severity'ye bağlı)
gcloud run services update hooksniff-api --no-traffic
gcloud run services update hooksniff-worker --no-traffic

# 3. Yeni secret oluştur
# (Her servis için yukarıdaki rotation procedure'u izle)

# 4. Servisleri geri aç
gcloud run services update-traffic hooksniff-api --to-latest
gcloud run services update-traffic hooksniff-worker --to-latest
```

### 4.2 Sonraki 1 Saat

1. **Audit log kontrolü** — Neon'da son 24 saatteki tüm sorguları incele
2. **Grafana alert'leri** — Anormal trafik var mı?
3. **Polar.sh** — Yetkisiz ödeme var mı?
4. **Admin key** — Tüm admin token'ları invalidate et
5. **Incident report** — `docs/INCIDENT_RESPONSE.md`'ye kaydet

### 4.3 Sonraki 24 Saat

1. Tüm secret'ları rotate et (precautionary)
2. Dependency audit çalıştır (`cargo audit`, `npm audit`)
3. Code review — yeni eklenen kodda açık var mı?
4. Servet'e rapor ver

---

## 5. GCP Secret Manager Integration

### 5.1 Mevcut Yapı

HookSniff, secret'ları GCP Secret Manager'da saklar:
- Cloud Run servisleri secret'ları environment variable olarak inject eder
- `--update-secrets` flag'ı ile zero-downtime rotation yapılabilir

### 5.2 Secret Manager Komutları

```bash
# Secret listele
gcloud secrets list --project=hooksniff

# Secret version'ları listele
gcloud secrets versions list jwt-secret

# Yeni version ekle
gcloud secrets versions add SECRET_NAME --data-file=<(echo "new-value")

# Eski version'ı deaktif et
gcloud secrets versions disable VERSION_ID --secret=SECRET_NAME

# Secret erişim log'u
gcloud logging read 'resource.type="secretmanager.googleapis.com/Secret"'
```

### 5.3 Cloud Run Secret Mapping

```bash
# Mevcut mapping'i görüntüle
gcloud run services describe hooksniff-api --region=europe-west1 \
  --format='yaml(spec.template.spec.containers[0].env)'

# Tüm secret'ları tek seferde güncelle
gcloud run services update hooksniff-api \
  --region=europe-west1 \
  --update-secrets=\
JWT_SECRET=jwt-secret:latest,\
DATABASE_URL=database-url:latest,\
REDIS_URL=redis-url:latest,\
POLAR_SECRET_KEY=polar-secret:latest,\
POLAR_WEBHOOK_SECRET=polar-webhook-secret:latest,\
RESEND_API_KEY=resend-api-key:latest,\
OTEL_EXPORTER_OTLP_HEADERS=otel-headers:latest
```

---

## 6. Rotation Checklist Template

Her rotation işleminde bu checklist'i kopyala ve doldur:

```markdown
## Rotation Checklist — [SECRET_NAME]
- **Tarih:** YYYY-MM-DD
- **Sebep:** [Scheduled / Emergency / Post-incident]
- **Sorumlu:** [Servet / AI Agent]

### Adımlar
- [ ] 1. Yeni secret oluşturuldu
- [ ] 2. Local/staging'de test edildi
- [ ] 3. GCP Secret Manager'da yeni version eklendi
- [ ] 4. Cloud Run servisleri güncellendi
- [ ] 5. Deploy başarılı (health check OK)
- [ ] 6. Eski secret version deaktif edildi
- [ ] 7. Provider dashboard'da eski key revoke edildi
- [ ] 8. Backup script'leri güncellendi (gerekirse)
- [ ] 9. Docs güncellendi
- [ ] 10. `rotate-secrets.sh --update` çalıştırıldı

### Notlar
- 
```

---

## 7. Monitoring & Alerts

### Rotation Takibi
- `scripts/rotate-secrets.sh` — Son rotation tarihlerini takip eder
- 30+ gün geçmişse uyarı verir

### Grafana Alert Önerileri
- JWT_SECRET 90+ gün → uyarı
- DATABASE_URL 90+ gün → uyarı
- Herhangi bir secret 2x frequency geçmişse → critical alert

### Otomasyon
- [ ] GitHub Actions ile haftalık rotation check (TODO)
- [ ] Slack/Discord notification (TODO)
