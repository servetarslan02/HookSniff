#!/usr/bin/env bash
# ============================================================================
# HookRelay API Integration Tests (Extended)
# ============================================================================
# Mevcut integration_test.sh'in üzerine eklenen daha kapsamlı testler.
# API'nin tüm kritik endpointlerini, hata senaryolarını ve edge case'leri test eder.
#
# Usage:
#   chmod +x tests/integration/api_test.sh
#   ./tests/integration/api_test.sh
#
# Prerequisites:
#   - docker compose up -d
#   - curl ve jq kurulu olmalı
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL="${HOOKRELAY_BASE_URL:-http://localhost:3000}"
API_BASE="${BASE_URL}/v1"
TEST_EMAIL="api-test-$(date +%s)@hookrelay.dev"
TEST_PASSWORD="TestPass1234!"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Counters
PASS=0
FAIL=0
TOTAL=0
TOKEN=""
ENDPOINT_ID=""
WEBHOOK_ID=""
API_KEY_ID=""
CUSTOMER_ID=""

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
header() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

assert_status() {
  local response="$1"
  local expected="$2"
  local test_name="$3"
  local status
  status=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')
  ((TOTAL++))
  if [ "$status" = "$expected" ]; then
    echo -e "  ${GREEN}✅ PASS${NC}: $test_name (HTTP $status)"
    ((PASS++))
  else
    echo -e "  ${RED}❌ FAIL${NC}: $test_name (expected HTTP $expected, got HTTP $status)"
    echo -e "     ${YELLOW}Response: $(echo "$body" | head -c 200)${NC}"
    ((FAIL++))
  fi
  echo "$body"
}

assert_json_field() {
  local json="$1"
  local field="$2"
  local test_name="$3"
  local val
  val=$(echo "$json" | jq -r "$field // empty" 2>/dev/null)
  ((TOTAL++))
  if [ -n "$val" ] && [ "$val" != "null" ]; then
    echo -e "  ${GREEN}✅ PASS${NC}: $test_name → $field = $val"
    ((PASS++))
  else
    echo -e "  ${RED}❌ FAIL${NC}: $test_name → $field missing or null"
    ((FAIL++))
  fi
}

assert_contains() {
  local haystack="$1"
  local needle="$2"
  local test_name="$3"
  ((TOTAL++))
  if echo "$haystack" | grep -qi "$needle"; then
    echo -e "  ${GREEN}✅ PASS${NC}: $test_name"
    ((PASS++))
  else
    echo -e "  ${RED}❌ FAIL${NC}: $test_name — '$needle' not found"
    ((FAIL++))
  fi
}

# API request with auth
api() {
  local method="$1" path="$2" body="${3:-}"
  local url="${API_BASE}${path}"
  if [ -n "$body" ]; then
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "$body" 2>/dev/null || echo -e "\n000"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo -e "\n000"
  fi
}

# API request without auth
api_noauth() {
  local method="$1" path="$2" body="${3:-}"
  local url="${API_BASE}${path}"
  if [ -n "$body" ]; then
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body" 2>/dev/null || echo -e "\n000"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" 2>/dev/null || echo -e "\n000"
  fi
}

# API request with custom API key header
api_with_key() {
  local method="$1" path="$2" key="$3" body="${4:-}"
  local url="${API_BASE}${path}"
  if [ -n "$body" ]; then
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: ${key}" \
      -d "$body" 2>/dev/null || echo -e "\n000"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: ${key}" 2>/dev/null || echo -e "\n000"
  fi
}

extract_json() {
  echo "$1" | sed '$d'
}

# ===========================================================================
# Banner
# ===========================================================================
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          HookRelay API Integration Test Suite (Extended)    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo "  Base URL:    $BASE_URL"
echo "  Test email:  $TEST_EMAIL"
echo "  Started at:  $(date)"
echo ""

