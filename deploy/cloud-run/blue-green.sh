#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# HookSniff — Blue-Green Deployment for Google Cloud Run
# ═══════════════════════════════════════════════════════════════════
# Yeni revision'ı %10 traffic ile deploy eder, health check sonrası
# başarılıysa %100'e çeker, başarısızsa rollback yapar.
#
# Kullanım:
#   ./deploy/cloud-run/blue-green.sh [SERVICE_NAME]
#
# Ortam değişkenleri:
#   PROJECT_ID    — GCP proje ID (varsayılan: hooksniff-app)
#   REGION        — GCP bölge (varsayılan: europe-west1)
#   IMAGE_URL     — Deploy edilecek container image URL'i
#   HEALTH_PATH   — Health check endpoint (varsayılan: /health)
#   HEALTH_TIMEOUT— Health check süresi saniye (varsayılan: 30)
#   ERROR_THRESHOLD — Hata oranı eşiği (varsayılan: 0.05 = %5)
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Konfigürasyon ──
PROJECT_ID="${PROJECT_ID:-hooksniff-app}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${1:-hooksniff-api}"
IMAGE_URL="${IMAGE_URL:?IMAGE_URL ortam değişkenini ayarlayın}"
HEALTH_PATH="${HEALTH_PATH:-/health}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-30}"
ERROR_THRESHOLD="${ERROR_THRESHOLD:-0.05}"
INITIAL_TRAFFIC_PERCENT="${INITIAL_TRAFFIC_PERCENT:-10}"

# ── Renkli output ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}ℹ️  $(date '+%H:%M:%S') $1${NC}"; }
success() { echo -e "${GREEN}✅ $(date '+%H:%M:%S') $1${NC}"; }
warn()    { echo -e "${YELLOW}⚠️  $(date '+%H:%M:%S') $1${NC}"; }
error()   { echo -e "${RED}❌ $(date '+%H:%M:%S') $1${NC}"; exit 1; }

# ── Gerekli araçları kontrol et ──
for cmd in gcloud jq curl; do
    command -v "$cmd" &>/dev/null || error "$cmd bulunamadı. Lütfen yükleyin."
done

echo ""
echo "🪝 HookSniff — Blue-Green Deployment"
echo "═════════════════════════════════════"
echo "  Service:  $SERVICE_NAME"
echo "  Image:    $IMAGE_URL"
echo "  Region:   $REGION"
echo "  Project:  $PROJECT_ID"
echo ""

# ── 1. Mevcut revision'ı kaydet (rollback için) ──
info "Mevcut revision tespit ediliyor..."
CURRENT_REVISION=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.latestReadyRevisionName)" 2>/dev/null) || error "Servis bulunamadı: $SERVICE_NAME"

info "Mevcut revision: $CURRENT_REVISION"

# Mevcut traffic dağılımını al
CURRENT_TRAFFIC=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="json(status.traffic)" 2>/dev/null)
info "Mevcut traffic: $CURRENT_TRAFFIC"

# ── 2. Yeni revision deploy et ──
info "Yeni image deploy ediliyor: $IMAGE_URL"
NEW_REVISION=$(gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE_URL" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --no-traffic \
    --format="value(metadata.name)" 2>/dev/null) || error "Deploy başarısız!"

success "Yeni revision oluşturuldu: $NEW_REVISION"

# ── 3. %10 traffic'i yeni revision'a yönlendir ──
info "Traffic ${INITIAL_TRAFFIC_PERCENT}% yeni revision'a yönlendiriliyor..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --to-revisions="$NEW_REVISION=$INITIAL_TRAFFIC_PERCENT,$CURRENT_REVISION=$((100 - INITIAL_TRAFFIC_PERCENT))" \
    --quiet || error "Traffic güncellenemedi!"

success "Traffic dağılımı: $NEW_REVISION=${INITIAL_TRAFFIC_PERCENT}%, $CURRENT_REVISION=$((100 - INITIAL_TRAFFIC_PERCENT))%"

# ── 4. Health check (30 saniye bekle) ──
info "Health check başlatılıyor (${HEALTH_TIMEOUT}s bekleniyor)..."
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)" 2>/dev/null)

HEALTH_OK=false
ELAPSED=0
CHECK_INTERVAL=5

