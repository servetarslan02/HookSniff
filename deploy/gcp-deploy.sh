#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# HookSniff — Google Cloud Run Deployment Script
# ═══════════════════════════════════════════════════════════════════
# This script deploys HookSniff to Google Cloud Run with proper
# secret management and verification.
#
# Requirements:
#   - Google Cloud SDK (gcloud): https://cloud.google.com/sdk/docs/install
#   - Docker: https://docs.docker.com/get-docker/
#   - Active Google Cloud project with billing enabled
#
# Usage:
#   chmod +x deploy/gcp-deploy.sh
#   ./deploy/gcp-deploy.sh
#
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── Configuration ──
PROJECT_ID="${GCP_PROJECT_ID:-hooksniff-app}"
REGION="${GCP_REGION:-europe-west1}"
REPO_NAME="hooksniff"
API_SERVICE="hooksniff-api"
WORKER_SERVICE="hooksniff-worker"
DASHBOARD_SERVICE="hooksniff-dashboard"

# ── Verify .env.production exists ──
if [ ! -f ".env.production" ]; then
    error ".env.production file not found! Copy it first:\n  cp deploy/env.production.example .env.production\n  Then fill in all [REQUIRED] values"
fi

# ── Parse .env.production ──
export $(grep -v '^#' .env.production | grep -v '^$' | xargs)

