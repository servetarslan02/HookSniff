# ============================================================================
# HookSniff Integration Test Suite (PowerShell)
# ============================================================================
# Tests the API end-to-end against a local development server.
#
# Usage:
#   pwsh tests/integration_test.ps1
#   # or in PowerShell:
#   .\tests\integration_test.ps1
#
# Prerequisites:
#   - HookSniff API running on http://localhost:3000
#   - PowerShell 7+ (pwsh) or Windows PowerShell 5.1+
# ============================================================================

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
$BaseUrl = $env:HOOKSNIFF_BASE_URL ?? "http://localhost:3000"
$ApiBase = "$BaseUrl/v1"
$TestEmail = "integration-test-$(Get-Date -UFormat '%s')@hooksniff.is-a.dev"
$TestPassword = "TestPass1234!"

# Test counters
$script:TestsRun = 0
$script:TestsPassed = 0
$script:TestsFailed = 0

# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

function Log-Step($msg) {
    Write-Host ""
    Write-Host $msg -ForegroundColor Cyan
}

function Log-Ok($msg) {
    Write-Host "  ✅ $msg" -ForegroundColor Green
    $script:TestsPassed++
}

function Log-Fail($msg) {
    Write-Host "  ❌ $msg" -ForegroundColor Red
    $script:TestsFailed++
}

function Log-Info($msg) {
    Write-Host "  ℹ️  $msg" -ForegroundColor Yellow
}

function Assert-Status($desc, $expected, $actual) {
    $script:TestsRun++
    if ($actual -eq $expected) {
        Log-Ok "$desc (HTTP $actual)"
    } else {
        Log-Fail "$desc — expected HTTP $expected, got HTTP $actual"
    }
}

function Assert-Field($desc, $obj, $field) {
    $script:TestsRun++
    $val = $obj.$field
    if ($null -ne $val -and $val -ne "") {
        Log-Ok "$desc — $field = $val"
    } else {
        Log-Fail "$desc — $field is missing or null"
    }
}

# Wrapper around Invoke-RestMethod that captures status codes
function Api-Request {
    param(
        [string]$Method,
        [string]$Path,
        [hashtable]$Body = $null,
        [switch]$NoAuth
    )

    $uri = "$ApiBase$Path"
    $headers = @{ "Content-Type" = "application/json" }
    if (-not $NoAuth -and $script:Token) {
        $headers["Authorization"] = "Bearer $($script:Token)"
    }

    $params = @{
        Uri     = $uri
        Method  = $Method
        Headers = $headers
    }

    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    try {
        $response = Invoke-RestMethod @params -ErrorAction Stop
        $script:ResponseStatus = 200
        $script:ResponseBody = $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $script:ResponseStatus = $statusCode

        # Try to read the error body
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $script:ResponseBody = $reader.ReadToEnd() | ConvertFrom-Json
        } catch {
            $script:ResponseBody = @{ error = $_.Exception.Message }
        }
    }
}

# ---------------------------------------------------------------------------
# Pre-flight: Check API is reachable
# ---------------------------------------------------------------------------
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         HookSniff Integration Test Suite                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base URL: $BaseUrl"
Write-Host "Test email: $TestEmail"

Log-Step "0. Health Check"

try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method GET -ErrorAction Stop
    $script:TestsRun++
    Log-Ok "API is reachable"
} catch {
    $script:TestsRun++
    Log-Fail "API is not reachable at $BaseUrl"
    Write-Host ""
    Write-Host "Cannot proceed — start the API server first." -ForegroundColor Red
    exit 1
}

# ===========================================================================
# 1. Register a test user
# ===========================================================================
Log-Step "1. Register a test user"

$registerBody = @{
    email    = $TestEmail
    password = $TestPassword
}

Api-Request -Method POST -Path "/auth/register" -Body $registerBody -NoAuth
Assert-Status "POST /auth/register" 200 $script:ResponseStatus

$script:Token = $script:ResponseBody.token
$apiKey = $script:ResponseBody.customer.api_key
$customerId = $script:ResponseBody.customer.id

if (-not $script:Token) {
    Log-Fail "Could not extract JWT token from registration response"
    Write-Host "Response: $($script:ResponseBody | ConvertTo-Json -Depth 5)"
    exit 1
}
Log-Ok "Got JWT token"

Assert-Field "Customer has ID" $script:ResponseBody.customer "id"
Assert-Field "Customer has email" $script:ResponseBody.customer "email"
Assert-Field "Customer has API key" $script:ResponseBody.customer "api_key"

# ===========================================================================
# 2. Login with the same user
# ===========================================================================
Log-Step "2. Login with registered user"

$loginBody = @{
    email    = $TestEmail
    password = $TestPassword
}

Api-Request -Method POST -Path "/auth/login" -Body $loginBody -NoAuth
Assert-Status "POST /auth/login" 200 $script:ResponseStatus

if ($script:ResponseBody.token) {
    Log-Ok "Login returned a valid token"
    $script:Token = $script:ResponseBody.token
} else {
    Log-Fail "Login did not return a token"
}

