# HookSniff Local Update Script
# GitHub'tan pull, build, push ve deploy

Write-Host "🔄 HookSniff güncelleniyor..." -ForegroundColor Cyan

Set-Location "C:\Users\msi-nb\HookSniff"

# 1. GitHub'tan güncelleme çek
Write-Host "`n📥 GitHub'tan güncellemeler çekiliyor..." -ForegroundColor Yellow
git pull origin main

# 2. Docker konteynerlerini durdur
Write-Host "`n🛑 Konteynerler durduruluyor..." -ForegroundColor Yellow
docker compose down

# 3. Cache temizle
Write-Host "`n🧹 Docker cache temizleniyor..." -ForegroundColor Yellow
docker system prune -af

# 4. Lokal build (API, Worker, Dashboard)
Write-Host "`n🏗️  Lokal build başlatılıyor..." -ForegroundColor Cyan
docker compose build --no-cache

# 5. Konteynerler başlat
Write-Host "`n🚀 Konteynerler başlatılıyor..." -ForegroundColor Green
docker compose up -d

# 6. Kontrol et
Write-Host "`n✅ Kontrol ediliyor..." -ForegroundColor Green
Start-Sleep -Seconds 5
docker ps --format "table {{.Names}}\t{{.Status}}"

Write-Host "`n✅ Tamamlandı! Sayfayı yenile:" -ForegroundColor Green
Write-Host "   📊 Dashboard: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   🔌 API: http://localhost:3000" -ForegroundColor Cyan
