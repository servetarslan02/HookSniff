#!/bin/bash
# ═══════════════════════════════════════════════
# HookSniff — Cloud Run Env Var Update Script
# ═══════════════════════════════════════════════
# GCP Console > Cloud Run > hooksniff-api > Edit & Deploy New Revision
# VEYA bu scripti gcloud CLI ile çalıştır:
#
# bash scripts/set-cloud-run-env.sh
# ═══════════════════════════════════════════════
# ⚠️ NEVER commit real secrets! Use environment variables or GCP Secret Manager.

set -e

PROJECT_ID="${GCP_PROJECT_ID:-hooksniff}"  # GCP project ID
SERVICE="hooksniff-api"
REGION="europe-west1"

echo "🔧 Setting Cloud Run env vars for $SERVICE..."

# Load secrets from environment (never hardcode!)
gcloud run services update $SERVICE \
  --region=$REGION \
  --project=$PROJECT_ID \
  --set-env-vars="GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID},GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET},GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID},GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET},OAUTH_REDIRECT_BASE=${OAUTH_REDIRECT_BASE:-https://hooksniff-api-e6ztf3x2ma-ew.a.run.app},APP_URL=${APP_URL:-https://hooksniff.vercel.app},CORS_ORIGINS=${CORS_ORIGINS:-https://hooksniff.vercel.app},RATE_LIMIT_STORE=redis"

echo "✅ Done! OAuth providers should now show google=true, github=true"
echo "🔗 Test: curl https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1/oauth/providers"
