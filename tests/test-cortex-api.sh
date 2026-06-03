#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# HookSniff Cortex — Comprehensive API Test Suite
# Tests all Cortex features with real data scenarios
# ═══════════════════════════════════════════════════════════════

set -e
API="https://hooksniff-api-e6ztf3x2ma-ew.a.run.app/v1"
EMAIL="servetarslan02@gmail.com"
PASSWORD="Alayci_165"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass=0
fail=0
skip=0

login() {
  TOKEN=$(curl -s -X POST "$API/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" | jq -r '.token')
  if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}FAIL: Login failed${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Login OK${NC}"
}

api() {
  local method=$1 path=$2 body=$3
  if [ "$method" = "GET" ]; then
    curl -s -w "\n%{http_code}" "$API$path" -H "Authorization: Bearer $TOKEN"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$API$path" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$body"
  fi
}

assert_status() {
  local name=$1 expected=$2 actual=$3
  if [ "$actual" = "$expected" ]; then
    echo -e "  ${GREEN}✅ $name: $actual${NC}"
    pass=$((pass + 1))
  else
    echo -e "  ${RED}❌ $name: expected $expected, got $actual${NC}"
    fail=$((fail + 1))
  fi
}

assert_has_field() {
  local name=$1 json=$2 field=$3
  if echo "$json" | jq -e ".$field" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ $name: has field '$field'${NC}"
    pass=$((pass + 1))
  else
    echo -e "  ${RED}❌ $name: missing field '$field'${NC}"
    fail=$((fail + 1))
  fi
}

assert_count_gt() {
  local name=$1 json=$2 field=$3 min=$4
  local count=$(echo "$json" | jq -r ".$field | length" 2>/dev/null || echo "0")
  if [ "$count" -gt "$min" ] 2>/dev/null; then
    echo -e "  ${GREEN}✅ $name: $count items (>$min)${NC}"
    pass=$((pass + 1))
  else
    echo -e "  ${YELLOW}⚠️  $name: $count items (expected >$min)${NC}"
    skip=$((skip + 1))
  fi
}

# ═══════════════════════════════════════════════════════════════
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         CORTEX COMPREHENSIVE API TEST SUITE                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

login
echo ""

# ═══ 1. CORTEX HEALTH ═══
echo "═══ 1. CORTEX HEALTH ═══"
resp=$(api GET "/cortex/health")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Cortex health" "200" "$code"
assert_has_field "Health status" "$body" "status"
assert_has_field "Metrics" "$body" "metrics"

# ═══ 2. ANOMALY DETECTION ═══
echo ""
echo "═══ 2. ANOMALY DETECTION ═══"
resp=$(api GET "/cortex/anomalies")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "List anomalies" "200" "$code"
assert_has_field "Anomalies array" "$body" "anomalies"
assert_count_gt "Has anomalies" "$body" "anomalies" 0

resp=$(api GET "/cortex/anomalies/high")
code=$(echo "$resp" | tail -1)
assert_status "High anomalies" "200" "$code"

# ═══ 3. PREDICTIONS ═══
echo ""
echo "═══ 3. PREDICTIONS ═══"
resp=$(api GET "/cortex/predictions")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Predictions" "200" "$code"
assert_has_field "Predictions array" "$body" "predictions"

# ═══ 4. HEALING ACTIONS ═══
echo ""
echo "═══ 4. HEALING ACTIONS ═══"
resp=$(api GET "/cortex/healing/actions")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Healing actions" "200" "$code"
assert_has_field "Actions array" "$body" "actions"
assert_count_gt "Has actions" "$body" "actions" 0

# ═══ 5. DRIFT DETECTION ═══
echo ""
echo "═══ 5. DRIFT DETECTION ═══"
resp=$(api GET "/cortex/drift/events")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Drift events" "200" "$code"
assert_has_field "Drift events" "$body" "drift_events"

# ═══ 6. ML MODELS ═══
echo ""
echo "═══ 6. ML MODELS ═══"
resp=$(api GET "/cortex/models/platform-summary")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Platform summary" "200" "$code"
assert_has_field "Total models" "$body" "total_models"
assert_has_field "Healthy" "$body" "healthy"
assert_has_field "Avg accuracy" "$body" "avg_accuracy"

resp=$(api GET "/cortex/ml/quality")
code=$(echo "$resp" | tail -1)
assert_status "ML quality" "200" "$code"

# ═══ 7. INSIGHTS ═══
echo ""
echo "═══ 7. INSIGHTS ═══"
resp=$(api GET "/cortex/insights")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Insights" "200" "$code"
assert_has_field "Insights array" "$body" "insights"
assert_count_gt "Has insights" "$body" "insights" 0

# ═══ 8. ROUTING DECISIONS ═══
echo ""
echo "═══ 8. ROUTING DECISIONS ═══"
resp=$(api GET "/cortex/routing/decisions")
code=$(echo "$resp" | tail -1)
assert_status "Routing decisions" "200" "$code"

