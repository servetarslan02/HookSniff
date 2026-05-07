# HookSniff - Google Cloud Run Deployment (Windows PowerShell)
# Kullanim: .\deploy\gcp-deploy.ps1

$ErrorActionPreference = "Stop"

$PROJECT_ID = "hooksniff-app"
$REGION = "europe-west1"
$API_SERVICE = "hooksniff-api"
$WORKER_SERVICE = "hooksniff-worker"
$REPO = "hooksniff"

Write-Host ""
Write-Host "HookSniff - Google Cloud Run Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: GCloud CLI kontrol
Write-Host "[1/9] Google Cloud SDK kontrol ediliyor..." -ForegroundColor Blue
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Host "HATA: gcloud CLI bulunamadi!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: gcloud CLI bulundu" -ForegroundColor Green

# Step 2: Proje ayarla
Write-Host "[2/9] Proje ayarlaniyor: $PROJECT_ID" -ForegroundColor Blue
gcloud config set project $PROJECT_ID
Write-Host "OK: Proje ayarlandi" -ForegroundColor Green

# Step 3: API'leri aktiflesstir
Write-Host "[3/9] Gerekli API'ler aktiflestiriliyor..." -ForegroundColor Blue
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com --quiet
Write-Host "OK: API'ler aktiflesstirildi" -ForegroundColor Green

# Step 4: Artifact Registry repo olustur
Write-Host "[4/9] Artifact Registry repo olusturuluyor..." -ForegroundColor Blue
try {
    gcloud artifacts repositories create $REPO --repository-format=docker --location=$REGION --description="HookSniff container images" --quiet 2>$null
} catch {
    Write-Host "UYARI: Repo zaten mevcut" -ForegroundColor Yellow
}
Write-Host "OK: Artifact Registry repo hazir" -ForegroundColor Green

# Step 5: Docker'i Artifact Registry'e bagla
Write-Host "[5/9] Docker Artifact Registry'e baglaniyor..." -ForegroundColor Blue
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
Write-Host "OK: Docker baglandi" -ForegroundColor Green

# Step 6: Secret'lari olustur
Write-Host "[6/9] Secret'lar Google Secret Manager'a yukleniyor..." -ForegroundColor Blue

if (-not (Test-Path ".env.production")) {
    Write-Host "HATA: .env.production dosyasi bulunamadi!" -ForegroundColor Red
    exit 1
}

