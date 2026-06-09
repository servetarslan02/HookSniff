#!/bin/bash
# ─── HookSniff: Gmail SMTP Secret Setup for GCP ───
# Run this in GCP Cloud Shell (console.cloud.google.com →>_ icon)
# Project: hooksniff-ccac2

set -e

PROJECT_ID="hooksniff-ccac2"

echo "📧 Creating Gmail SMTP secrets in GCP Secret Manager..."

# 1. Create Gmail Address secret
echo -n "servetarslan02@gmail.com" | \
  gcloud secrets create hooksniff-gmail-address \
    --data-file=- \
    --project="$PROJECT_ID" \
    2>/dev/null || \
echo -n "servetarslan02@gmail.com" | \
  gcloud secrets versions add hooksniff-gmail-address \
    --data-file=- \
    --project="$PROJECT_ID"

echo "✅ GMAIL_ADDRESS secret created"

# 2. Create Gmail App Password secret
echo -n "fcntpowhqzrkssz" | \
  gcloud secrets create hooksniff-gmail-app-password \
    --data-file=- \
    --project="$PROJECT_ID" \
    2>/dev/null || \
echo -n "fcntpowhqzrkssz" | \
  gcloud secrets versions add hooksniff-gmail-app-password \
    --data-file=- \
    --project="$PROJECT_ID"

echo "✅ GMAIL_APP_PASSWORD secret created"

# 3. Grant Cloud Build access to the new secrets
PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
CLOUDBUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud secrets add-iam-policy-binding hooksniff-gmail-address \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT_ID"

gcloud secrets add-iam-policy-binding hooksniff-gmail-app-password \
  --member="serviceAccount:${CLOUDBUILD_SA}" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT_ID"

echo "✅ IAM bindings set for Cloud Build"

# 4. Grant Cloud Run access to the new secrets
gcloud secrets add-iam-policy-binding hooksniff-gmail-address \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT_ID"

gcloud secrets add-iam-policy-binding hooksniff-gmail-app-password \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project="$PROJECT_ID"

echo "✅ IAM bindings set for Cloud Run"
echo ""
echo "🎉 Done! Now trigger a new Cloud Build deploy to pick up the changes."
echo "   The API will use Gmail SMTP instead of Resend."
