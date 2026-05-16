#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# HookSniff — Google Cloud Run Deployment Script
# ═══════════════════════════════════════════════════════════════════
# Bu script HookSniff'ı Google Cloud Run'a deploy eder.
#
# Gereksinimler:
#   - Google Cloud SDK (gcloud): https://cloud.google.com/sdk/docs/install
#   - Docker: https://docs.docker.com/get-docker/
#   - Google Cloud hesabı ve proje: hooksniff-app
#
# Kullanım:
#   chmod +x deploy/gcp-deploy.sh
#   ./deploy/gcp-deploy.sh
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Configuration ──
POLAR_PRODUCT_PRO="${POLAR_PRODUCT_PRO:?Set POLAR_PRODUCT_PRO env var}"
POLAR_PRODUCT_BUSINESS="${POLAR_PRODUCT_BUSINESS:?Set POLAR_PRODUCT_BUSINESS env var}"
APP_URL="${APP_URL:-https://hooksniff.is-a.dev}"
CORS_ORIGINS="${CORS_ORIGINS:-https://hooksniff.is-a.dev}"
NOTIFY_FROM_EMAIL="${NOTIFY_FROM_EMAIL:-noreply@hooksniff.is-a.dev}"
OTEL_EXPORTER_OTLP_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-https://otlp-gateway-prod-eu-west-2.grafana.net/otlp}"

# ── Renkli output ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
error() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── Konfigürasyon ──
PROJECT_ID="hooksniff-app"
REGION="europe-west3"  # Frankfurt — Türkiye'ye ~100ms (europe-west1 yerine)
API_SERVICE="hooksniff-api"
WORKER_SERVICE="hooksniff-worker"
REPO="hooksniff"

echo ""
echo "🪝 HookSniff — Google Cloud Run Deployment"
echo "═══════════════════════════════════════════"
echo ""

# ── Adım 1: GCloud CLI kontrol ──
info "Google Cloud SDK kontrol ediliyor..."
if ! command -v gcloud &>/dev/null; then
    error "gcloud CLI bulunamadı! Yüklemek için: https://cloud.google.com/sdk/docs/install"
fi
success "gcloud CLI bulundu: $(gcloud --version | head -1)"

# ── Adım 2: Proje ayarla ──
info "Proje ayarlanıyor: $PROJECT_ID"
gcloud config set project "$PROJECT_ID"
success "Proje ayarlandı: $PROJECT_ID"

# ── Adım 3: API'leri aktifleştir ──
info "Gerekli API'ler aktifleştirılıyor..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    --quiet
success "API'ler aktifleştirildi"

# ── Adım 4: Artifact Registry repo oluştur ──
info "Artifact Registry repo oluşturuluyor..."
gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="HookSniff container images" \
    --quiet 2>/dev/null || warn "Repo zaten mevcut"
success "Artifact Registry repo hazır: $REGION-docker.pkg.dev/$PROJECT_ID/$REPO"

# ── Adım 5: Docker'ı Artifact Registry'e bağla ──
info "Docker Artifact Registry'e bağlanıyor..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
success "Docker bağlandı"

# ── Adım 6: Secret'ları oluştur ──
info "Secret'lar Google Secret Manager'a yükleniyor..."

# .env.production dosyasından secret'ları oku
if [ ! -f .env.production ]; then
    error ".env.production dosyası bulunamadı! Lütfen önce oluşturun."
fi

# Her secret için Google Secret Manager'a yükle
create_secret() {
    local name=$1
    local value=$2
    if [ -z "$value" ]; then
        warn "Secret '$name' boş, atlanıyor"
        return
    fi
    echo -n "$value" | gcloud secrets create "$name" \
        --data-file=- \
        --replication-policy="automatic" \
        --quiet 2>/dev/null || \
    echo -n "$value" | gcloud secrets versions add "$name" \
        --data-file=- \
        --quiet 2>/dev/null || \
    warn "Secret '$name' güncellenemedi"
}

# .env.production'dan secret'ları oku
source <(grep -v '^#' .env.production | grep -v '^$' | sed 's/^/export /')

create_secret "hooksniff-hmac-secret" "$HMAC_SECRET"
create_secret "hooksniff-jwt-secret" "$JWT_SECRET"
create_secret "hooksniff-database-url" "$DATABASE_URL"
create_secret "hooksniff-redis-url" "$REDIS_URL"
create_secret "hooksniff-polar-token" "$POLAR_ACCESS_TOKEN"
create_secret "hooksniff-polar-webhook-secret" "$POLAR_WEBHOOK_SECRET"
create_secret "hooksniff-resend-api-key" "$RESEND_API_KEY"
create_secret "hooksniff-otel-headers" "$OTEL_EXPORTER_OTLP_HEADERS"

