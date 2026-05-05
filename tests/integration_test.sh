#!/usr/bin/env bash
# ============================================================================
# HookRelay Integration Test Suite
# ============================================================================
# Tests the API end-to-end against a local development server.
#
# Usage:
#   chmod +x tests/integration_test.sh
#   ./tests/integration_test.sh
#
# Prerequisites:
#   - HookRelay API running on http://localhost:3000
#   - curl installed
#   - jq installed (for JSON parsing)
# ============================================================================

set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BASE_URL="${HOOKRELAY_BASE_URL:-http://localhost:3000}"
API_BASE="${BASE_URL}/v1"
TEST_EMAIL="integration-test-$(date +%s)@hookrelay.dev"
TEST_PASSWORD="TestPass1234!"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

log_step() {
  echo -e "\n${CYAN}$1${NC}"
}

log_ok() {
  echo -e "  ${GREEN}✅ $1${NC}"
  ((TESTS_PASSED++))
}

log_fail() {
  echo -e "  ${RED}❌ $1${NC}"
  ((TESTS_FAILED++))
}

log_info() {
  echo -e "  ${YELLOW}ℹ️  $1${NC}"
}

# Run a test assertion
# Usage: assert_status <description> <expected_status> <actual_status>
assert_status() {
  local desc="$1" expected="$2" actual="$3"
  ((TESTS_RUN++))
  if [ "$actual" -eq "$expected" ]; then
    log_ok "$desc (HTTP $actual)"
  else
    log_fail "$desc — expected HTTP $expected, got HTTP $actual"
  fi
}

# Run a test that checks a JSON field is not null
# Usage: assert_field <description> <json> <field>
assert_field() {
  local desc="$1" json="$2" field="$3"
  ((TESTS_RUN++))
  local val
  val=$(echo "$json" | jq -r "$field // empty" 2>/dev/null)
  if [ -n "$val" ] && [ "$val" != "null" ]; then
    log_ok "$desc — $field = $val"
  else
    log_fail "$desc — $field is missing or null"
  fi
}

# Make an API request and return status code + body
# Usage: api_request <method> <path> [body]
api_request() {
  local method="$1" path="$2" body="${3:-}"
  local url="${API_BASE}${path}"

  if [ -n "$body" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "$body" 2>/dev/null || true)
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" 2>/dev/null || true)
  fi

  HTTP_STATUS=$(echo "$RESPONSE" | tail -1)
  RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
}

# Same but without auth
api_request_noauth() {
  local method="$1" path="$2" body="${3:-}"
  local url="${API_BASE}${path}"

  if [ -n "$body" ]; then
    RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body" 2>/dev/null || true)
  else
    RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X "$method" "$url" \
      -H "Content-Type: application/json" 2>/dev/null || true)
  fi

  HTTP_STATUS=$(echo "$RESPONSE" | tail -1)
  RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
}

# ---------------------------------------------------------------------------
# Pre-flight: Check API is reachable
# ---------------------------------------------------------------------------
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         HookRelay Integration Test Suite                ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Base URL: $BASE_URL"
echo "Test email: $TEST_EMAIL"

log_step "0. Health Check"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/health" 2>/dev/null || echo "000")
((TESTS_RUN++))
if [ "$HEALTH" -eq 200 ]; then
  log_ok "API is reachable"
else
  log_fail "API is not reachable at ${BASE_URL} (HTTP ${HEALTH})"
  echo -e "\n${RED}Cannot proceed — start the API server first.${NC}"
  exit 1
fi

# ===========================================================================
# 1. Register a test user
# ===========================================================================
log_step "1. Register a test user"

REGISTER_BODY=$(cat <<EOF
{
  "email": "${TEST_EMAIL}",
  "password": "${TEST_PASSWORD}"
}
EOF
)

api_request_noauth "POST" "/auth/register" "$REGISTER_BODY"
assert_status "POST /auth/register" 200 "$HTTP_STATUS"

TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.token // empty')
API_KEY=$(echo "$RESPONSE_BODY" | jq -r '.customer.api_key // empty')
CUSTOMER_ID=$(echo "$RESPONSE_BODY" | jq -r '.customer.id // empty')

if [ -z "$TOKEN" ]; then
  log_fail "Could not extract JWT token from registration response"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi
log_ok "Got JWT token"

assert_field "Customer has ID" "$RESPONSE_BODY" '.customer.id'
assert_field "Customer has email" "$RESPONSE_BODY" '.customer.email'
assert_field "Customer has API key" "$RESPONSE_BODY" '.customer.api_key'

# ===========================================================================
# 2. Login with the same user
# ===========================================================================
log_step "2. Login with registered user"

LOGIN_BODY=$(cat <<EOF
{
  "email": "${TEST_EMAIL}",
  "password": "${TEST_PASSWORD}"
}
EOF
)

api_request_noauth "POST" "/auth/login" "$LOGIN_BODY"
assert_status "POST /auth/login" 200 "$HTTP_STATUS"

LOGIN_TOKEN=$(echo "$RESPONSE_BODY" | jq -r '.token // empty')
if [ -n "$LOGIN_TOKEN" ]; then
  log_ok "Login returned a valid token"
  # Use the login token going forward
  TOKEN="$LOGIN_TOKEN"
else
  log_fail "Login did not return a token"
fi

# ===========================================================================
# 3. Create an endpoint
# ===========================================================================
log_step "3. Create an endpoint"

ENDPOINT_BODY=$(cat <<EOF
{
  "url": "https://httpbin.org/post",
  "description": "Integration test endpoint"
}
EOF
)

api_request "POST" "/endpoints" "$ENDPOINT_BODY"
assert_status "POST /endpoints" 200 "$HTTP_STATUS"

ENDPOINT_ID=$(echo "$RESPONSE_BODY" | jq -r '.id // empty')
assert_field "Endpoint has ID" "$RESPONSE_BODY" '.id'
assert_field "Endpoint URL matches" "$RESPONSE_BODY" '.url'

if [ -z "$ENDPOINT_ID" ]; then
  log_fail "Could not extract endpoint ID"
  echo "Response: $RESPONSE_BODY"
  exit 1
fi
log_info "Endpoint ID: $ENDPOINT_ID"

# ===========================================================================
# 4. List endpoints
# ===========================================================================
log_step "4. List endpoints"

api_request "GET" "/endpoints"
assert_status "GET /endpoints" 200 "$HTTP_STATUS"

EP_COUNT=$(echo "$RESPONSE_BODY" | jq 'length' 2>/dev/null || echo "0")
((TESTS_RUN++))
if [ "$EP_COUNT" -ge 1 ]; then
  log_ok "Listed $EP_COUNT endpoint(s)"
else
  log_fail "Expected at least 1 endpoint, got $EP_COUNT"
fi

# ===========================================================================
# 5. Send a webhook
# ===========================================================================
log_step "5. Send a webhook"

WEBHOOK_BODY=$(cat <<EOF
{
  "endpoint_id": "${ENDPOINT_ID}",
  "event": "order.created",
  "data": {
    "order_id": "ORD-12345",
    "amount": 99.99,
    "customer": "test@example.com"
  }
}
EOF
)

api_request "POST" "/webhooks" "$WEBHOOK_BODY"
assert_status "POST /webhooks" 200 "$HTTP_STATUS"

WEBHOOK_ID=$(echo "$RESPONSE_BODY" | jq -r '.id // empty')
assert_field "Webhook has ID" "$RESPONSE_BODY" '.id'
assert_field "Webhook has status" "$RESPONSE_BODY" '.status'

if [ -z "$WEBHOOK_ID" ]; then
  log_fail "Could not extract webhook ID"
  echo "Response: $RESPONSE_BODY"
else
  log_info "Webhook ID: $WEBHOOK_ID"
fi

