# ═══════════════════════════════════════════════════════════════════
# HookSniff — Google Cloud Run Deployment (Windows PowerShell)
# ═══════════════════════════════════════════════════════════════════
# Kullanım:
#   cd C:\Users\Servet\HookSniff
#   .\deploy\gcp-deploy.ps1
# ═══════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

$PROJECT_ID = "hooksniff-app"
$REGION = "europe-west1"
$API_SERVICE = "hooksniff-api"
$WORKER_SERVICE = "hooksniff-worker"
$REPO = "hooksniff"

Write-Host ""
Write-Host "🪝 HookSniff — Google Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ── Adım 1: GCloud CLI kontrol ──
Write-Host "ℹ️  Google Cloud SDK kontrol ediliyor..." -ForegroundColor Blue
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "❌ gcloud CLI bulunamadı!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ gcloud CLI bulundu" -ForegroundColor Green

# ── Adım 2: Proje ayarla ──
Write-Host "ℹ️  Proje ayarlanıyor: $PROJECT_ID" -ForegroundColor Blue
gcloud config set project $PROJECT_ID
Write-Host "✅ Proje ayarlandı" -ForegroundColor Green

# ── Adım 3: API'leri aktifleştir ──
Write-Host "ℹ️  Gerekli API'ler aktifleştirılıyor..." -ForegroundColor Blue
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com --quiet
Write-Host "✅ API'ler aktifleştirildi" -ForegroundColor Green

# ── Adım 4: Artifact Registry repo oluştur ──
Write-Host "ℹ️  Artifact Registry repo oluşturuluyor..." -ForegroundColor Blue
try {
    gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION --description="HookSniff container images" --quiet 2>$null
} catch {
    Write-Host "⚠️  Repo zaten mevcut" -ForegroundColor Yellow
}
Write-Host "✅ Artifact Registry repo hazır" -ForegroundColor Green

# ── Adım 5: Docker'ı Artifact Registry'e bağla ──
Write-Host "ℹ️  Docker Artifact Registry'e bağlanıyor..." -ForegroundColor Blue
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
Write-Host "✅ Docker bağlandı" -ForegroundColor Green

# ── Adım 6: Secret'ları oluştur ──
Write-Host "ℹ️  Secret'lar Google Secret Manager'a yükleniyor..." -ForegroundColor Blue

if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

# .env.production'dan değerleri oku
$envVars = @{}
Get-Content ".env.production" | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line.Split("=", 2)
        $envVars[$parts[0].Trim()] = $parts[1].Trim()
    }
}

function Create-Secret($name, $value) {
    if ([string]::IsNullOrEmpty($value)) {
        Write-Host "⚠️  Secret '$name' boş, atlanıyor" -ForegroundColor Yellow
        return
    }
    try {
        $value | gcloud secrets create $name --data-file=- --replication-policy="automatic" --quiet 2>$null
    } catch {
        try {
            $value | gcloud secrets versions add $name --data-file=- --quiet 2>$null
        } catch {
            Write-Host "⚠️  Secret '$name' güncellenemedi" -ForegroundColor Yellow
        }
    }
}

Create-Secret "hooksniff-hmac-secret" $envVars["HMAC_SECRET"]
Create-Secret "hooksniff-jwt-secret" $envVars["JWT_SECRET"]
Create-Secret "hooksniff-database-url" $envVars["DATABASE_URL"]
Create-Secret "hooksniff-redis-url" $envVars["REDIS_URL"]
Create-Secret "hooksniff-polar-token" $envVars["POLAR_ACCESS_TOKEN"]
Create-Secret "hooksniff-polar-webhook-secret" $envVars["POLAR_WEBHOOK_SECRET"]
Create-Secret "hooksniff-resend-api-key" $envVars["RESEND_API_KEY"]
Create-Secret "hooksniff-otel-headers" $envVars["OTEL_EXPORTER_OTLP_HEADERS"]

Write-Host "✅ Secret'lar yüklendi" -ForegroundColor Green

# ── Adım 7: Docker image'ları build ve push ──
$API_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api:latest"
$WORKER_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/worker:latest"

Write-Host "ℹ️  API image build ediliyor..." -ForegroundColor Blue
docker build -f Dockerfile.api -t $API_IMAGE .
docker push $API_IMAGE
Write-Host "✅ API image push edildi" -ForegroundColor Green

