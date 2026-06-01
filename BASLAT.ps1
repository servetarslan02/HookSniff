# ============================================================
# HookSniff Yerel Sunucu ve Tünel Başlatıcı
# Tek komut: .\BASLAT.ps1
# ============================================================

$VERCEL_TOKEN = "vcp_5D97CGRDJON4keD0BPp8YoQRH3NrUkCOw93jmDzBplmmhZ2tpB3OAHvx"
$TUNNEL_LOG = "C:\Users\msi-nb\HookSniff\tunnel.log"
$PROJECT_DIR = "C:\Users\msi-nb\HookSniff"
$DASHBOARD_DIR = "$PROJECT_DIR\dashboard"
$CLOUDFLARED_CONFIG = "$PROJECT_DIR\cloudflared-empty.yml"

# 1. Docker başlat
Write-Host ""
Write-Host "🚀 [1/3] Docker konteynerleri başlatılıyor..." -ForegroundColor Cyan
cd $PROJECT_DIR
docker-compose -f docker-compose.local.yml up -d
Write-Host "⏳ Servislerin hazır olması bekleniyor..." -ForegroundColor Yellow
Start-Sleep -s 8

# 2. Cloudflare Tunnel başlat
# NOT: --config ile boş config kullanıyoruz, böylece %USERPROFILE%\.cloudflared\config.yml
#      dosyasındaki ingress kuralları (catch-all 404) bypass edilir.
Write-Host "🌐 [2/3] Cloudflare tunnel başlatılıyor..." -ForegroundColor Cyan
if (Test-Path $TUNNEL_LOG) { Remove-Item $TUNNEL_LOG -Force }
$cf_process = Start-Process cloudflared -ArgumentList "tunnel","--config",$CLOUDFLARED_CONFIG,"--no-autoupdate" -PassThru -RedirectStandardError $TUNNEL_LOG -NoNewWindow

# URL oluşmasını bekle (maks 45 saniye)
$URL = $null
for ($i = 0; $i -lt 45; $i++) {
    Start-Sleep -s 1
    if (-not (Test-Path $TUNNEL_LOG)) { continue }
    $log = Get-Content $TUNNEL_LOG -ErrorAction SilentlyContinue
    $match = $log | Select-String "https://.*trycloudflare\.com"
    if ($match) {
        $URL = ($match.Matches[0].Value -split '\s')[0]
        break
    }
}

if (-not $URL) {
    Write-Host "❌ Tünel URL'i alınamadı! tunnel.log kontrol edin: $TUNNEL_LOG" -ForegroundColor Red
    Write-Host "   Devam etmek için Enter'a basın..." -ForegroundColor Gray
    Read-Host
    exit 1
}

Write-Host "⏳ DNS propagation bekleniyor (20 saniye)..." -ForegroundColor Yellow
Start-Sleep -s 20

# Tunnel sağlık kontrolü (maks 3 deneme)
$tunnelHealthy = $false
for ($attempt = 1; $attempt -le 3; $attempt++) {
    try {
        $healthCheck = Invoke-WebRequest -Uri "$URL/health" -TimeoutSec 30 -UseBasicParsing
        if ($healthCheck.StatusCode -eq 200) {
            $tunnelHealthy = $true
            Write-Host "✅ Tünel Sağlık Kontrolü: BAŞARILI (200 OK)" -ForegroundColor Green
            break
        }
    } catch {
        $statusCode = 0
        try { $statusCode = $_.Exception.Response.StatusCode.value__ } catch {}
        Write-Host "⚠️  Deneme $attempt/3: Status $statusCode" -ForegroundColor Yellow
        if ($attempt -lt 3) { Start-Sleep -s 10 }
    }
}

if (-not $tunnelHealthy) {
    Write-Host "❌ Tünel sağlık kontrolü başarısız! Tunnel URL: $URL/health" -ForegroundColor Red
    Write-Host "   tunnel.log kontrol edin: $TUNNEL_LOG" -ForegroundColor Red
    Write-Host "   Devam etmek için Enter'a basın..." -ForegroundColor Gray
    Read-Host
}

Write-Host "✅ Tünel Hazır: $URL" -ForegroundColor Green

# 3. Vercel Environment Variables güncelle
Write-Host "🔄 [3/3] Vercel güncelleniyor..." -ForegroundColor Cyan
cd $DASHBOARD_DIR
$env:VERCEL_TOKEN = $VERCEL_TOKEN

# Production env güncelle
& npx vercel env rm NEXT_PUBLIC_API_URL production --yes --token $VERCEL_TOKEN 2>$null
& npx vercel env add NEXT_PUBLIC_API_URL production --value $URL --yes --non-interactive --token $VERCEL_TOKEN 2>$null

# Preview env güncelle
& npx vercel env rm NEXT_PUBLIC_API_URL preview --yes --token $VERCEL_TOKEN 2>$null
& npx vercel env add NEXT_PUBLIC_API_URL preview --value $URL --yes --non-interactive --token $VERCEL_TOKEN 2>$null

# Development env güncelle
& npx vercel env rm NEXT_PUBLIC_API_URL development --yes --token $VERCEL_TOKEN 2>$null
& npx vercel env add NEXT_PUBLIC_API_URL development --value $URL --yes --non-interactive --token $VERCEL_TOKEN 2>$null

cd $PROJECT_DIR

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  🎉 HAZIR!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐 API Tunnel:   $URL" -ForegroundColor White
Write-Host "  📊 Dashboard:    https://hooksniff.vercel.app" -ForegroundColor White
Write-Host "  🏠 Yerel:        http://localhost:3001" -ForegroundColor White
Write-Host "  🔑 API Health:   $URL/health" -ForegroundColor White
Write-Host ""
Write-Host "  ⚠️  Production ortamı için Vercel'de manual redeploy gerekebilir." -ForegroundColor Yellow
Write-Host "     Tunnel çalışırken bu script açık kalmalı." -ForegroundColor Yellow
Write-Host "     Durdurmak için Ctrl+C." -ForegroundColor Yellow
Write-Host ""

# Tunnel açık tut
try {
    while($true) { Start-Sleep -s 60 }
} finally {
    Write-Host "🛑 Tunnel kapatılıyor..." -ForegroundColor Red
    if ($cf_process -and -not $cf_process.HasExited) {
        Stop-Process -Id $cf_process.Id -Force -ErrorAction SilentlyContinue
    }
}