# ═══ 9. PROACTIVE STATUS ═══
echo ""
echo "═══ 9. PROACTIVE STATUS ═══"
resp=$(api GET "/cortex/proactive/status")
code=$(echo "$resp" | tail -1)
assert_status "Proactive status" "200" "$code"

# ═══ 10. TRACING & PERFORMANCE ═══
echo ""
echo "═══ 10. TRACING & PERFORMANCE ═══"
resp=$(api GET "/cortex/tracing/performance")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Tracing performance" "200" "$code"
assert_has_field "Total runs" "$body" "total_runs_last_24h"
assert_has_field "Slowest stages" "$body" "slowest_stages"

# ═══ 11. CORRELATIONS ═══
echo ""
echo "═══ 11. CORRELATIONS ═══"
resp=$(api GET "/cortex/correlations")
code=$(echo "$resp" | tail -1)
assert_status "Correlations" "200" "$code"

# ═══ 12. HOURLY STATS ═══
echo ""
echo "═══ 12. HOURLY STATS ═══"
resp=$(api GET "/cortex/stats")
code=$(echo "$resp" | tail -1)
assert_status "Hourly stats" "200" "$code"

# ═══ 13. A/B TESTS ═══
echo ""
echo "═══ 13. A/B TESTS ═══"
resp=$(api GET "/cortex/ab-tests")
code=$(echo "$resp" | tail -1)
assert_status "A/B tests" "200" "$code"

# ═══ 14. SURGE STATUS ═══
echo ""
echo "═══ 14. SURGE STATUS ═══"
resp=$(api GET "/cortex/surge/status")
code=$(echo "$resp" | tail -1)
assert_status "Surge status" "200" "$code"

# ═══ 15. ACTION MEMORY ═══
echo ""
echo "═══ 15. ACTION MEMORY ═══"
resp=$(api GET "/cortex/memory")
code=$(echo "$resp" | tail -1)
assert_status "Action memory" "200" "$code"

# ═══ 16. WEEKLY REPORTS ═══
echo ""
echo "═══ 16. WEEKLY REPORTS ═══"
resp=$(api GET "/cortex/reports")
code=$(echo "$resp" | tail -1)
assert_status "Weekly reports" "200" "$code"

# ═══ 17. CHAOS SCENARIOS ═══
echo ""
echo "═══ 17. CHAOS SCENARIOS ═══"
resp=$(api GET "/cortex/chaos/scenarios")
code=$(echo "$resp" | tail -1)
body=$(echo "$resp" | head -n -1)
assert_status "Chaos scenarios" "200" "$code"
assert_has_field "Scenarios array" "$body" "scenarios"

# ═══ 18. EXPLAIN ANOMALY ═══
echo ""
echo "═══ 18. EXPLAIN ANOMALY ═══"
# Get first endpoint
EP_ID=$(curl -s "$API/endpoints" -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id // empty')
if [ -n "$EP_ID" ]; then
  resp=$(api POST "/cortex/explain/anomaly" "{\"endpoint_id\":\"$EP_ID\",\"baseline_sr\":95.0,\"baseline_latency\":200.0}")
  code=$(echo "$resp" | tail -1)
  assert_status "Explain anomaly" "200" "$code"
else
  echo -e "  ${YELLOW}⚠️  No endpoints found — skipping${NC}"
  skip=$((skip + 1))
fi

# ═══ 19. EXPLAIN PREDICTION ═══
echo ""
echo "═══ 19. EXPLAIN PREDICTION ═══"
if [ -n "$EP_ID" ]; then
  resp=$(api POST "/cortex/explain/prediction" "{\"endpoint_id\":\"$EP_ID\",\"predicted_sr\":90.0,\"predicted_latency\":500.0,\"confidence\":0.7,\"forecast_steps\":1,\"trend\":\"stable\"}")
  code=$(echo "$resp" | tail -1)
  assert_status "Explain prediction" "200" "$code"
else
  echo -e "  ${YELLOW}⚠️  No endpoints found — skipping${NC}"
  skip=$((skip + 1))
fi

# ═══ 20. ADMIN SECURITY ═══
echo ""
echo "═══ 20. ADMIN SECURITY ═══"
resp=$(api GET "/admin/security/audit")
code=$(echo "$resp" | tail -1)
assert_status "Security audit" "200" "$code"

resp=$(api GET "/admin/security/health")
code=$(echo "$resp" | tail -1)
assert_status "Security health" "200" "$code"

# ═══════════════════════════════════════════════════════════════
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
printf "║  RESULTS: ${GREEN}%d passed${NC} / ${RED}%d failed${NC} / ${YELLOW}%d skipped${NC} / %d total\n" $pass $fail $skip $((pass + fail + skip))
echo "╚══════════════════════════════════════════════════════════════╝"

if [ $fail -gt 0 ]; then
  exit 1
fi