# ===========================================================================
# 6. Check delivery status
# ===========================================================================
log_step "6. Check delivery status (waiting 3s for delivery attempt)"

sleep 3

api_request "GET" "/webhooks/${WEBHOOK_ID}"
assert_status "GET /webhooks/{id}" 200 "$HTTP_STATUS"

DELIVERY_STATUS=$(echo "$RESPONSE_BODY" | jq -r '.status // empty')
log_info "Delivery status: $DELIVERY_STATUS"

assert_field "Delivery has endpoint_id" "$RESPONSE_BODY" '.endpoint_id'
assert_field "Delivery has attempt_count" "$RESPONSE_BODY" '.attempt_count'

# ===========================================================================
# 7. List deliveries
# ===========================================================================
log_step "7. List deliveries"

api_request "GET" "/webhooks?page=1&per_page=10"
assert_status "GET /webhooks (list)" 200 "$HTTP_STATUS"

DELIVERY_COUNT=$(echo "$RESPONSE_BODY" | jq '.total // 0' 2>/dev/null || echo "0")
log_info "Total deliveries: $DELIVERY_COUNT"

((TESTS_RUN++))
if [ "$DELIVERY_COUNT" -ge 1 ]; then
  log_ok "At least 1 delivery found"
else
  log_fail "Expected at least 1 delivery"
fi

# ===========================================================================
# 8. Get delivery attempts
# ===========================================================================
log_step "8. Get delivery attempts"

api_request "GET" "/webhooks/${WEBHOOK_ID}/attempts"
assert_status "GET /webhooks/{id}/attempts" 200 "$HTTP_STATUS"

# ===========================================================================
# 9. Get stats
# ===========================================================================
log_step "9. Get stats"

api_request "GET" "/stats"
assert_status "GET /stats" 200 "$HTTP_STATUS"

assert_field "Stats has total_deliveries" "$RESPONSE_BODY" '.total_deliveries'
assert_field "Stats has success_rate" "$RESPONSE_BODY" '.success_rate'
assert_field "Stats has endpoints_count" "$RESPONSE_BODY" '.endpoints_count'

log_info "Total deliveries: $(echo "$RESPONSE_BODY" | jq -r '.total_deliveries')"
log_info "Success rate: $(echo "$RESPONSE_BODY" | jq -r '.success_rate')%"

# ===========================================================================
# 10. Test batch webhooks
# ===========================================================================
log_step "10. Test batch webhooks"

BATCH_BODY=$(cat <<EOF
{
  "webhooks": [
    {
      "endpoint_id": "${ENDPOINT_ID}",
      "event": "batch.test.1",
      "data": {"batch_id": 1}
    },
    {
      "endpoint_id": "${ENDPOINT_ID}",
      "event": "batch.test.2",
      "data": {"batch_id": 2}
    },
    {
      "endpoint_id": "${ENDPOINT_ID}",
      "event": "batch.test.3",
      "data": {"batch_id": 3}
    }
  ]
}
EOF
)

api_request "POST" "/webhooks/batch" "$BATCH_BODY"
assert_status "POST /webhooks/batch" 200 "$HTTP_STATUS"

BATCH_DELIVERIES=$(echo "$RESPONSE_BODY" | jq '.deliveries | length' 2>/dev/null || echo "0")
BATCH_ERRORS=$(echo "$RESPONSE_BODY" | jq '.errors | length' 2>/dev/null || echo "0")
log_info "Batch: $BATCH_DELIVERIES delivered, $BATCH_ERRORS errors"

((TESTS_RUN++))
if [ "$BATCH_DELIVERIES" -ge 1 ]; then
  log_ok "Batch returned at least 1 delivery"
else
  log_fail "Batch returned no deliveries"
fi

# ===========================================================================
# 11. Test replay
# ===========================================================================
log_step "11. Test replay"

# Replay the first webhook we sent
api_request "POST" "/webhooks/${WEBHOOK_ID}/replay"
assert_status "POST /webhooks/{id}/replay" 200 "$HTTP_STATUS"