Write-Host "ℹ️  Worker image build ediliyor..." -ForegroundColor Blue
docker build -f Dockerfile.worker -t $WORKER_IMAGE .
docker push $WORKER_IMAGE
Write-Host "✅ Worker image push edildi" -ForegroundColor Green

# ── Adım 8: Cloud Run API servisi deploy ──
Write-Host "ℹ️  API Cloud Run'a deploy ediliyor..." -ForegroundColor Blue

$envVarsStr = "APP_ENV=production,PORT=3000,RUST_LOG=info`," + `
    "hooksniff=info,LOG_FORMAT=json," + `
    "CORS_ORIGINS=https://hooksniff.is-a.dev," + `
    "APP_URL=https://hooksniff.is-a.dev," + `
    "POLAR_PRODUCT_PRO=79fee3f9-04a2-46c1-804e-8ca7542b8119," + `
    "POLAR_PRODUCT_BUSINESS=e5b7d88a-7606-4963-a070-4102ca6405e2," + `
    "POLAR_ENV=production,RATE_LIMIT_STORE=redis," + `
    "RETENTION_DAYS=7,WEBHOOK_FORMAT=standard," + `
    "NOTIFY_FROM_EMAIL=noreply@hooksniff.is-a.dev," + `
    "OTEL_ENABLED=true," + `
    "OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp," + `
    "MAX_PAYLOAD_BYTES=1048576,WEBHOOK_TIMESTAMP_TOLERANCE_SECS=300"

$secretsStr = "HMAC_SECRET=hooksniff-hmac-secret:latest," + `
    "JWT_SECRET=hooksniff-jwt-secret:latest," + `
    "DATABASE_URL=hooksniff-database-url:latest," + `
    "REDIS_URL=hooksniff-redis-url:latest," + `
    "POLAR_ACCESS_TOKEN=hooksniff-polar-token:latest," + `
    "POLAR_WEBHOOK_SECRET=hooksniff-polar-webhook-secret:latest," + `
    "RESEND_API_KEY=hooksniff-resend-api-key:latest," + `
    "OTEL_EXPORTER_OTLP_HEADERS=hooksniff-otel-headers:latest"

gcloud run deploy $API_SERVICE `
    --image=$API_IMAGE `
    --region=$REGION `
    --platform=managed `
    --allow-unauthenticated `
    --port=3000 `
    --memory=512Mi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=3 `
    --set-env-vars=$envVarsStr `
    --set-secrets=$secretsStr `
    --quiet

$API_URL = gcloud run services describe $API_SERVICE --region=$REGION --format="value(status.url)"
Write-Host "✅ API deploy edildi: $API_URL" -ForegroundColor Green

# ── Adım 9: Cloud Run Worker servisi deploy ──
Write-Host "ℹ️  Worker Cloud Run'a deploy ediliyor..." -ForegroundColor Blue

$workerEnvVars = "APP_ENV=production,RUST_LOG=info`," + `
    "hooksniff=info," + `
    "NOTIFY_FROM_EMAIL=noreply@hooksniff.is-a.dev," + `
    "OTEL_ENABLED=true," + `
    "OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp"

$workerSecrets = "DATABASE_URL=hooksniff-database-url:latest," + `
    "REDIS_URL=hooksniff-redis-url:latest," + `
    "RESEND_API_KEY=hooksniff-resend-api-key:latest," + `
    "OTEL_EXPORTER_OTLP_HEADERS=hooksniff-otel-headers:latest"

gcloud run deploy $WORKER_SERVICE `
    --image=$WORKER_IMAGE `
    --region=$REGION `
    --platform=managed `
    --no-allow-unauthenticated `
    --memory=256Mi `
    --cpu=1 `
    --min-instances=0 `
    --max-instances=2 `
    --set-env-vars=$workerEnvVars `
    --set-secrets=$workerSecrets `
    --quiet

Write-Host "✅ Worker deploy edildi" -ForegroundColor Green

# ── Tamamlandı ──
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎉 Deployment tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "  API URL:     $API_URL"
Write-Host "  Dashboard:   https://hooksniff.is-a.dev"
Write-Host "  API Domain:  https://api.hooksniff.is-a.dev"
Write-Host ""
Write-Host "  Sonraki adımlar:" -ForegroundColor Yellow
Write-Host "  1. Cloudflare DNS'de api.hooksniff.is-a.dev → $API_URL CNAME ekle"
Write-Host "  2. Resend domain doğrulaması (PR merge bekle)"
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