while [ "$ELAPSED" -lt "$HEALTH_TIMEOUT" ]; do
    sleep "$CHECK_INTERVAL"
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 5 \
        "${SERVICE_URL}${HEALTH_PATH}" 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "200" ]; then
        success "Health check geçti (${ELAPSED}s) — HTTP $HTTP_STATUS"
        HEALTH_OK=true
        break
    else
        info "Health check devam ediyor... (${ELAPSED}/${HEALTH_TIMEOUT}s) — HTTP $HTTP_STATUS"
    fi
done

if [ "$HEALTH_OK" = false ]; then
    error "Health check ${HEALTH_TIMEOUT}s içinde başarısız oldu! Rollback yapılıyor..."
    # Otomatik rollback
    gcloud run services update-traffic "$SERVICE_NAME" \
        --region="$REGION" \
        --project="$PROJECT_ID" \
        --to-revisions="$CURRENT_REVISION=100" \
        --quiet 2>/dev/null
    error "Rollback tamamlandı. Traffic eski revision'a döndü: $CURRENT_REVISION"
fi

# ── 5. Hata oranını kontrol et ──
info "Hata oranı kontrol ediliyor (son 60 saniye)..."
sleep 10  # Biraz veri toplanması için bekle

# Grafana Cloud veya doğrudan metrik endpoint üzerinden kontrol
# Bu örnek, /metrics endpoint'inden 5xx oranını okur
METRICS_RESPONSE=$(curl -s --max-time 10 "${SERVICE_URL}/metrics" 2>/dev/null || echo "")

if [ -n "$METRICS_RESPONSE" ]; then
    # Basit hata oranı hesapla (Prometheus format)
    ERROR_5XX=$(echo "$METRICS_RESPONSE" | grep -E 'http_requests_total\{.*status="5' | awk '{print $2}' | tail -1 || echo "0")
    TOTAL_REQUESTS=$(echo "$METRICS_RESPONSE" | grep -E 'http_requests_total\{' | awk '{print $2}' | tail -1 || echo "1")

    if [ "$TOTAL_REQUESTS" != "0" ] && [ "$TOTAL_REQUESTS" != "1" ]; then
        ERROR_RATE=$(echo "scale=4; $ERROR_5XX / $TOTAL_REQUESTS" | bc 2>/dev/null || echo "0")
        ERROR_RATE_PCT=$(echo "scale=2; $ERROR_RATE * 100" | bc 2>/dev/null || echo "0")

        if (( $(echo "$ERROR_RATE > $ERROR_THRESHOLD" | bc -l 2>/dev/null || echo "0") )); then
            warn "Hata oranı eşiği aşıldı: %{ERROR_RATE_PCT}% > %{ERROR_THRESHOLD}%"
            warn "Rollback yapılıyor..."
            gcloud run services update-traffic "$SERVICE_NAME" \
                --region="$REGION" \
                --project="$PROJECT_ID" \
                --to-revisions="$CURRENT_REVISION=100" \
                --quiet 2>/dev/null
            error "Rollback tamamlandı. Hata oranı yüksek: %{ERROR_RATE_PCT}%"
        else
            success "Hata oranı normal: %{ERROR_RATE_PCT}% (eşik: %{ERROR_THRESHOLD}%)"
        fi
    else
        info "Yeterli metrik verisi yok, hata oranı kontrolü atlanıyor"
    fi
else
    warn "Metrics endpoint erişilemedi, hata oranı kontrolü atlanıyor"
fi

# ── 6. %100 traffic'i yeni revision'a çek ──
info "Tüm traffic yeni revision'a yönlendiriliyor..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --to-revisions="$NEW_REVISION=100" \
    --quiet || error "Traffic %100'e çıkarılamadı!"

success "═══════════════════════════════════════"
success "Blue-Green deploy tamamlandı!"
success "  Eski revision:  $CURRENT_REVISION"
success "  Yeni revision:  $NEW_REVISION"
success "  Traffic:        100% → $NEW_REVISION"
success "═══════════════════════════════════════"
echo ""
info "Rollback için: ./deploy/cloud-run/rollback.sh $SERVICE_NAME $CURRENT_REVISION"
echo ""