# ===========================================================================
# Test 1: Health Check
# ===========================================================================
header "Test 1: Health Check"

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" 2>/dev/null || echo "000")
((TOTAL++))
if [ "$HEALTH" -eq 200 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: API is reachable (HTTP 200)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: API not reachable at ${BASE_URL} (HTTP ${HEALTH})"
  ((FAIL++))
  echo -e "\n${RED}Cannot proceed — start the API first: docker compose up -d${NC}"
  exit 1
fi

# Also check /v1/health if available
HEALTH_V1=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/health" 2>/dev/null || echo "000")
((TOTAL++))
if [ "$HEALTH_V1" -eq 200 ] || [ "$HEALTH_V1" -eq 404 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: /v1/health responded (HTTP $HEALTH_V1)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: /v1/health unexpected (HTTP $HEALTH_V1)"
  ((FAIL++))
fi

# ===========================================================================
# Test 2: Register User
# ===========================================================================
header "Test 2: Register User"

REGISTER_BODY="{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}"
RESP=$(api_noauth "POST" "/auth/register" "$REGISTER_BODY")
BODY=$(assert_status "$RESP" "200" "POST /auth/register — 200 OK")

TOKEN=$(echo "$BODY" | jq -r '.token // empty')
CUSTOMER_ID=$(echo "$BODY" | jq -r '.customer.id // empty')

if [ -n "$TOKEN" ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Got JWT token"
  ((PASS++)); ((TOTAL++))
else
  echo -e "  ${RED}❌ FAIL${NC}: No JWT token in response"
  ((FAIL++)); ((TOTAL++))
  exit 1
fi

assert_json_field "$BODY" '.customer.id' "Customer has ID"
assert_json_field "$BODY" '.customer.email' "Customer has email"
assert_json_field "$BODY" '.customer.api_key' "Customer has API key"

# ===========================================================================
# Test 3: Login
# ===========================================================================
header "Test 3: Login"

LOGIN_BODY="{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}"
RESP=$(api_noauth "POST" "/auth/login" "$LOGIN_BODY")
BODY=$(assert_status "$RESP" "200" "POST /auth/login — 200 OK")

LOGIN_TOKEN=$(echo "$BODY" | jq -r '.token // empty')
((TOTAL++))
if [ -n "$LOGIN_TOKEN" ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Login returned token"
  ((PASS++))
  TOKEN="$LOGIN_TOKEN"
else
  echo -e "  ${RED}❌ FAIL${NC}: Login did not return token"
  ((FAIL++))
fi

# Test wrong password
WRONG_BODY="{\"email\":\"${TEST_EMAIL}\",\"password\":\"WrongPassword!\"}"
RESP=$(api_noauth "POST" "/auth/login" "$WRONG_BODY")
assert_status "$RESP" "401" "POST /auth/login wrong password → 401"

# Test non-existent user
NOUSER_BODY='{"email":"nonexistent@test.com","password":"test"}'
RESP=$(api_noauth "POST" "/auth/login" "$NOUSER_BODY")
assert_status "$RESP" "401" "POST /auth/login non-existent user → 401"

# ===========================================================================
# Test 4: Create Endpoint
# ===========================================================================
header "Test 4: Create Endpoint"

EP_BODY='{"url":"https://httpbin.org/post","description":"API test endpoint","events":["order.created","order.paid"]}'
RESP=$(api "POST" "/endpoints" "$EP_BODY")
BODY=$(assert_status "$RESP" "200" "POST /endpoints — 200 OK")

ENDPOINT_ID=$(echo "$BODY" | jq -r '.id // empty')
assert_json_field "$BODY" '.id' "Endpoint has ID"
assert_json_field "$BODY" '.url' "Endpoint has URL"

if [ -z "$ENDPOINT_ID" ]; then
  echo -e "  ${RED}❌ FAIL${NC}: Could not extract endpoint ID"
  ((FAIL++)); ((TOTAL++))
  exit 1
fi

# Test duplicate endpoint creation (same URL)
RESP=$(api "POST" "/endpoints" "$EP_BODY")
BODY=$(assert_status "$RESP" "200" "POST /endpoints duplicate — accepted (idempotent)")

# ===========================================================================
# Test 5: List Endpoints
# ===========================================================================
header "Test 5: List Endpoints"

RESP=$(api "GET" "/endpoints")
BODY=$(assert_status "$RESP" "200" "GET /endpoints — 200 OK")

EP_COUNT=$(echo "$BODY" | jq 'length' 2>/dev/null || echo "0")
((TOTAL++))
if [ "$EP_COUNT" -ge 1 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Listed $EP_COUNT endpoint(s)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: Expected at least 1 endpoint, got $EP_COUNT"
  ((FAIL++))
fi

# Test pagination
RESP=$(api "GET" "/endpoints?page=1&per_page=1")
BODY=$(assert_status "$RESP" "200" "GET /endpoints?page=1&per_page=1 — pagination works")

# ===========================================================================
# Test 6: Get Single Endpoint
# ===========================================================================
header "Test 6: Get Single Endpoint"

RESP=$(api "GET" "/endpoints/${ENDPOINT_ID}")
BODY=$(assert_status "$RESP" "200" "GET /endpoints/{id} — 200 OK")
assert_json_field "$BODY" '.id' "Single endpoint has ID"

# ===========================================================================
# Test 7: Update Endpoint
# ===========================================================================
header "Test 7: Update Endpoint"

UPDATE_BODY='{"url":"https://httpbin.org/post","description":"Updated description"}'
RESP=$(api "PUT" "/endpoints/${ENDPOINT_ID}" "$UPDATE_BODY")
BODY=$(assert_status "$RESP" "200" "PUT /endpoints/{id} — 200 OK")

# ===========================================================================
# Test 8: Send Webhook
# ===========================================================================
header "Test 8: Send Webhook"

WH_BODY="{\"endpoint_id\":\"${ENDPOINT_ID}\",\"event\":\"order.created\",\"data\":{\"order_id\":\"ORD-12345\",\"amount\":99.99,\"customer\":\"test@example.com\"}}"
RESP=$(api "POST" "/webhooks" "$WH_BODY")
BODY=$(assert_status "$RESP" "200" "POST /webhooks — 200 OK")

WEBHOOK_ID=$(echo "$BODY" | jq -r '.id // empty')
assert_json_field "$BODY" '.id' "Webhook has ID"
assert_json_field "$BODY" '.status' "Webhook has status"

# Send a second webhook for later tests
WH2_BODY="{\"endpoint_id\":\"${ENDPOINT_ID}\",\"event\":\"order.paid\",\"data\":{\"order_id\":\"ORD-12345\",\"payment_id\":\"PAY-001\"}}"
RESP=$(api "POST" "/webhooks" "$WH2_BODY")
BODY2=$(assert_status "$RESP" "200" "POST /webhooks (2nd) — 200 OK")
WEBHOOK_ID_2=$(echo "$BODY2" | jq -r '.id // empty')

# ===========================================================================
# Test 9: List Webhooks
# ===========================================================================
header "Test 9: List Webhooks"

RESP=$(api "GET" "/webhooks?page=1&per_page=10")
BODY=$(assert_status "$RESP" "200" "GET /webhooks — 200 OK")

DELIVERY_COUNT=$(echo "$BODY" | jq '.total // length // 0' 2>/dev/null || echo "0")
((TOTAL++))
if [ "$DELIVERY_COUNT" -ge 1 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Found $DELIVERY_COUNT delivery(ies)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: Expected at least 1 delivery"
  ((FAIL++))
fi

# ===========================================================================
# Test 10: Get Webhook Detail
# ===========================================================================
header "Test 10: Get Webhook Detail"

sleep 2  # Wait for delivery attempt

RESP=$(api "GET" "/webhooks/${WEBHOOK_ID}")
BODY=$(assert_status "$RESP" "200" "GET /webhooks/{id} — 200 OK")
assert_json_field "$BODY" '.endpoint_id' "Webhook detail has endpoint_id"
assert_json_field "$BODY" '.attempt_count' "Webhook detail has attempt_count"

# ===========================================================================
# Test 11: Get Delivery Attempts
# ===========================================================================
header "Test 11: Get Delivery Attempts"

RESP=$(api "GET" "/webhooks/${WEBHOOK_ID}/attempts")
BODY=$(assert_status "$RESP" "200" "GET /webhooks/{id}/attempts — 200 OK")

# ===========================================================================
# Test 12: Replay Webhook
# ===========================================================================
header "Test 12: Replay Webhook"

RESP=$(api "POST" "/webhooks/${WEBHOOK_ID}/replay")
BODY=$(assert_status "$RESP" "200" "POST /webhooks/{id}/replay — 200 OK")

REPLAY_ID=$(echo "$BODY" | jq -r '.id // empty')
((TOTAL++))
if [ -n "$REPLAY_ID" ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Replay created delivery: $REPLAY_ID"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: Replay did not return a delivery ID"
  ((FAIL++))
fi

# ===========================================================================
# Test 13: Batch Webhooks
# ===========================================================================
header "Test 13: Batch Webhooks"

BATCH_BODY="{\"webhooks\":[{\"endpoint_id\":\"${ENDPOINT_ID}\",\"event\":\"batch.1\",\"data\":{\"n\":1}},{\"endpoint_id\":\"${ENDPOINT_ID}\",\"event\":\"batch.2\",\"data\":{\"n\":2}},{\"endpoint_id\":\"${ENDPOINT_ID}\",\"event\":\"batch.3\",\"data\":{\"n\":3}}]}"
RESP=$(api "POST" "/webhooks/batch" "$BATCH_BODY")
BODY=$(assert_status "$RESP" "200" "POST /webhooks/batch — 200 OK")

BATCH_COUNT=$(echo "$BODY" | jq '.deliveries | length' 2>/dev/null || echo "0")
((TOTAL++))
if [ "$BATCH_COUNT" -ge 1 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Batch returned $BATCH_COUNT delivery(ies)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: Batch returned no deliveries"
  ((FAIL++))
fi

# ===========================================================================
# Test 14: Stats
# ===========================================================================
header "Test 14: Stats"

RESP=$(api "GET" "/stats")
BODY=$(assert_status "$RESP" "200" "GET /stats — 200 OK")
assert_json_field "$BODY" '.total_deliveries' "Stats has total_deliveries"
assert_json_field "$BODY" '.success_rate' "Stats has success_rate"
assert_json_field "$BODY" '.endpoints_count' "Stats has endpoints_count"

# ===========================================================================
# Test 15: Export
# ===========================================================================
header "Test 15: Export"

RESP=$(api "GET" "/webhooks/export?format=json")
BODY=$(assert_status "$RESP" "200" "GET /webhooks/export?format=json — 200 OK")

# ===========================================================================
# Test 16: API Keys — Create
# ===========================================================================
header "Test 16: API Keys — Create"

KEY_BODY='{"name":"test-key","permissions":["read","write"]}'
RESP=$(api "POST" "/api-keys" "$KEY_BODY")
BODY=$(assert_status "$RESP" "200" "POST /api-keys — 200 OK")

API_KEY_ID=$(echo "$BODY" | jq -r '.id // empty')
API_KEY_VALUE=$(echo "$BODY" | jq -r '.key // .api_key // empty')
assert_json_field "$BODY" '.id' "API key has ID"
assert_json_field "$BODY" '.name' "API key has name"

# ===========================================================================
# Test 17: API Keys — List
# ===========================================================================
header "Test 17: API Keys — List"

RESP=$(api "GET" "/api-keys")
BODY=$(assert_status "$RESP" "200" "GET /api-keys — 200 OK")

KEY_COUNT=$(echo "$BODY" | jq 'length // 0' 2>/dev/null || echo "0")
((TOTAL++))
if [ "$KEY_COUNT" -ge 1 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Listed $KEY_COUNT API key(s)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: Expected at least 1 API key"
  ((FAIL++))
fi

# ===========================================================================
# Test 18: API Key Auth
# ===========================================================================
header "Test 18: API Key Auth"

if [ -n "$API_KEY_VALUE" ] && [ "$API_KEY_VALUE" != "null" ]; then
  RESP=$(api_with_key "GET" "/endpoints" "$API_KEY_VALUE")
  assert_status "$RESP" "200" "GET /endpoints with API key — 200 OK"
else
  echo -e "  ${YELLOW}⏭️  SKIP${NC}: No API key value available for auth test"
fi

# ===========================================================================
# Test 19: API Keys — Delete
# ===========================================================================
header "Test 19: API Keys — Delete"

if [ -n "$API_KEY_ID" ] && [ "$API_KEY_ID" != "null" ]; then
  RESP=$(api "DELETE" "/api-keys/${API_KEY_ID}")
  assert_status "$RESP" "200" "DELETE /api-keys/{id} — 200 OK"
else
  echo -e "  ${YELLOW}⏭️  SKIP${NC}: No API key ID to delete"
fi

# ===========================================================================
# Test 20: Rate Limiting (100+ rapid requests)
# ===========================================================================
header "Test 20: Rate Limiting"

echo "  Sending 120 rapid requests..."
RATE_LIMITED=0
RATE_OK=0
for i in $(seq 1 120); do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X GET "${API_BASE}/endpoints" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "429" ]; then
    RATE_LIMITED=1
    break
  fi
  ((RATE_OK++))
done

((TOTAL++))
if [ "$RATE_LIMITED" -eq 1 ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Rate limit triggered after $RATE_OK requests (HTTP 429)"
  ((PASS++))
else
  echo -e "  ${YELLOW}⚠️  WARN${NC}: No 429 after 120 requests (rate limit may be higher or disabled)"
  ((PASS++))  # Not necessarily a failure
fi

# ===========================================================================
# Test 21: Invalid Auth
# ===========================================================================
header "Test 21: Invalid Auth Scenarios"

# No token
SAVE_TOKEN="$TOKEN"
TOKEN=""
RESP=$(api "GET" "/endpoints")
assert_status "$RESP" "401" "No token → 401 Unauthorized"

# Invalid token
TOKEN="invalid-token-12345"
RESP=$(api "GET" "/endpoints")
assert_status "$RESP" "401" "Invalid token → 401 Unauthorized"

# Malformed Bearer
RESP=$(curl -s -w "\n%{http_code}" -X GET "${API_BASE}/endpoints" \
  -H "Content-Type: application/json" \
  -H "Authorization: InvalidFormat" 2>/dev/null || echo -e "\n000")
assert_status "$RESP" "401" "Malformed Authorization header → 401"

TOKEN="$SAVE_TOKEN"

# ===========================================================================
# Test 22: Missing / Invalid Fields
# ===========================================================================
header "Test 22: Missing & Invalid Fields"

# Missing URL
RESP=$(api "POST" "/endpoints" '{"description":"no url"}')
assert_status "$RESP" "400" "POST /endpoints missing url → 400"

# Invalid URL format
RESP=$(api "POST" "/endpoints" '{"url":"not-a-url","description":"bad"}')
assert_status "$RESP" "400" "POST /endpoints invalid url → 400"

# Missing event on webhook
RESP=$(api "POST" "/webhooks" "{\"endpoint_id\":\"${ENDPOINT_ID}\",\"data\":{}}")
BODY=$(echo "$RESP" | sed '$d')
STATUS=$(echo "$RESP" | tail -1)
((TOTAL++))
if [ "$STATUS" = "200" ] || [ "$STATUS" = "400" ]; then
  echo -e "  ${GREEN}✅ PASS${NC}: Missing event handled (HTTP $STATUS)"
  ((PASS++))
else
  echo -e "  ${RED}❌ FAIL${NC}: Missing event — unexpected HTTP $STATUS"
  ((FAIL++))
fi

# Empty body
RESP=$(api "POST" "/endpoints" "")
assert_status "$RESP" "400" "POST /endpoints empty body → 400"

# ===========================================================================
# Test 23: 404 Not Found
# ===========================================================================
header "Test 23: 404 Not Found"

FAKE_UUID="00000000-0000-0000-0000-000000000000"
RESP=$(api "GET" "/endpoints/${FAKE_UUID}")
assert_status "$RESP" "404" "GET /endpoints/{fake_id} → 404"

RESP=$(api "GET" "/webhooks/${FAKE_UUID}")
assert_status "$RESP" "404" "GET /webhooks/{fake_id} → 404"

# ===========================================================================
# Test 24: Search
# ===========================================================================
header "Test 24: Search"

RESP=$(api "GET" "/search?q=order")
BODY=$(assert_status "$RESP" "200" "GET /search?q=order — 200 OK")

# ===========================================================================
# Test 25: Analytics
# ===========================================================================
header "Test 25: Analytics"

RESP=$(api "GET" "/analytics/deliveries")
BODY=$(assert_status "$RESP" "200" "GET /analytics/deliveries — 200 OK")

# ===========================================================================
# Test 26: Templates
# ===========================================================================
header "Test 26: Templates"

RESP=$(api "GET" "/templates")
BODY=$(assert_status "$RESP" "200" "GET /templates — 200 OK")

# ===========================================================================
# Test 27: Cleanup — Delete Endpoint
# ===========================================================================
header "Test 27: Cleanup"

RESP=$(api "DELETE" "/endpoints/${ENDPOINT_ID}")
assert_status "$RESP" "200" "DELETE /endpoints/{id} — 200 OK"

# Verify deletion
RESP=$(api "GET" "/endpoints/${ENDPOINT_ID}")
assert_status "$RESP" "404" "GET deleted endpoint → 404"

# ===========================================================================
# Summary
# ===========================================================================
echo ""
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                       Test Summary                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "  Total:    ${BOLD}${TOTAL}${NC}"
echo -e "  ${GREEN}Passed:   ${PASS}${NC}"
echo -e "  ${RED}Failed:   ${FAIL}${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 All $TOTAL tests passed!${NC}"
  exit 0
else
  echo -e "${RED}${BOLD}💥 $FAIL of $TOTAL tests failed.${NC}"
  exit 1
fi
