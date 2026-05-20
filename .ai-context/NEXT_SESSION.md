# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-21 03:50 GMT+8

## 🔴 KRİTİK: Deploy Gerekli

4 fix seti push edildi ama Cloud Run eski kodu çalışıyor:

### Bu Oturum Fix'leri (commit fb230584)
1. **Settings i18n** — 13 key eklendi (en.json + tr.json)
2. **CouponCode sqlx rename** — `#[sqlx(rename = "type")]` eklendi
3. **Plan features** — Hardcoded endpoint counts kaldırıldı

### Önceki Fix'ler (henüz deploy edilmedi)
- Admin Performance (commit 9795ed74)
- SSO Fix'ler (commit d18c5301)
- Worker Performans Fix'leri (commit e3c46903)

### Deploy Komutları
```bash
# GCP Console'dan tetikle:
# https://console.cloud.google.com/cloud-build/triggers?project=hooksniff-app

# VEYA gcloud CLI:
gcloud builds submit --config cloudbuild.yaml
```

## Deploy Sonrası Test Listesi
1. Coupon Create → POST /v1/admin/coupons
2. Alert Create → POST /v1/admin/alerts
3. Revenue Metrics → GET /v1/admin/revenue/metrics
4. Security Events → GET /v1/admin/security/events
5. Feature Flag Toggle → PUT /v1/admin/feature-flags/:id
6. System Health → GET /health

## Hâlâ Açık Olan Sorunlar
- CSP violation (Cloudflare analytics)
- System health check failed
- Revenue cohorts/refunds 500
