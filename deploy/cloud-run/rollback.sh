#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# HookSniff — Cloud Run Rollback Script
# ═══════════════════════════════════════════════════════════════════
# Belirtilen revision'a veya bir önceki known-good revision'a
# traffic'i geri çeker.
#
# Kullanım:
#   ./deploy/cloud-run/rollback.sh <SERVICE_NAME> [REVISION_NAME]
#
# Eğer REVISION_NAME verilmezse, mevcut trafik dağılımından
# bir önceki revision'a geçer.
#
# Ortam değişkenleri:
#   PROJECT_ID  — GCP proje ID (varsayılan: hooksniff-app)
#   REGION      — GCP bölge (varsayılan: europe-west1)
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Konfigürasyon ──
PROJECT_ID="${PROJECT_ID:-hooksniff-app}"
REGION="${REGION:-europe-west1}"
SERVICE_NAME="${1:?Kullanım: rollback.sh <SERVICE_NAME> [REVISION_NAME]}"
TARGET_REVISION="${2:-}"

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
for cmd in gcloud jq; do
    command -v "$cmd" &>/dev/null || error "$cmd bulunamadı."
done

echo ""
echo "🪝 HookSniff — Rollback"
echo "═══════════════════════"
echo "  Service:  $SERVICE_NAME"
echo "  Region:   $REGION"
echo "  Project:  $PROJECT_ID"
echo ""

# ── Mevcut servis bilgilerini al ──
info "Servis bilgileri alınıyor..."
SERVICE_JSON=$(gcloud run services describe "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="json" 2>/dev/null) || error "Servis bulunamadı: $SERVICE_NAME"

CURRENT_REVISION=$(echo "$SERVICE_JSON" | jq -r '.status.latestReadyRevisionName')
info "Mevcut (latest) revision: $CURRENT_REVISION"

# Mevcut traffic dağılımını göster
echo ""
info "Mevcut traffic dağılımı:"
echo "$SERVICE_JSON" | jq -r '.status.traffic[] | "  \(.revisionName // "LATEST"): \(.percent)%"' 2>/dev/null || true
echo ""

# ── Hedef revision belirle ──
if [ -n "$TARGET_REVISION" ]; then
    # Kullanıcı belirli bir revision belirtti
    info "Hedef revision: $TARGET_REVISION"
else
    # Traffic dağılımından bir önceki revision'ı bul
    # %100 traffic alan revision hariç, en yüksek yüzdeli olanı seç
    TARGET_REVISION=$(echo "$SERVICE_JSON" | jq -r '
        .status.traffic
        | map(select(.percent > 0 and .revisionName != null))
        | sort_by(-.percent)
        | if length > 1 then .[1].revisionName else empty end
    ' 2>/dev/null)

    if [ -z "$TARGET_REVISION" ]; then
        # Eğer ikinci bir revision yoksa, tüm revision listesinden bir öncekini al
        info "Traffic'te ikinci revision bulunamadı, revision listesinden aranıyor..."
        ALL_REVISIONS=$(gcloud run revisions list \
            --service="$SERVICE_NAME" \
            --region="$REGION" \
            --project="$PROJECT_ID" \
            --sort-by="~metadata.creationTimestamp" \
            --format="value(metadata.name)" 2>/dev/null)

        # İlk satır mevcut (latest), ikinci satır bir önceki
        TARGET_REVISION=$(echo "$ALL_REVISIONS" | sed -n '2p')

        if [ -z "$TARGET_REVISION" ]; then
            error "Rollback yapılacak revision bulunamadı!"
        fi
    fi

    info "Otomatik seçilen rollback revision: $TARGET_REVISION"
fi

# ── Güvenlik kontrolü ──
if [ "$TARGET_REVISION" = "$CURRENT_REVISION" ]; then
    warn "Hedef revision mevcut revision ile aynı: $TARGET_REVISION"
    warn "Zaten bu revision'da çalışıyor olabilirsiniz."
    read -p "Devam etmek istiyor musunuz? (e/H): " -r CONFIRM
    if [[ ! "$CONFIRM" =~ ^[eE]$ ]]; then
        info "Rollback iptal edildi."
        exit 0
    fi
fi

# ── Rollback uygula ──
info "Traffic $TARGET_REVISION revision'ına yönlendiriliyor..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --to-revisions="$TARGET_REVISION=100" \
    --quiet || error "Traffic güncellenemedi!"

success "═══════════════════════════════════════"
success "Rollback tamamlandı!"
success "  Eski revision:  $CURRENT_REVISION"
success "  Aktif revision: $TARGET_REVISION"
success "  Traffic:        100% → $TARGET_REVISION"
success "═══════════════════════════════════════"
echo ""

# ── Health check ──
info "Rollback sonrası health check..."
SERVICE_URL=$(echo "$SERVICE_JSON" | jq -r '.status.url')
sleep 5

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time 10 \
    "${SERVICE_URL}/health" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    success "Health check geçti — HTTP $HTTP_STATUS"
else
    warn "Health check başarısız — HTTP $HTTP_STATUS"
    warn "Servis durumunu manuel kontrol edin."
fi

echo ""
info "İleri okuma: Grafana dashboard'ında hata oranlarını izleyin."
echo ""
