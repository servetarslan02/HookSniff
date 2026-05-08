# NEXT_SESSION.md — Sonraki Oturum

> 2026-05-08 14:50 GMT+8

## Yeni Oturumda Ne Söyle

HookSniff projesinde API'yi Cloud Run'a taşıdık. GitHub Actions workflow hazır ama Servet'in GitHub Secrets ayarlaması gerekiyor. Detaylar bu dosyada.

---

## 🔴 DURUM: Deploy Workflow Hazır, GitHub Secrets Eksik

Deploy workflow'u (`deploy.yml`) Cloud Run'a güncellendi. Push edildi (commit `0055753`).
Şimdi Servet'in GitHub Secrets ayarlaması gerekiyor — yoksa workflow çalışmaz.

## Servet'in Yapması Gereken (ACİL)

### 1. GitHub Secrets Ayarla
Repo → Settings → Secrets and variables → Actions → New repository secret

**Gerekli secretlar:**

| Secret Adı | Değer | Açıklama |
|------------|-------|----------|
| `GCP_SA_KEY` | `.ai-context/gcp-service-account.json` dosyasının **tam içeriği** | GCP auth için |

**Environment variables (Cloud Run'a set edilecek):**
Aşağıdakiler Secret Manager'da saklanacak, workflow `--set-secrets` ile çekiyor:

| Secret Manager Key | Değer |
|--------------------|-------|
| `neon-db-url` | Neon connection string |
| `upstash-redis-url` | Redis URL |
| `jwt-secret` | JWT secret |
| `hmac-secret` | HMAC secret |
| `polar-token` | Polar access token |
| `polar-webhook` | Polar webhook secret |
| `polar-pro` | Polar product pro ID |
| `polar-business` | Polar product business ID |
| `resend-key` | Resend API key |
| `otel-headers` | Grafana OTEL headers |

### 2. GCP Secret Manager'a Secret Erişimi Ver
Service account (`hooksniff-deploy@hooksniff-app.iam.gserviceaccount.com`) Secret Manager erişimi olmalı:

```bash
# GCP Console'dan veya gcloud ile:
gcloud projects add-iam-policy-binding hooksniff-app \
  --member="serviceAccount:hooksniff-deploy@hooksniff-app.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Artifact Registry Repo Oluştur
```bash
gcloud artifacts repositories create hooksniff \
  --repository-format=docker \
  --location=europe-west1 \
  --project=hooksniff-app
```

### 4. Secret Manager'da Secret Oluştur
Her bir secret için:
```bash
echo -n "DEGER" | gcloud secrets create SECRET_NAME \
  --data-file=- \
  --project=hooksniff-app
```

### 5. CI Workflow Secret'ı
CI workflow'u da `GCP_SA_KEY` secret'ını kullanıyor mu? Hayır, sadece deploy kullanıyor.
Ama CI'nin çalışması için başka secret gerekmez (sadece GITHUB_TOKEN, o otomatik).

## Workflow Özeti

```
push main → CI (lint + test + build) → Deploy workflow trigger
                                         ↓
                              GCP auth (GCP_SA_KEY)
                                         ↓
                              Docker build API + Worker
                                         ↓
                              Push to Artifact Registry
                                         ↓
                              Deploy to Cloud Run
                              API: hooksniff-api (public)
                              Worker: hooksniff-worker (private)
```

## Sonraki Adımlar (Servet Sonra Yapabilir)
- Render API servisini suspend/et
- Worker'ı da Cloud Run'a taşı (zaten deploy workflow'da var)
- Grafana OTEL endpoint'ini Cloud Run'a bağla
- Custom domain ayarla (eu.org veya .com)

## Hafıza Kuralları
Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `git add -A && git commit && git push origin main`