# ===========================================================================
# 3. Create an endpoint
# ===========================================================================
Log-Step "3. Create an endpoint"

$endpointBody = @{
    url         = "https://httpbin.org/post"
    description = "Integration test endpoint"
}

Api-Request -Method POST -Path "/endpoints" -Body $endpointBody
Assert-Status "POST /endpoints" 200 $script:ResponseStatus

$endpointId = $script:ResponseBody.id
Assert-Field "Endpoint has ID" $script:ResponseBody "id"
Assert-Field "Endpoint URL matches" $script:ResponseBody "url"

if (-not $endpointId) {
    Log-Fail "Could not extract endpoint ID"
    Write-Host "Response: $($script:ResponseBody | ConvertTo-Json -Depth 5)"
    exit 1
}
Log-Info "Endpoint ID: $endpointId"

# ===========================================================================
# 4. List endpoints
# ===========================================================================
Log-Step "4. List endpoints"

Api-Request -Method GET -Path "/endpoints"
Assert-Status "GET /endpoints" 200 $script:ResponseStatus

$epCount = @($script:ResponseBody).Count
$script:TestsRun++
if ($epCount -ge 1) {
    Log-Ok "Listed $epCount endpoint(s)"
} else {
    Log-Fail "Expected at least 1 endpoint, got $epCount"
}

# ===========================================================================
# 5. Send a webhook
# ===========================================================================
Log-Step "5. Send a webhook"

$webhookBody = @{
    endpoint_id = $endpointId
    event       = "order.created"
    data        = @{
        order_id = "ORD-12345"
        amount   = 99.99
        customer = "test@example.com"
    }
}

Api-Request -Method POST -Path "/webhooks" -Body $webhookBody
Assert-Status "POST /webhooks" 200 $script:ResponseStatus

$webhookId = $script:ResponseBody.id
Assert-Field "Webhook has ID" $script:ResponseBody "id"
Assert-Field "Webhook has status" $script:ResponseBody "status"

if (-not $webhookId) {
    Log-Fail "Could not extract webhook ID"
    Write-Host "Response: $($script:ResponseBody | ConvertTo-Json -Depth 5)"
} else {
    Log-Info "Webhook ID: $webhookId"
}

# ===========================================================================
# 6. Check delivery status
# ===========================================================================
Log-Step "6. Check delivery status (waiting 3s for delivery attempt)"

Start-Sleep -Seconds 3

Api-Request -Method GET -Path "/webhooks/$webhookId"
Assert-Status "GET /webhooks/{id}" 200 $script:ResponseStatus

$deliveryStatus = $script:ResponseBody.status
Log-Info "Delivery status: $deliveryStatus"

Assert-Field "Delivery has endpoint_id" $script:ResponseBody "endpoint_id"
Assert-Field "Delivery has attempt_count" $script:ResponseBody "attempt_count"

# ===========================================================================
# 7. List deliveries
# ===========================================================================
Log-Step "7. List deliveries"

Api-Request -Method GET -Path "/webhooks?page=1&per_page=10"
Assert-Status "GET /webhooks (list)" 200 $script:ResponseStatus

$total = $script:ResponseBody.total
Log-Info "Total deliveries: $total"

$script:TestsRun++
if ($total -ge 1) {
    Log-Ok "At least 1 delivery found"
} else {
    Log-Fail "Expected at least 1 delivery"
}

# ===========================================================================
# 8. Get delivery attempts
# ===========================================================================
Log-Step "8. Get delivery attempts"

Api-Request -Method GET -Path "/webhooks/$webhookId/attempts"
Assert-Status "GET /webhooks/{id}/attempts" 200 $script:ResponseStatus

# ===========================================================================
# 9. Get stats
# ===========================================================================
Log-Step "9. Get stats"

Api-Request -Method GET -Path "/stats"
Assert-Status "GET /stats" 200 $script:ResponseStatus

Assert-Field "Stats has total_deliveries" $script:ResponseBody "total_deliveries"
Assert-Field "Stats has success_rate" $script:ResponseBody "success_rate"
Assert-Field "Stats has endpoints_count" $script:ResponseBody "endpoints_count"

Log-Info "Total deliveries: $($script:ResponseBody.total_deliveries)"
Log-Info "Success rate: $($script:ResponseBody.success_rate)%"

# ===========================================================================
# 10. Test batch webhooks
# ===========================================================================
Log-Step "10. Test batch webhooks"

$batchBody = @{
    webhooks = @(
        @{ endpoint_id = $endpointId; event = "batch.test.1"; data = @{ batch_id = 1 } },
        @{ endpoint_id = $endpointId; event = "batch.test.2"; data = @{ batch_id = 2 } },
        @{ endpoint_id = $endpointId; event = "batch.test.3"; data = @{ batch_id = 3 } }
    )
}

Api-Request -Method POST -Path "/webhooks/batch" -Body $batchBody
Assert-Status "POST /webhooks/batch" 200 $script:ResponseStatus

