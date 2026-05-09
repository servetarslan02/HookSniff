#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — Staging Deploy Script (GCP Cloud Run)
# Deploys API + Worker to staging environment
# ──────────────────────────────────────────────────────────────

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-hooksniff}"
REGION="${GCP_REGION:-europe-west1}"
SERVICE_PREFIX="hooksniff-staging"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Check prerequisites ──
check_prereqs() {
    if ! command -v gcloud &>/dev/null; then
        log "❌ gcloud not found. Install: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi

    log "✅ gcloud CLI found"
    gcloud config set project "${PROJECT_ID}" 2>/dev/null || true
}

# ── Build and push Docker images ──
build_and_push() {
    local service="$1"
    local dockerfile="$2"
    local image="${REGION}-docker.pkg.dev/${PROJECT_ID}/hooksniff/${service}:staging-${TIMESTAMP}"

    log "🔨 Building ${service}..."
    docker build -t "${image}" -f "${dockerfile}" .

    log "📤 Pushing ${service}..."
    docker push "${image}"

    echo "${image}"
}

# ── Deploy to Cloud Run ──
deploy_service() {
    local service="$1"
    local image="$2"
    local env_vars="$3"

    log "🚀 Deploying ${service} to Cloud Run..."
    gcloud run deploy "${SERVICE_PREFIX}-${service}" \
        --image "${image}" \
        --region "${REGION}" \
        --platform managed \
        --allow-unauthenticated \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 3 \
        --set-env-vars "${env_vars}" \
        --quiet

    local url
    url=$(gcloud run services describe "${SERVICE_PREFIX}-${service}" \
        --region "${REGION}" \
        --format 'value(status.url)')
    log "✅ ${service} deployed: ${url}"
}

# ── Run migrations ──
run_migrations() {
    log "🔄 Running database migrations..."
    # Migrations run automatically on API startup in staging
    log "✅ Migrations will run on first request"
}

# ── Main ──
TIMESTAMP=$(date '+%Y%m%d%H%M%S')

check_prereqs

case "${1:-deploy}" in
    deploy)
        log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        log "🏗️  HookSniff Staging Deploy"
        log "   Project: ${PROJECT_ID}"
        log "   Region:  ${REGION}"
        log "   Time:    ${TIMESTAMP}"
        log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

        API_IMAGE=$(build_and_push "api" "Dockerfile.api")
        WORKER_IMAGE=$(build_and_push "worker" "Dockerfile.worker")

        run_migrations

        deploy_service "api" "${API_IMAGE}" \
            "APP_ENV=staging,RUST_LOG=info/hooksniff=debug,MAX_PAYLOAD_BYTES=1048576,RETENTION_DAYS=7"

        deploy_service "worker" "${WORKER_IMAGE}" \
            "APP_ENV=staging,RUST_LOG=info/hooksniff=debug,WORKER_CONCURRENCY=5"

        log ""
        log "🎉 Staging deployment complete!"
        log "   API:    https://${SERVICE_PREFIX}-api-${PROJECT_ID}.${REGION}.run.app"
        log "   Worker: https://${SERVICE_PREFIX}-worker-${PROJECT_ID}.${REGION}.run.app"
        ;;
    teardown)
        log "🗑️  Tearing down staging environment..."
        gcloud run services delete "${SERVICE_PREFIX}-api" --region "${REGION}" --quiet 2>/dev/null || true
        gcloud run services delete "${SERVICE_PREFIX}-worker" --region "${REGION}" --quiet 2>/dev/null || true
        log "✅ Staging environment removed"
        ;;
    *)
        echo "Usage: $0 {deploy|teardown}"
        exit 1
        ;;
esac