REPLAY_ID=$(echo "$RESPONSE_BODY" | jq -r '.id // empty')
if [ -n "$REPLAY_ID" ]; then
  log_ok "Replay created new delivery: $REPLAY_ID"
else
  log_fail "Replay did not return a delivery"
fi

# ===========================================================================
# 12. Test export
# ===========================================================================
log_step "12. Test export"

api_request "GET" "/webhooks/export?format=json"
assert_status "GET /webhooks/export?format=json" 200 "$HTTP_STATUS"

# ===========================================================================
# 13. Error cases
# ===========================================================================
log_step "13. Error cases"

# 13a. Invalid URL endpoint
log_info "Testing invalid URL..."
INVALID_URL_BODY='{"url": "not-a-valid-url", "description": "bad"}'
api_request "POST" "/endpoints" "$INVALID_URL_BODY"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -eq 400 ]; then
  log_ok "Invalid URL correctly rejected (HTTP 400)"
else
  log_fail "Invalid URL — expected HTTP 400, got HTTP $HTTP_STATUS"
fi

# 13b. Missing required fields
log_info "Testing missing fields..."
MISSING_FIELDS_BODY='{"description": "no url field"}'
api_request "POST" "/endpoints" "$MISSING_FIELDS_BODY"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -eq 400 ]; then
  log_ok "Missing URL correctly rejected (HTTP 400)"
else
  log_fail "Missing URL — expected HTTP 400, got HTTP $HTTP_STATUS"
fi

# 13c. Unauthorized request (no token)
log_info "Testing unauthorized access..."
SAVE_TOKEN="$TOKEN"
TOKEN=""
api_request "GET" "/endpoints"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -eq 401 ]; then
  log_ok "Unauthorized request correctly rejected (HTTP 401)"
else
  log_fail "Unauthorized — expected HTTP 401, got HTTP $HTTP_STATUS"
fi
TOKEN="$SAVE_TOKEN"

# 13d. Not found
log_info "Testing not found..."
api_request "GET" "/endpoints/00000000-0000-0000-0000-000000000000"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -eq 404 ]; then
  log_ok "Non-existent endpoint correctly returns 404"
else
  log_fail "Not found — expected HTTP 404, got HTTP $HTTP_STATUS"
fi

# 13e. Invalid webhook (non-existent endpoint)
log_info "Testing webhook to non-existent endpoint..."
INVALID_WEBHOOK_BODY='{"endpoint_id": "00000000-0000-0000-0000-000000000000", "data": {"test": true}}'
api_request "POST" "/webhooks" "$INVALID_WEBHOOK_BODY"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -ge 400 ]; then
  log_ok "Webhook to non-existent endpoint correctly rejected (HTTP $HTTP_STATUS)"
else
  log_fail "Expected error for non-existent endpoint, got HTTP $HTTP_STATUS"
fi

# ===========================================================================
# 14. Cleanup: Delete the endpoint
# ===========================================================================
log_step "14. Cleanup"

api_request "DELETE" "/endpoints/${ENDPOINT_ID}"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -eq 200 ]; then
  log_ok "Endpoint deleted successfully"
else
  log_fail "Could not delete endpoint (HTTP $HTTP_STATUS)"
fi

# Verify deletion
api_request "GET" "/endpoints/${ENDPOINT_ID}"
((TESTS_RUN++))
if [ "$HTTP_STATUS" -eq 404 ]; then
  log_ok "Deleted endpoint returns 404"
else
  log_fail "Deleted endpoint should return 404, got HTTP $HTTP_STATUS"
fi

# ===========================================================================
# Summary
# ===========================================================================
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    Test Summary                         ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Total tests:  ${TESTS_RUN}"
echo -e "  ${GREEN}Passed:       ${TESTS_PASSED}${NC}"
echo -e "  ${RED}Failed:       ${TESTS_FAILED}${NC}"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}💥 Some tests failed.${NC}"
  exit 1
fi