$batchDeliveries = @($script:ResponseBody.deliveries).Count
$batchErrors = @($script:ResponseBody.errors).Count
Log-Info "Batch: $batchDeliveries delivered, $batchErrors errors"

$script:TestsRun++
if ($batchDeliveries -ge 1) {
    Log-Ok "Batch returned at least 1 delivery"
} else {
    Log-Fail "Batch returned no deliveries"
}

# ===========================================================================
# 11. Test replay
# ===========================================================================
Log-Step "11. Test replay"

Api-Request -Method POST -Path "/webhooks/$webhookId/replay"
Assert-Status "POST /webhooks/{id}/replay" 200 $script:ResponseStatus

$replayId = $script:ResponseBody.id
if ($replayId) {
    Log-Ok "Replay created new delivery: $replayId"
} else {
    Log-Fail "Replay did not return a delivery"
}

# ===========================================================================
# 12. Test export
# ===========================================================================
Log-Step "12. Test export"

Api-Request -Method GET -Path "/webhooks/export?format=json"
Assert-Status "GET /webhooks/export?format=json" 200 $script:ResponseStatus

# ===========================================================================
# 13. Error cases
# ===========================================================================
Log-Step "13. Error cases"

# 13a. Invalid URL endpoint
Log-Info "Testing invalid URL..."
$invalidUrlBody = @{ url = "not-a-valid-url"; description = "bad" }
Api-Request -Method POST -Path "/endpoints" -Body $invalidUrlBody
$script:TestsRun++
if ($script:ResponseStatus -eq 400) {
    Log-Ok "Invalid URL correctly rejected (HTTP 400)"
} else {
    Log-Fail "Invalid URL — expected HTTP 400, got HTTP $($script:ResponseStatus)"
}

# 13b. Missing required fields
Log-Info "Testing missing fields..."
$missingFieldsBody = @{ description = "no url field" }
Api-Request -Method POST -Path "/endpoints" -Body $missingFieldsBody
$script:TestsRun++
if ($script:ResponseStatus -eq 400) {
    Log-Ok "Missing URL correctly rejected (HTTP 400)"
} else {
    Log-Fail "Missing URL — expected HTTP 400, got HTTP $($script:ResponseStatus)"
}

# 13c. Unauthorized request (no token)
Log-Info "Testing unauthorized access..."
$savedToken = $script:Token
$script:Token = $null
Api-Request -Method GET -Path "/endpoints" -NoAuth
$script:TestsRun++
if ($script:ResponseStatus -eq 401) {
    Log-Ok "Unauthorized request correctly rejected (HTTP 401)"
} else {
    Log-Fail "Unauthorized — expected HTTP 401, got HTTP $($script:ResponseStatus)"
}
$script:Token = $savedToken

# 13d. Not found
Log-Info "Testing not found..."
Api-Request -Method GET -Path "/endpoints/00000000-0000-0000-0000-000000000000"
$script:TestsRun++
if ($script:ResponseStatus -eq 404) {
    Log-Ok "Non-existent endpoint correctly returns 404"
} else {
    Log-Fail "Not found — expected HTTP 404, got HTTP $($script:ResponseStatus)"
}

# 13e. Invalid webhook (non-existent endpoint)
Log-Info "Testing webhook to non-existent endpoint..."
$invalidWebhookBody = @{
    endpoint_id = "00000000-0000-0000-0000-000000000000"
    data        = @{ test = $true }
}
Api-Request -Method POST -Path "/webhooks" -Body $invalidWebhookBody
$script:TestsRun++
if ($script:ResponseStatus -ge 400) {
    Log-Ok "Webhook to non-existent endpoint correctly rejected (HTTP $($script:ResponseStatus))"
} else {
    Log-Fail "Expected error for non-existent endpoint, got HTTP $($script:ResponseStatus)"
}

# ===========================================================================
# 14. Cleanup: Delete the endpoint
# ===========================================================================
Log-Step "14. Cleanup"

Api-Request -Method DELETE -Path "/endpoints/$endpointId"
$script:TestsRun++
if ($script:ResponseStatus -eq 200) {
    Log-Ok "Endpoint deleted successfully"
} else {
    Log-Fail "Could not delete endpoint (HTTP $($script:ResponseStatus))"
}

# Verify deletion
Api-Request -Method GET -Path "/endpoints/$endpointId"
$script:TestsRun++
if ($script:ResponseStatus -eq 404) {
    Log-Ok "Deleted endpoint returns 404"
} else {
    Log-Fail "Deleted endpoint should return 404, got HTTP $($script:ResponseStatus)"
}

# ===========================================================================
# Summary
# ===========================================================================
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    Test Summary                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Total tests:  $($script:TestsRun)"
Write-Host "  Passed:       $($script:TestsPassed)" -ForegroundColor Green
Write-Host "  Failed:       $($script:TestsFailed)" -ForegroundColor Red
Write-Host ""

if ($script:TestsFailed -eq 0) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "💥 Some tests failed." -ForegroundColor Red
    exit 1
}
