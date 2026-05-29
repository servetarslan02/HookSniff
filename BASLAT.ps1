# HookSniff Yerel Sunucu ve Tünel Başlatıcı
# Bu script her başladığında tüneli açar ve Vercel'i günceller.

$VERCEL_TOKEN = "vcp_1QcjDdCNwpMj8mCNf1UoDBMat1Yi128aMhzmJE4FzEF31aiTZJ3qfJ2h"

Write-Host "🚀 HookSniff Docker konteynerleri başlatılıyor..." -ForegroundColor Cyan
cd "C:\Users\msi-nb\HookSniff"
docker-compose -f docker-compose.local.yml up -d

Write-Host "🌐 Tünel başlatılıyor (Localtunnel)..." -ForegroundColor Cyan
# npx yerine npx.cmd kullanıyoruz
$lt_process = Start-Process npx.cmd -ArgumentList "localtunnel --port 3000 --subdomain hooksniff-local-servet" -PassThru -NoNewWindow -RedirectStandardOutput "C:\Users\msi-nb\lt.log"

Start-Sleep -s 10
$URL = Get-Content "C:\Users\msi-nb\lt.log" | Select-String "your url is:" | ForEach-Object { $_.ToString().Split(" ")[3] }

if ($URL) {
    Write-Host "✅ Tünel Hazır: $URL" -ForegroundColor Green
    Write-Host "Updating Vercel Environment Variables..." -ForegroundColor Cyan
    
    $API_URL = "$URL/v1"
    
    # Vercel CLI ile güncelleme
    cd "C:\Users\msi-nb\HookSniff\dashboard"
    $env:VERCEL_TOKEN = $VERCEL_TOKEN
    
    & vercel env rm NEXT_PUBLIC_API_URL production -y
    & vercel env add NEXT_PUBLIC_API_URL production --value $API_URL --yes --non-interactive
    
    & vercel env rm NEXT_PUBLIC_API_URL development -y
    & vercel env add NEXT_PUBLIC_API_URL development --value $API_URL --yes --non-interactive

    Write-Host "🎉 Her şey hazır! Artık https://hooksniff.vercel.app adresinden giriş yapabilirsin." -ForegroundColor Green
} else {
    Write-Host "❌ Tünel URL'i alınamadı. Lütfen lt.log dosyasını kontrol edin." -ForegroundColor Red
}

Write-Host "Script açık kalmalı (Tünel çalışıyor). Kapatmak için Ctrl+C basabilirsin."
while($true) { Start-Sleep -s 60 }
