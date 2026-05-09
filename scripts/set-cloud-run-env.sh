#!/bin/bash
# ═══════════════════════════════════════════════
# HookSniff — Cloud Run Env Var Update Script
# ═══════════════════════════════════════════════
# GCP Console > Cloud Run > hooksniff-api > Edit & Deploy New Revision
# VEYA bu scripti gcloud CLI ile çalıştır:
#
# bash scripts/set-cloud-run-env.sh
# ═══════════════════════════════════════════════

set -e

PROJECT_ID="hooksniff"  # GCP project ID
SERVICE="hooksniff-api"
REGION="europe-west1"

echo "🔧 Setting Cloud Run env vars for $SERVICE..."

gcloud run services update $SERVICE \
  --region=$REGION \
  --project=$PROJECT_ID \
  --set-env-vars="GOOGLE_CLIENT_ID=1046140057667-111vspd37u60fs91o9u2cvon8hp5comh.apps.googleusercontent.com,GOOGLE_CLIENT_SECRET=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,GITHUB_CLIENT_ID=Ov23limyhZ2xUcZojypE,GITHUB_CLIENT_SECRET=5a09936cb001e40e80650fac7804e657920b56ed,OAUTH_REDIRECT_BASE=https://hooksniff-api-1046140057667.europe-west1.run.app,APP_URL=https://hooksniff.vercel.app,CORS_ORIGINS=https://hooksniff.vercel.app,RATE_LIMIT_STORE=redis"

echo "✅ Done! OAuth providers should now show google=true, github=true"
echo "🔗 Test: curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/oauth/providers"
