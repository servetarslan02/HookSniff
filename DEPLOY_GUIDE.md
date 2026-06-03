# HookSniff — Deployment Guide

> Last updated: 2026-06-03

This guide walks through deploying HookSniff to production. For a complete free-tier setup, see [FREE_TIER_SETUP.md](FREE_TIER_SETUP.md).

---

## Table of Contents

- [Step 1: Vercel Dashboard](#step-1-vercel-dashboard)
- [Step 2: GitHub Actions CI/CD](#step-2-github-actions-cicd)
- [Step 3: Cloudflare DNS](#step-3-cloudflare-dns)
- [Step 4: Verify Deployment](#step-4-verify-deployment)

---

## Step 1: Vercel Dashboard

### 1.1 Check Build Status
1. Go to [vercel.com](https://vercel.com)
2. Select the **hooksniff** project
3. Open the **Deployments** tab
4. Check the latest deployment status
5. If **Error** → open Build Logs and investigate

### 1.2 Manual Redeploy
1. In the Deployments tab, click **"..."** on the latest deployment
2. Select **Redeploy**
3. Confirm and wait 1–3 minutes
4. Verify at https://hooksniff.vercel.app

### 1.3 Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Ensure this variable is defined:
   ```
   NEXT_PUBLIC_API_URL = https://hooksniff-api-1046140057667.europe-west1.run.app/v1
   ```

---

## Step 2: GitHub Actions CI/CD

CI/CD is configured in `.github/workflows/deploy.yml`:

1. Push to `main` → CI runs (lint, test, build)
2. If CI passes → Deploy triggers automatically
3. Docker image build + push → Artifact Registry
4. Cloud Run services updated

### Required GitHub Secrets
- `GCP_SA_KEY` — GCP service account JSON key

### Manual Deploy (optional)
```bash
# Authenticate
gcloud auth activate-service-account --key-file=gcp-sa-key.json
gcloud config set project hooksniff-app

# Build + Push + Deploy
docker build -f Dockerfile.api -t europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest .
docker push europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest
gcloud run deploy hooksniff-api --image europe-west1-docker.pkg.dev/hooksniff-app/hooksniff/api:latest --region europe-west1
```

---

## Step 3: Cloudflare DNS

### 3.1 Log in to Cloudflare
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Select your zone

### 3.2 DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `api` | `hooksniff-api-1046140057667.europe-west1.run.app` | ✅ Proxied |
| CNAME | `dashboard` | `cname.vercel-dns.com` | ✅ Proxied |

---

## Step 4: Verify Deployment

### 4.1 API Health Check
```bash
curl https://hooksniff-api-1046140057667.europe-west1.run.app/health
# → {"status":"ok"}
```

### 4.2 Dashboard Test
1. Go to https://hooksniff.vercel.app
2. Register or log in
3. Verify the dashboard loads correctly

### 4.3 Webhook Test
```bash
# Endpoint oluştur
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://webhook.site/YOUR_URL"}'

# Webhook gönder
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \
  -H "Authorization: Bearer hr_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"endpoint_id": "YOUR_ENDPOINT_ID", "event": "test.ping", "data": {"hello": "world"}}'
```

---

## ⚠️ Güvenlik Hatırlatması

**Tüm token'ları yenile!** Chat'te paylaşmıştın:
- GitHub PAT → Settings → Developer Settings → Personal Access Tokens → Delete & Recreate
- GCP SA JSON → GCP Console → Service Accounts → Create New Key
- Polar tokens → Polar Dashboard → Settings → Tokens → Revoke

---

## 📞 Takıldığın Yerde

Her adımda sorun yaşarsan bana:
1. Hangi adımda takıldığını söyle
2. Varsa hata mesajını gönder
3. Screenshot da gönderebilirsin
