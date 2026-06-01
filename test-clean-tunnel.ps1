# Temiz Tunnel Test Script
Write-Host "=== Temiz Tunnel Test ===" -ForegroundColor Cyan

# Tunnel log dosyası
$tunnelLog = "C:\Users\msi-nb\HookSniff\tunnel-test.log"
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }

# API sağlık kontrolü
Write-Host "`n[1] API sağlık kontrolü..." -ForegroundColor Yellow
try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 10 -UseBasicParsing
    Write-Host "  API Status: $($r.StatusCode) - HEALTHY" -ForegroundColor Green
} catch {
    Write-Host "  API FAIL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Tunnel başlat
Write-Host "`n[2] Cloudflare tunnel başlatılıyor..." -ForegroundColor Yellow
$cf = Start-Process cloudflared -ArgumentList "tunnel","--url","http://localhost:3000","--no-autoupdate" -PassThru -RedirectStandardError $tunnelLog -NoNewWindow

# URL bekle
$url = $null
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -s 1
    if (-not (Test-Path $tunnelLog)) { continue }
    $log = Get-Content $tunnelLog -ErrorAction SilentlyContinue
    $match = $log | Select-String "https://.*trycloudflare\.com"
    if ($match) {
        $url = ($match.Matches[0].Value -split '\s')[0]
        break
    }
}

if (-not $url) {
    Write-Host "  Tunnel URL alınamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "  Tunnel URL: $url" -ForegroundColor Green

# Tunnel health kontrol
Write-Host "`n[3] Tunnel health kontrol (5 saniye bekleniyor)..." -ForegroundColor Yellow
Start-Sleep -s 5

try {
    $tr = Invoke-WebRequest -Uri "$url/health" -TimeoutSec 15 -UseBasicParsing
    Write-Host "  Tunnel Status: $($tr.StatusCode) - ERİŞİLEBİLİR" -ForegroundColor Green
    Write-Host "  Response: $($tr.Content)" -ForegroundColor Gray
} catch {
    Write-Host "  Tunnel FAIL: $($_.Exception.Message)" -ForegroundColor Red
    
    # Debug bilgisi
    Write-Host "`n  Debug: Tunnel log son 10 satır:" -ForegroundColor Yellow
    $log = Get-Content $tunnelLog -Tail 10 -ErrorAction SilentlyContinue
    $log | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
}

# Cleanup
if ($cf -and -not $cf.HasExited) {
    Stop-Process -Id $cf.Id -Force -ErrorAction SilentlyContinue
}
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }

Write-Host "`n=== Test Tamamlandı ===" -ForegroundColor Cyan