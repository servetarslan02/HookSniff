# ☁️ Google Cloud Setup Guide for HookSniff

Bu rehber, HookSniff'in Google Cloud Build ve Cloud Run üzerinde sorunsuz çalışması için gerekli adımları içerir.

## 1. Gerekli IAM Rolleri

Cloud Build servis hesabının (`{PROJECT_NUMBER}@cloudbuild.gserviceaccount.com`) aşağıdaki rollere sahip olduğundan emin olun:

- **Cloud Build Service Agent** (Varsayılan)
- **Cloud Run Admin** (Deploy yapabilmek için)
- **Service Account User** (Cloud Run servisini başlatabilmek için)
- **Artifact Registry Writer** (Docker image'larını push edebilmek için)
- **Secret Manager Secret Accessor** (Secret'lara erişebilmek için)

## 2. Artifact Registry Kurulumu

Görüntülerin yükleneceği repository'nin mevcut olduğundan emin olun:

- **Location:** `europe-west1`
- **Format:** `Docker`
- **Repository ID:** `hooksniff`

Eğer yoksa oluşturmak için:
```bash
gcloud artifacts repositories create hooksniff \
    --repository-format=docker \
    --location=europe-west1 \
    --description="HookSniff Docker images"
```

## 3. Secret Manager Secret'ları

`cloudbuild.yaml` içinde tanımlı olan tüm secret'ların Secret Manager'da mevcut olduğundan emin olun:

| Secret Name | Description |
|-------------|-------------|
| `neon-db-url` | PostgreSQL connection string |
| `upstash-redis-url` | Redis connection string |
| `jwt-secret` | JWT signing secret |
| `hmac-secret` | Webhook signing secret |
| `gcp-sa-json` | Google Cloud Service Account JSON |
| ... ve diğerleri ... | (cloudbuild.yaml içindeki tam listeyi kontrol edin) |

## 4. Troubleshooting (Sık Karşılaşılan Hatalar)

- **Timeout:** Rust build'leri uzun sürer. `cloudbuild.yaml`'a `timeout: 3600s` ekledik.
- **Permission Denied:** Genelde Secret Manager veya Cloud Run yetkisi eksikliğinden kaynaklanır. 1. adımı kontrol edin.
- **Image Not Found:** Artifact Registry repository isminin `hooksniff` olduğundan emin olun.
- **OAUTH_REDIRECT_BASE:** Cloud Run deploy edildikten sonra URL değişmiş olabilir. `cloudbuild.yaml` içindeki project number'ı kontrol edin.

---
*Hazırlayan: Gemini CLI*