success "Secret'lar yüklendi"

# ── Adım 7: Docker image'ları build ve push ──
API_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api:latest"
WORKER_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/worker:latest"

info "API image build ediliyor..."
docker build -f Dockerfile.api -t "$API_IMAGE" .
docker push "$API_IMAGE"
success "API image push edildi: $API_IMAGE"

info "Worker image build ediliyor..."
docker build -f Dockerfile.worker -t "$WORKER_IMAGE" .
docker push "$WORKER_IMAGE"
success "Worker image push edildi: $WORKER_IMAGE"

# ── Adım 8: Cloud Run API servisi deploy ──
info "API Cloud Run'a deploy ediliyor..."
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
    --set-env-vars="APP_ENV=production,PORT=3000,RUST_LOG=info,hooksniff=info,LOG_FORMAT=json,CORS_ORIGINS=${CORS_ORIGINS},APP_URL=${APP_URL},POLAR_PRODUCT_PRO=${POLAR_PRODUCT_PRO},POLAR_PRODUCT_BUSINESS=${POLAR_PRODUCT_BUSINESS},POLAR_ENV=production,RATE_LIMIT_STORE=redis,RETENTION_DAYS=7,WEBHOOK_FORMAT=standard,NOTIFY_FROM_EMAIL=${NOTIFY_FROM_EMAIL},OTEL_ENABLED=true,OTEL_EXPORTER_OTLP_ENDPOINT=${OTEL_EXPORTER_OTLP_ENDPOINT},MAX_PAYLOAD_BYTES=1048576,WEBHOOK_TIMESTAMP_TOLERANCE_SECS=300" \
    --set-secrets="HMAC_SECRET=hooksniff-hmac-secret:latest,JWT_SECRET=hooksniff-jwt-secret:latest,DATABASE_URL=hooksniff-database-url:latest,REDIS_URL=hooksniff-redis-url:latest,POLAR_ACCESS_TOKEN=hooksniff-polar-token:latest,POLAR_WEBHOOK_SECRET=hooksniff-polar-webhook-secret:latest,RESEND_API_KEY=hooksniff-resend-api-key:latest,OTEL_EXPORTER_OTLP_HEADERS=hooksniff-otel-headers:latest" \
    --quiet

API_URL=$(gcloud run services describe "$API_SERVICE" --region="$REGION" --format='value(status.url)')
success "API deploy edildi: $API_URL"

# ── Adım 9: Cloud Run Worker servisi deploy ──
info "Worker Cloud Run'a deploy ediliyor..."
gcloud run deploy "$WORKER_SERVICE" \
    --image="$WORKER_IMAGE" \
    --region="$REGION" \
    --platform=managed \
    --no-allow-unauthenticated \
    --memory=256Mi \
    --cpu=1 \
    --min-instances=0 \
    --max-instances=2 \
    --set-env-vars="APP_ENV=production,RUST_LOG=info,hooksniff=info,NOTIFY_FROM_EMAIL=noreply@hooksniff.is-a.dev,OTEL_ENABLED=true,OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-2.grafana.net/otlp" \
    --set-secrets="DATABASE_URL=hooksniff-database-url:latest,REDIS_URL=hooksniff-redis-url:latest,RESEND_API_KEY=hooksniff-resend-api-key:latest,OTEL_EXPORTER_OTLP_HEADERS=hooksniff-otel-headers:latest" \
    --quiet

success "Worker deploy edildi"

# ── Adım 10: Custom domain mapping ──
info "Custom domain mapping yapılıyor..."
gcloud run domain-mappings create \
    --service="$API_SERVICE" \
    --domain="api.hooksniff.is-a.dev" \
    --region="$REGION" \
    --quiet 2>/dev/null || warn "Domain mapping zaten mevcut veya Cloudflare DNS gerektirir"

success "Domain mapping oluşturuldu"

# ── Tamamlandı ──
echo ""
echo "═══════════════════════════════════════════"
echo "🎉 Deployment tamamlandı!"
echo ""
echo "  API URL:     $API_URL"
echo "  Dashboard:   https://hooksniff.is-a.dev"
echo "  API Domain:  https://api.hooksniff.is-a.dev"
echo ""
echo "  Sonraki adımlar:"
echo "  1. Cloudflare DNS'de api.hooksniff.is-a.dev → $API_URL CNAME ekle"
echo "  2. Polar.sh webhook URL'ini kaydet"
echo "  3. Resend domain doğrulamasını yap"
echo "═══════════════════════════════════════════"