# .env.production'dan degerleri oku
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
        Write-Host "UYARI: Secret '$name' bos, atlaniyor" -ForegroundColor Yellow
        return
    }
    try {
        $value | gcloud secrets create $name --data-file=- --replication-policy="automatic" --quiet 2>$null
        Write-Host "  Secret '$name' olusturuldu" -ForegroundColor Gray
    } catch {
        try {
            $value | gcloud secrets versions add $name --data-file=- --quiet 2>$null
            Write-Host "  Secret '$name' guncellendi" -ForegroundColor Gray
        } catch {
            Write-Host "UYARI: Secret '$name' guncellenemedi" -ForegroundColor Yellow
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

Write-Host "OK: Secret'lar yuklendi" -ForegroundColor Green

# Step 7: Docker image'lari build ve push
$API_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/api:latest"
$WORKER_IMAGE = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/worker:latest"

# Check if Docker is running
Write-Host "[7/9] Docker kontrol ediliyor..." -ForegroundColor Blue
try {
    docker info 2>$null | Out-Null
    Write-Host "OK: Docker calisiyor" -ForegroundColor Green
} catch {
    Write-Host "HATA: Docker Desktop calismiyor! Lutfen Docker Desktop'i acin ve tekrar deneyin." -ForegroundColor Red
    exit 1
}

Write-Host "[7/9] API image build ediliyor..." -ForegroundColor Blue
docker build -f Dockerfile.api -t $API_IMAGE .
docker push $API_IMAGE
Write-Host "OK: API image push edildi" -ForegroundColor Green

Write-Host "[8/9] Worker image build ediliyor..." -ForegroundColor Blue
docker build -f Dockerfile.worker -t $WORKER_IMAGE .
docker push $WORKER_IMAGE
Write-Host "OK: Worker image push edildi" -ForegroundColor Green

# Step 8: Cloud Run API servisi deploy
Write-Host "[9/9] API Cloud Run'a deploy ediliyor..." -ForegroundColor Blue

$envVarsStr = "APP_ENV=production,RUST_LOG=info,hooksniff=info,LOG_FORMAT=json,CORS_ORIGINS=https://hooksniff.is-a.dev,APP_URL=https://hooksniff.is-a.dev,POLAR_PRODUCT_PRO=79fee3f9-04a2-46c1-804e-8ca7542b8119,POLAR_PRODUCT_BUSINESS=e5b7d88a-7606-4963-a070-4102ca6405e2,POLAR_ENV=production,RATE_LIMIT_STORE=redis,RETENTION_DAYS=7,WEBHOOK_FORMAT=standard,NOTIFY_FROM_EMAIL=noreply@hooksniff.is-a.dev,OTEL_ENABLED=true,OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp,MAX_PAYLOAD_BYTES=1048576,WEBHOOK_TIMESTAMP_TOLERANCE_SECS=300"

$secretsStr = "HMAC_SECRET=hooksniff-hmac-secret:latest,JWT_SECRET=hooksniff-jwt-secret:latest,DATABASE_URL=hooksniff-database-url:latest,REDIS_URL=hooksniff-redis-url:latest,POLAR_ACCESS_TOKEN=hooksniff-polar-token:latest,POLAR_WEBHOOK_SECRET=hooksniff-polar-webhook-secret:latest,RESEND_API_KEY=hooksniff-resend-api-key:latest,OTEL_EXPORTER_OTLP_HEADERS=hooksniff-otel-headers:latest"

gcloud run deploy $API_SERVICE --image=$API_IMAGE --region=$REGION --platform=managed --allow-unauthenticated --memory=512Mi --cpu=1 --min-instances=0 --max-instances=3 --set-env-vars=$envVarsStr --set-secrets=$secretsStr --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "HATA: API deploy basarisiz!" -ForegroundColor Red
    exit 1
}

$API_URL = gcloud run services describe $API_SERVICE --region=$REGION --format="value(status.url)"
Write-Host "OK: API deploy edildi: $API_URL" -ForegroundColor Green

# Step 9: Cloud Run Worker servisi deploy
Write-Host "[10] Worker Cloud Run'a deploy ediliyor..." -ForegroundColor Blue

$workerEnvVars = "APP_ENV=production,RUST_LOG=info,hooksniff=info,NOTIFY_FROM_EMAIL=noreply@hooksniff.is-a.dev,OTEL_ENABLED=true,OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-east-0.grafana.net/otlp"

$workerSecrets = "DATABASE_URL=hooksniff-database-url:latest,REDIS_URL=hooksniff-redis-url:latest,RESEND_API_KEY=hooksniff-resend-api-key:latest,OTEL_EXPORTER_OTLP_HEADERS=hooksniff-otel-headers:latest"

gcloud run deploy $WORKER_SERVICE --image=$WORKER_IMAGE --region=$REGION --platform=managed --no-allow-unauthenticated --memory=256Mi --cpu=1 --min-instances=0 --max-instances=2 --set-env-vars=$workerEnvVars --set-secrets=$workerSecrets --quiet

Write-Host "OK: Worker deploy edildi" -ForegroundColor Green

# Tamamlandi
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TAMAMLANDI!" -ForegroundColor Green
Write-Host ""
Write-Host "  API URL:     $API_URL"
Write-Host "  Dashboard:   https://hooksniff.is-a.dev"
Write-Host "  API Domain:  https://api.hooksniff.is-a.dev"
Write-Host ""
Write-Host "Sonraki adimlar:" -ForegroundColor Yellow
Write-Host "  1. Cloudflare DNS: api.hooksniff.is-a.dev -> $API_URL CNAME ekle"
Write-Host "  2. Resend domain dogrulamasi icin PR merge bekle"
Write-Host "========================================" -ForegroundColor Cyan
