# Webhook Deploy Server
# GitHub Actions'tan deploy isteği alıp Docker konteynerlerini güncelleyen server

$port = 9999
$deployToken = "your-secret-deploy-token-change-me"  # Bu değeri GitHub Secrets'teki DEPLOY_TOKEN ile eşleştir

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "🎯 Webhook deploy server çalışıyor: http://localhost:$port/" -ForegroundColor Green
Write-Host "📍 Proje dizini: C:\Users\msi-nb\HookSniff" -ForegroundColor Cyan

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $response.ContentType = "application/json"
        
        if ($request.Url.LocalPath -eq "/deploy" -and $request.HttpMethod -eq "POST") {
            $authHeader = $request.Headers["Authorization"]
            $token = $authHeader -replace "Bearer ", ""
            
            if ($token -eq $deployToken) {
                Write-Host "✅ [$(Get-Date -Format 'HH:mm:ss')] Deploy isteği alındı!" -ForegroundColor Green
                $response.StatusCode = 200
                $responseBody = '{"status":"success","message":"Deploy başlatıldı"}'
                
                # Arka planda deploy işlemini çalıştır
                Start-Job -ScriptBlock {
                    Set-Location "C:\Users\msi-nb\HookSniff"
                    Write-Host "📥 [$(Get-Date -Format 'HH:mm:ss')] Yeni Docker imajları çekiliyor..." -ForegroundColor Cyan
                    docker compose pull
                    
                    Write-Host "🚀 [$(Get-Date -Format 'HH:mm:ss')] Konteynerler yeniden başlatılıyor..." -ForegroundColor Green
                    docker compose up -d
                    
                    Write-Host "✅ [$(Get-Date -Format 'HH:mm:ss')] Deploy tamamlandı!" -ForegroundColor Green
                }
            } else {
                Write-Host "❌ [$(Get-Date -Format 'HH:mm:ss')] Geçersiz token!" -ForegroundColor Red
                $response.StatusCode = 401
                $responseBody = '{"status":"error","message":"Unauthorized"}'
            }
        } else {
            $response.StatusCode = 404
            $responseBody = '{"status":"error","message":"Not Found"}'
        }
        
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($responseBody)
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
    } catch {
        Write-Host "❌ Hata: $_" -ForegroundColor Red
    }
}

$listener.Stop()
