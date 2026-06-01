# Tunnel DNS Propagation Test
$tunnelLog = "C:\Users\msi-nb\HookSniff\tunnel-dns-test.log"
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }

Write-Host "Tunnel baslatiliyor..." -ForegroundColor Cyan
$cf = Start-Process cloudflared -ArgumentList "tunnel","--url","http://localhost:3000","--no-autoupdate" -PassThru -RedirectStandardError $tunnelLog -NoNewWindow

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

Write-Host "URL: $url" -ForegroundColor Green
Write-Host "DNS propagation bekleniyor (15 saniye)..." -ForegroundColor Yellow
Start-Sleep -s 15

for ($attempt = 1; $attempt -le 5; $attempt++) {
    Write-Host "Deneme $attempt/5..." -ForegroundColor Yellow
    try {
        $tr = Invoke-WebRequest -Uri "$url/health" -TimeoutSec 15 -UseBasicParsing
        Write-Host "BASARILI! Status: $($tr.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($tr.Content)" -ForegroundColor Gray
        break
    } catch {
        Write-Host "Hata: $($_.Exception.Message)" -ForegroundColor Red
        if ($attempt -lt 5) {
            Write-Host "10 saniye bekleniyor..." -ForegroundColor Yellow
            Start-Sleep -s 10
        }
    }
}

if ($cf -and -not $cf.HasExited) {
    Stop-Process -Id $cf.Id -Force -ErrorAction SilentlyContinue
}
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }