# HookRelay Test Scripti
# API çalışırken bu scripti PowerShell'de çalıştır

$BASE = "http://localhost:3000/v1"
$HEADERS = @{
    "Authorization" = "Bearer hr_live_test"
    "Content-Type" = "application/json"
}

Write-Host "🧪 HookRelay Test Başlıyor..." -ForegroundColor Cyan
Write-Host ""

# 1. Health Check
Write-Host "1️⃣  Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method GET
    Write-Host "   ✅ API çalışıyor!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API çalışmıyor! Önce 'cargo run' başlat." -ForegroundColor Red
    exit
}

# 2. Kayıt ol (test kullanıcısı)
Write-Host ""
Write-Host "2️⃣  Test kullanıcısı oluşturuluyor..." -ForegroundColor Yellow
try {
    $register = Invoke-RestMethod -Uri "$BASE/auth/register" -Method POST -Headers $HEADERS -Body (@{
        email = "test@hookrelay.is-a.dev"
        password = "Test1234!"
    } | ConvertTo-Json)
    $TOKEN = $register.token
    $API_KEY = $register.customer.api_key
    Write-Host "   ✅ Kayıt başarılı! API Key: $($API_KEY.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Kayıt hatası (zaten var olabilir), login deneniyor..." -ForegroundColor Yellow
    try {
        $login = Invoke-RestMethod -Uri "$BASE/auth/login" -Method POST -Headers $HEADERS -Body (@{
            email = "test@hookrelay.is-a.dev"
            password = "Test1234!"
        } | ConvertTo-Json)
        $TOKEN = $login.token
        Write-Host "   ✅ Login başarılı!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Login de başarısız: $($_.Exception.Message)" -ForegroundColor Red
        exit
    }
}

$HEADERS["Authorization"] = "Bearer $TOKEN"

# 3. Endpoint oluştur
Write-Host ""
Write-Host "3️⃣  Webhook endpoint oluşturuluyor..." -ForegroundColor Yellow
$endpoint = Invoke-RestMethod -Uri "$BASE/endpoints" -Method POST -Headers $HEADERS -Body (@{
    url = "https://httpbin.org/post"
    description = "Test endpoint"
} | ConvertTo-Json)
$ENDPOINT_ID = $endpoint.id
Write-Host "   ✅ Endpoint oluşturuldu: $ENDPOINT_ID" -ForegroundColor Green

# 4. Webhook gönder
Write-Host ""
Write-Host "4️⃣  Webhook gönderiliyor..." -ForegroundColor Yellow
$webhook = Invoke-RestMethod -Uri "$BASE/webhooks" -Method POST -Headers $HEADERS -Body (@{
    endpoint_id = $ENDPOINT_ID
    event = "order.created"
    data = @{
        order_id = "12345"
        amount = 99.99
        customer = "test@example.com"
    }
} | ConvertTo-Json)
Write-Host "   ✅ Webhook gönderildi! ID: $($webhook.id), Durum: $($webhook.status)" -ForegroundColor Green

# 5. Durumunu kontrol et
Write-Host ""
Write-Host "5️⃣  Webhook durumu kontrol ediliyor (3 saniye bekleniyor)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$delivery = Invoke-RestMethod -Uri "$BASE/webhooks/$($webhook.id)" -Method GET -Headers $HEADERS
Write-Host "   📊 Durum: $($delivery.status), Deneme: $($delivery.attempt_count)" -ForegroundColor Cyan

# 6. Endpoint listesi
Write-Host ""
Write-Host "6️⃣  Endpoint listesi..." -ForegroundColor Yellow
$endpoints = Invoke-RestMethod -Uri "$BASE/endpoints" -Method GET -Headers $HEADERS
Write-Host "   📋 Toplam endpoint: $($endpoints.Count)" -ForegroundColor Cyan

# 7. İstatistikler
Write-Host ""
Write-Host "7️⃣  İstatistikler..." -ForegroundColor Yellow
$stats = Invoke-RestMethod -Uri "$BASE/stats" -Method GET -Headers $HEADERS
Write-Host "   📈 Toplam teslimat: $($stats.total_deliveries)" -ForegroundColor Cyan
Write-Host "   ✅ Başarılı: $($stats.delivered)" -ForegroundColor Green
Write-Host "   ❌ Başarısız: $($stats.failed)" -ForegroundColor Red
Write-Host "   ⏳ Bekleyen: $($stats.pending)" -ForegroundColor Yellow
Write-Host "   🎯 Başarı oranı: %$([math]::Round($stats.success_rate, 1))" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 Test tamamlandı!" -ForegroundColor Green
