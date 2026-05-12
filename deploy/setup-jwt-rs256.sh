#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  HookSniff — JWT RS256 Production Kurulum Scripti
# ═══════════════════════════════════════════════════════════════
#
#  Bu script:
#  1. RSA key pair olusturur
#  2. Google Cloud Secret Manager'a yukler
#  3. Cloud Run servisine baglar
#  4. Servisi yeniden deploy eder
#
#  Kullanim:
#    chmod +x deploy/setup-jwt-rs256.sh
#    ./deploy/setup-jwt-rs256.sh
#
#  Gereksinimler:
#    - gcloud CLI yuklu ve auth yapilmis
#    - Proje: hooksniff-app
#    - Region: europe-west1
# ═══════════════════════════════════════════════════════════════

set -e

PROJECT="hooksniff-app"
REGION="europe-west1"
SERVICE="hooksniff-api"
KEY_DIR="deploy/keys"

echo "🪝 HookSniff — JWT RS256 Kurulum"
echo "══════════════════════════════════"

# 1. gcloud kontrol
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI bulunamadi!"
    echo "   Kurulum: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ gcloud CLI bulundu"

# 2. Auth kontrol
ACTIVE_ACCOUNT=$(gcloud auth list --filter="status:ACTIVE" --format="value(account)" 2>/dev/null)
if [ -z "$ACTIVE_ACCOUNT" ]; then
    echo "❌ gcloud auth yapilmamis!"
    echo "   Calistir: gcloud auth login"
    exit 1
fi
echo "✅ GCP hesabi: $ACTIVE_ACCOUNT"

# 3. Proje ayarla
gcloud config set project "$PROJECT" 2>/dev/null
echo "✅ Proje: $PROJECT"

# 4. RSA key pair olustur
mkdir -p "$KEY_DIR"
if [ ! -f "$KEY_DIR/jwt_private.pem" ] || [ ! -f "$KEY_DIR/jwt_public.pem" ]; then
    echo "🔑 RSA key pair olusturuluyor..."
    openssl genrsa -out "$KEY_DIR/jwt_private.pem" 2048 2>/dev/null
    openssl rsa -in "$KEY_DIR/jwt_private.pem" -pubout -out "$KEY_DIR/jwt_public.pem" 2>/dev/null
    echo "✅ RSA key pair olusturuldu: $KEY_DIR/"
else
    echo "✅ RSA key pair zaten mevcut"
fi

# 5. Secret Manager'a yukle
echo "🔐 Secret Manager'a yukleniyor..."

# Private key
if gcloud secrets describe jwt-private-key --project="$PROJECT" &>/dev/null; then
    echo "   jwt-private-key guncelleniyor..."
    gcloud secrets versions add jwt-private-key --data-file="$KEY_DIR/jwt_private.pem" --project="$PROJECT"
else
    echo "   jwt-private-key olusturuluyor..."
    gcloud secrets create jwt-private-key --project="$PROJECT"
    gcloud secrets versions add jwt-private-key --data-file="$KEY_DIR/jwt_private.pem" --project="$PROJECT"
fi
echo "✅ jwt-private-key yuklendi"

# Public key
if gcloud secrets describe jwt-public-key --project="$PROJECT" &>/dev/null; then
    echo "   jwt-public-key guncelleniyor..."
    gcloud secrets versions add jwt-public-key --data-file="$KEY_DIR/jwt_public.pem" --project="$PROJECT"
else
    echo "   jwt-public-key olusturuluyor..."
    gcloud secrets create jwt-public-key --project="$PROJECT"
    gcloud secrets versions add jwt-public-key --data-file="$KEY_DIR/jwt_public.pem" --project="$PROJECT"
fi
echo "✅ jwt-public-key yuklendi"

# 6. Cloud Run service account'a secret erisim izni ver
echo "🔒 IAM izni veriliyor..."
SA_EMAIL=$(gcloud run services describe "$SERVICE" --region="$REGION" --format="value(spec.template.spec.serviceAccountName)" --project="$PROJECT" 2>/dev/null)

if [ -z "$SA_EMAIL" ]; then
    # Default Compute SA
    SA_NUMBER=$(gcloud projects describe "$PROJECT" --format="value(projectNumber)" --project="$PROJECT")
    SA_EMAIL="${SA_NUMBER}-compute@developer.gserviceaccount.com"
fi

gcloud secrets add-iam-policy-binding jwt-private-key \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT" 2>/dev/null

gcloud secrets add-iam-policy-binding jwt-public-key \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project="$PROJECT" 2>/dev/null

echo "✅ IAM izinleri verildi ($SA_EMAIL)"

# 7. Cloud Run servisini guncelle
echo "🚀 Cloud Run servisi guncelleniyor..."
gcloud run services update "$SERVICE" \
    --region="$REGION" \
    --project="$PROJECT" \
    --set-secrets="JWT_PRIVATE_KEY=jwt-private-key:latest,JWT_PUBLIC_KEY=jwt-public-key:latest" \
    --set-env-vars="JWT_KEY_ID=hooksniff-1"

echo "✅ Cloud Run servisi guncellendi"

# 8. Yeni revision'i kontrol et
echo ""
echo "══════════════════════════════════"
echo "✅ JWT RS256 kurulumu tamamlandi!"
echo ""
echo "   Servis: https://$SERVICE-$(gcloud projects describe "$PROJECT" --format='value(projectNumber)' --project="$PROJECT").$REGION.run.app"
echo ""
echo "   Dogrulama:"
echo "   curl https://$SERVICE-$(gcloud projects describe "$PROJECT" --format='value(projectNumber)' --project="$PROJECT").$REGION.run.app/health"
echo ""
echo "   Log kontrol:"
echo "   gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE AND textPayload:RS256' --limit=5 --project=$PROJECT"
echo "══════════════════════════════════"