# ── Validate required variables ──
validate_env() {
    local var=$1
    local value=$(eval echo \$$var 2>/dev/null || echo "")
    if [ -z "$value" ] || [[ "$value" == \[REQUIRED* ]]; then
        error "$var is not set! Check .env.production"
    fi
}

validate_env "DATABASE_URL"
validate_env "REDIS_URL"
validate_env "HMAC_SECRET"
validate_env "JWT_SECRET"
validate_env "POLAR_ACCESS_TOKEN"
validate_env "POLAR_WEBHOOK_SECRET"
validate_env "RESEND_API_KEY"

echo ""
echo "🪝 HookSniff — Google Cloud Run Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

# ── Step 1: Verify gcloud CLI ──
info "Checking Google Cloud SDK..."
if ! command -v gcloud &>/dev/null; then
    error "gcloud CLI not found! Install from: https://cloud.google.com/sdk/docs/install"
fi
success "gcloud CLI found: $(gcloud --version | head -1)"

# ── Step 2: Set project ──
info "Setting GCP project: $PROJECT_ID"
gcloud config set project "$PROJECT_ID" --quiet
success "Project set to: $PROJECT_ID"

# ── Step 3: Enable required APIs ──
info "Enabling required Google Cloud APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    containerregistry.googleapis.com \
    --quiet
success "APIs enabled"

# ── Step 4: Create Artifact Registry repository ──
info "Creating Artifact Registry repository..."
gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="HookSniff container images" \
    --quiet 2>/dev/null || warn "Repository already exists"
success "Artifact Registry ready: $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME"

# ── Step 5: Configure Docker authentication ──
info "Configuring Docker authentication..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
success "Docker authenticated with Artifact Registry"

# ── Step 6: Create/Update Secrets in Secret Manager ──
info "Managing secrets in Google Secret Manager..."

create_or_update_secret() {
    local secret_name=$1
    local secret_value=$2
    
    if gcloud secrets describe "$secret_name" --project="$PROJECT_ID" &>/dev/null; then
        echo -n "$secret_value" | gcloud secrets versions add "$secret_name" --data-file=- --project="$PROJECT_ID" --quiet
        warn "Secret '$secret_name' updated"
    else
        echo -n "$secret_value" | gcloud secrets create "$secret_name" \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID" \
            --quiet
        success "Secret '$secret_name' created"
    fi
}

# Create secrets from .env.production
create_or_update_secret "hooksniff-db-url" "$DATABASE_URL"
create_or_update_secret "hooksniff-redis-url" "$REDIS_URL"
create_or_update_secret "hooksniff-hmac-secret" "$HMAC_SECRET"
create_or_update_secret "hooksniff-jwt-secret" "$JWT_SECRET"
create_or_update_secret "hooksniff-encryption-key" "${ENCRYPTION_KEY:-}"
create_or_update_secret "hooksniff-polar-token" "$POLAR_ACCESS_TOKEN"
create_or_update_secret "hooksniff-polar-webhook-secret" "$POLAR_WEBHOOK_SECRET"
create_or_update_secret "hooksniff-resend-api-key" "$RESEND_API_KEY"
create_or_update_secret "hooksniff-otel-headers" "${OTEL_EXPORTER_OTLP_HEADERS:-}"

success "Secrets synchronized to Google Secret Manager"

# ── Step 7: Build Docker images ──
API_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/api:latest"
WORKER_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/worker:latest"
DASHBOARD_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/dashboard:latest"

info "Building API image..."
docker build -f Dockerfile.api -t "$API_IMAGE" . --quiet
success "API image built"

info "Building Worker image..."
docker build -f Dockerfile.worker -t "$WORKER_IMAGE" . --quiet
success "Worker image built"

info "Building Dashboard image..."
docker build -f Dockerfile.dashboard -t "$DASHBOARD_IMAGE" . --quiet
success "Dashboard image built"

# ── Step 8: Push images to Artifact Registry ──
info "Pushing API image to Artifact Registry..."
docker push "$API_IMAGE" --quiet
success "API image pushed"

info "Pushing Worker image to Artifact Registry..."
docker push "$WORKER_IMAGE" --quiet
success "Worker image pushed"

info "Pushing Dashboard image to Artifact Registry..."
docker push "$DASHBOARD_IMAGE" --quiet
success "Dashboard image pushed"

# ── Step 9: Deploy API to Cloud Run ──
info "Deploying API to Cloud Run..."
gcloud run deploy "$API_SERVICE" \
    --image="$API_IMAGE" \
    --region="$REGION" \
    --platform=managed \
    --allow-unauthenticated \
    --port=3000 \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=3 \
    --timeout=300 \
    --set-env-vars="APP_ENV=production,RUST_LOG=info,LOG_FORMAT=json,WEBHOOK_FORMAT=standard,MAX_PAYLOAD_BYTES=1048576,RETENTION_DAYS=30,WEBHOOK_TIMESTAMP_TOLERANCE_SECS=300,RATE_LIMIT_STORE=redis,OTEL_ENABLED=${OTEL_ENABLED:-false}" \
    --set-secrets="DATABASE_URL=hooksniff-db-url:latest,REDIS_URL=hooksniff-redis-url:latest,HMAC_SECRET=hooksniff-hmac-secret:latest,JWT_SECRET=hooksniff-jwt-secret:latest,POLAR_ACCESS_TOKEN=hooksniff-polar-token:latest,POLAR_WEBHOOK_SECRET=hooksniff-polar-webhook-secret:latest,RESEND_API_KEY=hooksniff-resend-api-key:latest" \
    --project="$PROJECT_ID" \
    --quiet

API_URL=$(gcloud run services describe "$API_SERVICE" --region="$REGION" --format='value(status.url)' --project="$PROJECT_ID")
success "API deployed: $API_URL"

# ── Step 10: Deploy Worker to Cloud Run ──
info "Deploying Worker to Cloud Run..."
gcloud run deploy "$WORKER_SERVICE" \
    --image="$WORKER_IMAGE" \
    --region="$REGION" \
    --platform=managed \
    --no-allow-unauthenticated \
    --memory=512Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=4 \
    --set-env-vars="APP_ENV=production,RUST_LOG=info,LOG_FORMAT=json" \
    --set-secrets="DATABASE_URL=hooksniff-db-url:latest,REDIS_URL=hooksniff-redis-url:latest,HMAC_SECRET=hooksniff-hmac-secret:latest" \
    --project="$PROJECT_ID" \
    --quiet

success "Worker deployed"

# ── Step 11: Deploy Dashboard to Cloud Run ──
info "Deploying Dashboard to Cloud Run..."
gcloud run deploy "$DASHBOARD_SERVICE" \
    --image="$DASHBOARD_IMAGE" \
    --region="$REGION" \
    --platform=managed \
    --allow-unauthenticated \
    --port=3001 \
    --memory=256Mi \
    --cpu=0.5 \
    --min-instances=0 \
    --max-instances=2 \
    --set-env-vars="NEXT_PUBLIC_API_URL=$API_URL/v1,NODE_ENV=production" \
    --project="$PROJECT_ID" \
    --quiet

DASHBOARD_URL=$(gcloud run services describe "$DASHBOARD_SERVICE" --region="$REGION" --format='value(status.url)' --project="$PROJECT_ID")
success "Dashboard deployed: $DASHBOARD_URL"

# ── Deployment complete ──
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Deployment Complete!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Service URLs:"
echo "  🔌 API:       $API_URL"
echo "  📊 Dashboard: $DASHBOARD_URL"
echo ""
echo "Next steps:"
echo "  1. Test API: curl $API_URL/health"
echo "  2. Update NEXT_PUBLIC_API_URL in Dashboard if needed"
echo "  3. Configure custom domain: gcloud run domain-mappings create --help"
echo "  4. View logs: gcloud run logs read $API_SERVICE --region=$REGION"
echo ""
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo ""
