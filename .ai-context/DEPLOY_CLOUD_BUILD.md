# 🚀 Servet — Deploy Rehberi (Cloud Build)

> Son güncelleme: 2026-05-11
> GitHub Actions billing bittiği için GCP Cloud Build kullanacağız.

---

## Adım 1: GCP Console'a Git (2 dk)

1. https://console.cloud.google.com adresine git
2. Google hesabınla giriş yap (servetarslan02@gmail.com)
3. Sol üstten **hooksniff-app** projesini seç

---

## Adım 2: Cloud Build Tetikle (5 dk)

### Yöntem A: Cloud Build Triggers (ÖNERİLEN)

1. Sol menü: **Cloud Build** → **Triggers**
2. Eğer trigger yoksa, **Create Trigger** tıkla:
   - **Name:** `hooksniff-deploy`
   - **Event:** `Manual invocation` (veya `Push to a branch`)
   - **Source:** GitHub → `servetarslan02/HookSniff` → `main`
   - **Configuration:** `Cloud Build configuration file (yaml or json)`
   - **Location:** Repository → `cloudbuild.yaml`
   - **Create**
3. Trigger'ı seç → **Run** tıkla
4. Build'in bitmesini bekle (5-10 dakika)

### Yöntem B: GCloud CLI (Terminal)

```bash
# Eğer gcloud CLI kurulduysa:
gcloud config set project hooksniff-app
gcloud builds submit --config=cloudbuild.yaml --substitutions=_IMAGE_TAG=latest
```

### Yöntem C: GCP Console > Cloud Build > History

1. Sol menü: **Cloud Build** → **History**
2. **Submit** butonu
3. Source: **Cloud Storage** veya **Repository**
4. Config: `cloudbuild.yaml`

---

## Adım 3: Cloud Run Deploy (Otomatik)

Cloud Build başarılı olursa, image'lar otomatik push edilir:
- `europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest`
- `europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/worker:latest`

Sonra Cloud Run'dan deploy et:

1. Sol menü: **Cloud Run**
2. **hooksniff-api** servisini seç
3. **Edit & Deploy New Revision**
4. Image URL: `europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest`
5. **Deploy**

Aynı şeyi **hooksniff-worker** için de yap.

---

## Adım 4: OTEL Kontrol (2 dk)

Deploy sonrası:
1. https://hooksniff-api-1046140057667.europe-west1.run.app/health adresine git
2. `otel` objesi olmalı:
   ```json
   "otel": {
     "enabled": true,
     "endpoint": "https://otlp-gateway-prod-eu-west-2.grafana.net/otlp",
     "headers_configured": true
   }
   ```
3. Grafana'ya git: https://hookrelay.grafana.net
4. **Explore** → `otel_boot_test` span'ı ara

---

## ⚠️ Önemli Notlar

- GitHub Actions billing bitti → Cloud Build kullan
- Cloud Build free tier: **120 dakika/gün** (yeterli)
- OTEL endpoint: `https://otlp-gateway-prod-eu-west-2.grafana.net/otlp`
- Grafana trial: **May 20'ye kadar** (10 gün kaldı)

---

## Sorun Olursa

1. Build loglarını screenshot yap
2. Bana gönder
3. Hata mesajını da ekle
