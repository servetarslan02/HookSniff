# Keycloak setup script for HookSniff SSO testing
$ErrorActionPreference = "SilentlyContinue"

# Get admin token
$tokenResp = Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" -Method POST -ContentType "application/x-www-form-urlencoded" -Body "grant_type=password&client_id=admin-cli&username=admin&password=admin"
$KC_TOKEN = $tokenResp.access_token
$headers = @{ Authorization = "Bearer $KC_TOKEN"; "Content-Type" = "application/json" }

Write-Host "=== Keycloak Setup ===" -ForegroundColor Cyan

# 1. Create realm
$realm = @{ realm = "hooksniff"; enabled = $true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/admin/realms" -Method POST -Body $realm -Headers $headers
Write-Host "[OK] Realm: hooksniff" -ForegroundColor Green

# 2. Create OIDC client
$client = @{
    clientId = "hooksniff-app"
    enabled = $true
    protocol = "openid-connect"
    publicClient = $false
    secret = "hooksniff-secret-key"
    redirectUris = @("https://hooksniff-api-1046140057667.europe-west1.run.app/v1/sso/oidc/callback", "https://hooksniff.vercel.app/*")
    standardFlowEnabled = $true
    directAccessGrantsEnabled = $true
} | ConvertTo-Json -Depth 3
Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/hooksniff/clients" -Method POST -Body $client -Headers $headers
Write-Host "[OK] Client: hooksniff-app (secret: hooksniff-secret-key)" -ForegroundColor Green

# 3. Create users
$users = @(
    @{ username="admin@hooksniff.dev"; email="admin@hooksniff.dev"; firstName="Admin"; lastName="User" }
    @{ username="dev@hooksniff.dev"; email="dev@hooksniff.dev"; firstName="Dev"; lastName="User" }
    @{ username="analyst@hooksniff.dev"; email="analyst@hooksniff.dev"; firstName="Analyst"; lastName="User" }
    @{ username="viewer@hooksniff.dev"; email="viewer@hooksniff.dev"; firstName="Viewer"; lastName="User" }
    @{ username="servetarslan02@gmail.com"; email="servetarslan02@gmail.com"; firstName="Servet"; lastName="Arsalan" }
)

foreach ($u in $users) {
    $u.enabled = $true
    $u.credentials = @(@{ type = "password"; value = "Test1234!" })
    $body = $u | ConvertTo-Json -Depth 3
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/hooksniff/users" -Method POST -Body $body -Headers $headers
    Write-Host "[OK] User: $($u.email)" -ForegroundColor Green
}

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Cyan
Write-Host "Keycloak URL: http://localhost:8080/realms/hooksniff" -ForegroundColor Yellow
Write-Host "Issuer URL:   http://localhost:8080/realms/hooksniff" -ForegroundColor Yellow
Write-Host "Client ID:    hooksniff-app" -ForegroundColor Yellow
Write-Host "Client Secret: hooksniff-secret-key" -ForegroundColor Yellow
Write-Host "Test Password: Test1234!" -ForegroundColor Yellow
