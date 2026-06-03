# ═══════════════════════════════════════════════════════════════
# HookSniff Cortex — Comprehensive API Test Suite (PowerShell)
# ═══════════════════════════════════════════════════════════════

$API = "https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1"
$pass = 0; $fail = 0; $skip = 0

function ApiGet($path) {
    try {
        $r = Invoke-RestMethod -Uri "$API$path" -Headers @{Authorization="Bearer $TOKEN"} -TimeoutSec 15
        return @{ status = 200; data = $r }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        return @{ status = $code; data = $null }
    }
}

function ApiPost($path, $body) {
    try {
        $r = Invoke-RestMethod -Uri "$API$path" -Method POST -Headers @{Authorization="Bearer $TOKEN"; "Content-Type"="application/json"} -Body $body -TimeoutSec 15
        return @{ status = 200; data = $r }
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { 0 }
        return @{ status = $code; data = $null }
    }
}

function Assert($name, $expected, $actual) {
    if ($actual -eq $expected) { Write-Host "  OK  $name"; $script:pass++ }
    else { Write-Host "  FAIL $name (expected $expected, got $actual)"; $script:fail++ }
}

# Login
Write-Host "=== LOGIN ==="
$login = ApiPost "/auth/login" (@{email="servetarslan02@gmail.com";password="Alayci_165"} | ConvertTo-Json -Compress)
if ($login.status -eq 200) { $TOKEN = $login.data.token; Write-Host "  OK  Login as $($login.data.customer.email)" }
else { Write-Host "  FAIL Login"; exit 1 }

# 1. Cortex Health
Write-Host "`n=== 1. CORTEX HEALTH ==="
$r = ApiGet "/cortex/health"
Assert "Health" 200 $r.status
if ($r.data) { Write-Host "  Status: $($r.data.status) | Insights: $($r.data.metrics.active_insights) | Anomalies(24h): $($r.data.metrics.anomalies_24h)" }

# 2. Anomaly Detection
Write-Host "`n=== 2. ANOMALY DETECTION ==="
$r = ApiGet "/cortex/anomalies"
Assert "Anomalies" 200 $r.status
if ($r.data) { Write-Host "  Count: $($r.data.anomalies.Count)" }

$r = ApiGet "/cortex/anomalies/high"
Assert "High anomalies" 200 $r.status

# 3. Predictions
Write-Host "`n=== 3. PREDICTIONS ==="
$r = ApiGet "/cortex/predictions"
Assert "Predictions" 200 $r.status
if ($r.data) { Write-Host "  Count: $($r.data.predictions.Count)" }

# 4. Healing Actions
Write-Host "`n=== 4. HEALING ACTIONS ==="
$r = ApiGet "/cortex/healing/actions"
Assert "Healing" 200 $r.status
if ($r.data) { Write-Host "  Count: $($r.data.actions.Count)" }

# 5. Drift Detection
Write-Host "`n=== 5. DRIFT DETECTION ==="
$r = ApiGet "/cortex/drift/events"
Assert "Drift" 200 $r.status
if ($r.data) { Write-Host "  Events: $($r.data.drift_events.Count)" }

# 6. ML Models
Write-Host "`n=== 6. ML MODELS ==="
$r = ApiGet "/cortex/models/platform-summary"
Assert "Platform summary" 200 $r.status
if ($r.data) { Write-Host "  Models: $($r.data.total_models) | Healthy: $($r.data.healthy) | Accuracy: $($r.data.avg_accuracy)%" }

$r = ApiGet "/cortex/ml/quality"
Assert "ML quality" 200 $r.status

# 7. Insights
Write-Host "`n=== 7. INSIGHTS ==="
$r = ApiGet "/cortex/insights"
Assert "Insights" 200 $r.status
if ($r.data) { Write-Host "  Count: $($r.data.insights.Count)" }

# 8. Routing Decisions
Write-Host "`n=== 8. ROUTING DECISIONS ==="
$r = ApiGet "/cortex/routing/decisions"
Assert "Routing" 200 $r.status

# 9. Proactive Status
Write-Host "`n=== 9. PROACTIVE STATUS ==="
$r = ApiGet "/cortex/proactive/status"
Assert "Proactive" 200 $r.status

# 10. Tracing & Performance
Write-Host "`n=== 10. TRACING & PERFORMANCE ==="
$r = ApiGet "/cortex/tracing/performance"
Assert "Tracing" 200 $r.status
if ($r.data) { Write-Host "  Runs(24h): $($r.data.total_runs_last_24h) | Bottleneck: $($r.data.bottleneck_stage) | SR: $([math]::Round($r.data.overall_success_rate,1))%" }

# 11. Correlations
Write-Host "`n=== 11. CORRELATIONS ==="
$r = ApiGet "/cortex/correlations"
Assert "Correlations" 200 $r.status

# 12. Hourly Stats
Write-Host "`n=== 12. HOURLY STATS ==="
$r = ApiGet "/cortex/stats"
Assert "Stats" 200 $r.status

# 13. A/B Tests
Write-Host "`n=== 13. A/B TESTS ==="
$r = ApiGet "/cortex/ab-tests"
Assert "A/B Tests" 200 $r.status

# 14. Surge Status
Write-Host "`n=== 14. SURGE STATUS ==="
$r = ApiGet "/cortex/surge/status"
Assert "Surge" 200 $r.status

# 15. Action Memory
Write-Host "`n=== 15. ACTION MEMORY ==="
$r = ApiGet "/cortex/memory"
Assert "Memory" 200 $r.status

# 16. Weekly Reports
Write-Host "`n=== 16. WEEKLY REPORTS ==="
$r = ApiGet "/cortex/reports"
Assert "Reports" 200 $r.status

# 17. Chaos Scenarios
Write-Host "`n=== 17. CHAOS SCENARIOS ==="
$r = ApiGet "/cortex/chaos/scenarios"
Assert "Chaos" 200 $r.status

# 18. Explain Anomaly
Write-Host "`n=== 18. EXPLAIN ANOMALY ==="
$eps = ApiGet "/endpoints"
if ($eps.data -and $eps.data.Count -gt 0) {
    $eid = $eps.data[0].id
    $r = ApiPost "/cortex/explain/anomaly" (@{endpoint_id=$eid;baseline_sr=95.0;baseline_latency=200.0} | ConvertTo-Json)
    Assert "Explain anomaly" 200 $r.status
} else { Write-Host "  SKIP: No endpoints"; $script:skip++ }

# 19. Explain Prediction
Write-Host "`n=== 19. EXPLAIN PREDICTION ==="
if ($eps.data -and $eps.data.Count -gt 0) {
    $r = ApiPost "/cortex/explain/prediction" (@{endpoint_id=$eid;predicted_sr=90.0;predicted_latency=500.0;confidence=0.7;forecast_steps=1;trend="stable"} | ConvertTo-Json)
    Assert "Explain prediction" 200 $r.status
} else { Write-Host "  SKIP: No endpoints"; $script:skip++ }

# Summary
Write-Host ""
Write-Host "=============================="
Write-Host "  RESULTS: $pass passed / $fail failed / $skip skipped"
Write-Host "=============================="
