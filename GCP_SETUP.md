# Google Cloud Setup Guide for HookSniff

This guide covers the required setup steps for running HookSniff on Google Cloud Build and Cloud Run.

---

## 1. Required IAM Roles

Ensure the Cloud Build service account (`{PROJECT_NUMBER}@cloudbuild.gserviceaccount.com`) has the following roles:

| Role | Purpose |
|------|---------|
| **Cloud Build Service Agent** | Default role for Cloud Build |
| **Cloud Run Admin** | Deploy services to Cloud Run |
| **Service Account User** | Start Cloud Run services |
| **Artifact Registry Writer** | Push Docker images |
| **Secret Manager Secret Accessor** | Access secrets during deployment |

## 2. Artifact Registry Setup

Ensure the Docker image repository exists:

- **Location:** `europe-west1`
- **Format:** `Docker`
- **Repository ID:** `hooksniff`

Create if it doesn't exist:
```bash
gcloud artifacts repositories create hooksniff \
    --repository-format=docker \
    --location=europe-west1 \
    --description="HookSniff Docker images"
```

## 3. Secret Manager Secrets

Ensure all secrets referenced in `cloudbuild.yaml` exist in Secret Manager:

| Secret Name | Description |
|-------------|-------------|
| `neon-db-url` | PostgreSQL connection string |
| `upstash-redis-url` | Redis connection string |
| `jwt-secret` | JWT signing secret |
| `hmac-secret` | Webhook signing secret |
| `gcp-sa-json` | Google Cloud Service Account JSON |

Check `cloudbuild.yaml` for the full list of required secrets.

## 4. Troubleshooting

| Issue | Solution |
|-------|----------|
| **Timeout** | Rust builds are slow. `cloudbuild.yaml` has `timeout: 3600s` configured. |
| **Permission Denied** | Usually missing Secret Manager or Cloud Run roles. Check step 1. |
| **Image Not Found** | Verify Artifact Registry repository name is `hooksniff`. |
| **OAUTH_REDIRECT_BASE** | Cloud Run URL may have changed after redeploy. Check project number in `cloudbuild.yaml`. |
