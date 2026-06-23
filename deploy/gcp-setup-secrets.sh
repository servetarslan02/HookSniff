#!/bin/bash
# ═════════════════════════════════════════════════════════════════════
# HookSniff — GCP Secret Manager Setup + IAM + Deploy
# ═════════════════════════════════════════════════════════════════════
# Bu scripti GCP Cloud Shell'de çalıştır:
#   bash deploy/gcp-setup-secrets.sh
# ═════════════════════════════════════════════════════════════════════

set -e
PROJECT_ID="project-0d7b3b3f-2204-4957-909"
gcloud config set project $PROJECT_ID

echo "═══════════════════════════════════════"
echo " Step 1: Enable Secret Manager API"
echo "═══════════════════════════════════════"
gcloud services enable secretmanager.googleapis.com --quiet

echo ""
echo "═══════════════════════════════════════"
echo " Step 2: Add IAM roles for Secret Access"
echo "═══════════════════════════════════════"

# Cloud Build SA → Secret Manager erişimi
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:499907444852@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

# Cloud Run SA → Secret Manager erişimi
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:hooksniff-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --quiet

echo "✅ IAM rolleri eklendi"

echo ""
echo "═══════════════════════════════════════"
echo " Step 3: Create secrets in Secret Manager"
echo "═══════════════════════════════════════"

# Helper: create secret if not exists, then set value
create_or_update_secret() {
  local SECRET_NAME=$1
  local SECRET_VALUE=$2

  # Check if secret exists
  if gcloud secrets describe $SECRET_NAME --quiet 2>/dev/null; then
    echo "  ♻️  $SECRET_NAME exists, adding new version..."
  else
    echo "  🆕 Creating $SECRET_NAME..."
    gcloud secrets create $SECRET_NAME --replication-policy="automatic" --quiet
  fi
  
  echo -n "$SECRET_VALUE" | gcloud secrets versions add $SECRET_NAME --data-file=- --quiet
  echo "  ✅ $SECRET_NAME set"
}

# ── Otomatik generate edilenler ──
JWT_SECRET=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

echo ""
echo "🔐 Auto-generated secrets:"
echo "  JWT_SECRET:    $JWT_SECRET"
echo "  HMAC_SECRET:   $HMAC_SECRET"
echo "  ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo ""
echo "⚠️  BU DEĞERLERİ BİR YERE KAYDET!"
echo ""

create_or_update_secret "hooksniff-jwt-secret" "$JWT_SECRET"
create_or_update_secret "hooksniff-hmac-secret" "$HMAC_SECRET"
create_or_update_secret "encryption-key" "$ENCRYPTION_KEY"

# ── Manuel girilmesi gerekenler ──
echo ""
echo "═══════════════════════════════════════"
echo " Step 4: Set external service secrets"
echo "═══════════════════════════════════════"
echo ""
echo "Şimdi aşağıdaki değerleri girmen gerekiyor."
echo "Her biri için değer yapıştır, Enter'a bas."
echo "Boş bırakırsan o secret atlanır."
echo ""

read -p "DATABASE_URL (Neon PostgreSQL): " DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  create_or_update_secret "hooksniff-database-url" "$DATABASE_URL"
fi

read -p "REDIS_URL (Upstash redis://...): " REDIS_URL
if [ -n "$REDIS_URL" ]; then
  create_or_update_secret "hooksniff-redis-url" "$REDIS_URL"
fi

read -p "POLAR_ACCESS_TOKEN (Polar.sh): " POLAR_TOKEN
if [ -n "$POLAR_TOKEN" ]; then
  create_or_update_secret "hooksniff-polar-token" "$POLAR_TOKEN"
fi

read -p "POLAR_WEBHOOK_SECRET: " POLAR_WEBHOOK
if [ -n "$POLAR_WEBHOOK" ]; then
  create_or_update_secret "hooksniff-polar-webhook-secret" "$POLAR_WEBHOOK"
fi

read -p "POLAR_PRODUCT_PRO (product ID): " POLAR_PRO
if [ -n "$POLAR_PRO" ]; then
  create_or_update_secret "hooksniff-polar-product-pro" "$POLAR_PRO"
fi

read -p "POLAR_PRODUCT_BUSINESS (product ID): " POLAR_BIZ
if [ -n "$POLAR_BIZ" ]; then
  create_or_update_secret "hooksniff-polar-product-business" "$POLAR_BIZ"
fi

read -p "RESEND_API_KEY: " RESEND_KEY
if [ -n "$RESEND_KEY" ]; then
  create_or_update_secret "hooksniff-resend-api-key" "$RESEND_KEY"
fi

read -p "OTEL_EXPORTER_OTLP_HEADERS (Sentry): " OTEL_HEADERS
if [ -n "$OTEL_HEADERS" ]; then
  create_or_update_secret "hooksniff-otel-headers" "$OTEL_HEADERS"
fi

echo ""
echo "═══════════════════════════════════════"
echo " Step 5: Verify all secrets"
echo "═══════════════════════════════════════"
echo ""
gcloud secrets list --filter="name:hooksniff OR name:encryption" --format="table(name,created)" 
gcloud secrets list --filter="name:encryption" --format="table(name,created)"

echo ""
echo "═══════════════════════════════════════"
echo " Step 6: Trigger Cloud Build deploy"
echo "═══════════════════════════════════════"
echo ""

# Git repo'yu Cloud Shell'e clone et (eğer yoksa)
if [ ! -d "$HOME/HookSniff" ]; then
  echo "📦 Cloning repo..."
  cd $HOME
  git clone https://github.com/servetarslan02/HookSniff.git
fi

cd $HOME/HookSniff
echo "🚀 Starting Cloud Build..."
gcloud builds submit --config=cloudbuild.yaml --project=$PROJECT_ID

echo ""
echo "═══════════════════════════════════════"
echo " ✅ TÜM İŞLEMLER TAMAMLANDI!"
echo "═══════════════════════════════════════"
echo ""
echo "Deploy durumunu kontrol et:"
echo "  gcloud run services list --region=europe-west1"
echo ""
echo "API URL:"
echo "  https://hooksniff-api-499907444852.europe-west1.run.app"
echo ""
echo "Dashboard (Vercel):"
echo "  https://hooksniff.vercel.app"
