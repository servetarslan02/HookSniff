#!/bin/bash
# HookSniff Integration Test Suite
# Tests all major API endpoints
# Usage: ./tests/integration/full_test.sh [API_URL]

set -e

API_URL="${1:-http://localhost:3000/v1}"
PASS=0
FAIL=0
TOKEN=""
API_KEY=""
ENDPOINT_ID=""
DELIVERY_ID=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() { echo -e "  ${GREEN}✅ PASS${NC} $1"; PASS=$((PASS + 1)); }
log_fail() { echo -e "  ${RED}❌ FAIL${NC} $1"; FAIL=$((FAIL + 1)); }
log_info() { echo -e "  ${YELLOW}ℹ️  $1${NC}"; }

echo "🪝 HookSniff Integration Tests"
echo "   API: $API_URL"
echo ""

# ── 1. Health Check ──
echo "📋 Health Check"
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$API_URL/../status" 2>/dev/null || echo "000")
if [ "$STATUS" = "200" ]; then
    log_pass "GET /status → 200"
else
    log_fail "GET /status → $STATUS (expected 200)"
fi

# ── 2. Auth: Register ──
echo ""
echo "📋 Auth"
EMAIL="test_$(date +%s)@example.com"
RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"testpassword123\"}" 2>/dev/null)

if echo "$RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    API_KEY=$(echo "$RESPONSE" | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
    log_pass "POST /auth/register → token received"
else
    log_fail "POST /auth/register → $RESPONSE"
fi

# ── 3. Auth: Login ──
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$EMAIL\", \"password\": \"testpassword123\"}" 2>/dev/null)

if echo "$RESPONSE" | grep -q "token"; then
    log_pass "POST /auth/login → token received"
else
    log_fail "POST /auth/login → $RESPONSE"
fi

# ── 4. Endpoints CRUD ──
echo ""
echo "📋 Endpoints"

# Create
RESPONSE=$(curl -s -X POST "$API_URL/endpoints" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"url": "https://httpbin.org/post", "description": "Test endpoint"}' 2>/dev/null)

if echo "$RESPONSE" | grep -q "id"; then
    ENDPOINT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    log_pass "POST /endpoints → created ($ENDPOINT_ID)"
else
    log_fail "POST /endpoints → $RESPONSE"
fi

# List
RESPONSE=$(curl -s "$API_URL/endpoints" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$RESPONSE" | grep -q "\["; then
    COUNT=$(echo "$RESPONSE" | grep -o '"id"' | wc -l)
    log_pass "GET /endpoints → $COUNT endpoints"
else
    log_fail "GET /endpoints → $RESPONSE"
fi

# Get single
if [ -n "$ENDPOINT_ID" ]; then
    RESPONSE=$(curl -s "$API_URL/endpoints/$ENDPOINT_ID" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)

    if echo "$RESPONSE" | grep -q "$ENDPOINT_ID"; then
        log_pass "GET /endpoints/:id → found"
    else
        log_fail "GET /endpoints/:id → $RESPONSE"
    fi
fi

# ── 5. Webhooks ──
echo ""
echo "📋 Webhooks"

# Send webhook
if [ -n "$ENDPOINT_ID" ]; then
    RESPONSE=$(curl -s -X POST "$API_URL/webhooks" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"endpoint_id\": \"$ENDPOINT_ID\", \"event\": \"test.integration\", \"data\": {\"test\": true}}" 2>/dev/null)

    if echo "$RESPONSE" | grep -q "id"; then
        DELIVERY_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        log_pass "POST /webhooks → sent ($DELIVERY_ID)"
    else
        log_fail "POST /webhooks → $RESPONSE"
    fi
fi

# List deliveries
RESPONSE=$(curl -s "$API_URL/webhooks" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$RESPONSE" | grep -q "deliveries"; then
    log_pass "GET /webhooks → list received"
else
    log_fail "GET /webhooks → $RESPONSE"
fi

# Get delivery detail
if [ -n "$DELIVERY_ID" ]; then
    RESPONSE=$(curl -s "$API_URL/webhooks/$DELIVERY_ID" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)

    if echo "$RESPONSE" | grep -q "$DELIVERY_ID"; then
        log_pass "GET /webhooks/:id → found"
    else
        log_fail "GET /webhooks/:id → $RESPONSE"
    fi
fi

# ── 6. Stats ──
echo ""
echo "📋 Stats"
RESPONSE=$(curl -s "$API_URL/stats" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$RESPONSE" | grep -q "total_deliveries"; then
    log_pass "GET /stats → data received"
else
    log_fail "GET /stats → $RESPONSE"
fi

# ── 7. API Keys ──
echo ""
echo "📋 API Keys"
RESPONSE=$(curl -s "$API_URL/api-keys" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if echo "$RESPONSE" | grep -q "\["; then
    log_pass "GET /api-keys → list received"
else
    log_fail "GET /api-keys → $RESPONSE"
fi

# ── 8. Alerts ──
echo ""
echo "📋 Alerts"
RESPONSE=$(curl -s "$API_URL/alerts" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if [ "$?" = "0" ]; then
    log_pass "GET /alerts → responded"
else
    log_fail "GET /alerts → error"
fi

# ── 9. Endpoint Health ──
echo ""
echo "📋 Endpoint Health"
RESPONSE=$(curl -s "$API_URL/endpoint-health" \
    -H "Authorization: Bearer $TOKEN" 2>/dev/null)

if [ "$?" = "0" ]; then
    log_pass "GET /endpoint-health → responded"
else
    log_fail "GET /endpoint-health → error"
fi

# ── 10. Cleanup ──
echo ""
echo "📋 Cleanup"

if [ -n "$ENDPOINT_ID" ]; then
    RESPONSE=$(curl -s -X DELETE "$API_URL/endpoints/$ENDPOINT_ID" \
        -H "Authorization: Bearer $TOKEN" 2>/dev/null)

    if echo "$RESPONSE" | grep -q "deleted"; then
        log_pass "DELETE /endpoints/:id → deleted"
    else
        log_fail "DELETE /endpoints/:id → $RESPONSE"
    fi
fi

# ── Summary ──
echo ""
echo "═══════════════════════════════════════"
echo -e "  Total: $((PASS + FAIL)) | ${GREEN}Pass: $PASS${NC} | ${RED}Fail: $FAIL${NC}"
echo "═══════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
    exit 1
fi
