#!/bin/bash
# ═══════════════════════════════════════════════════
#  HookSniff — Polar Webhook Simülatörü
# ═══════════════════════════════════════════════════
#  Polar'dan gelen webhook'ları simüle eder.
#  HookSniff API'nin webhook'ları doğru işleyip işlemediğini test eder.
#
#  Kullanım: POLAR_WEBHOOK_SECRET=xxx API_URL=xxx bash scripts/test-polar-webhooks.sh

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

pass() { echo -e "  ${GREEN}✅ PASS${NC} — $1"; ((PASS++)); }
fail() { echo -e "  ${RED}❌ FAIL${NC} — $1"; ((FAIL++)); }
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

SECRET="${POLAR_WEBHOOK_SECRET:-}"
API_URL="${API_URL:-http://localhost:3000}"

if [ -z "$SECRET" ]; then
    echo -e "${RED}HATA: POLAR_WEBHOOK_SECRET gerekli${NC}"
    exit 1
fi

# ── Yardımcı Fonksiyon: Webhook Gönder ──
send_webhook() {
    local event_type="$1"
    local data="$2"
    local description="$3"
    
    local body="{\"type\":\"${event_type}\",\"data\":${data}}"
    local ts=$(date +%s)
    local signed_payload="${ts}.${body}"
    local sig=$(echo -n "$signed_payload" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
    
    local response=$(curl -s -w "\n%{http_code}" \
        -X POST "$API_URL/v1/billing/webhook" \
        -H "Content-Type: application/json" \
        -H "polar-signature: t=${ts},v1=${sig}" \
        -d "$body" 2>&1)
    
    local http_code=$(echo "$response" | tail -1)
    local resp_body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || [ "$http_code" = "204" ]; then
        pass "$description (HTTP $http_code)"
    elif [ "$http_code" = "409" ]; then
        pass "$description (HTTP $http_code — idempotent, zaten işlenmiş)"
    else
        fail "$description (HTTP $http_code)"
        echo "    Response: $resp_body"
    fi
}

# ═══════════════════════════════════════
#  TEST 1: Geçersiz İmza
# ═══════════════════════════════════════
section "TEST 1: Geçersiz İmza Reddedilmeli"

BODY='{"type":"subscription.created","data":{"id":"sub_test"}}'
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/v1/billing/webhook" \
    -H "Content-Type: application/json" \
    -H "polar-signature: t=12345,v1=invalidsignature" \
    -d "$BODY" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    pass "Geçersiz imza reddedildi (HTTP $HTTP_CODE)"
else
    fail "Geçersiz imza reddedilmedi (HTTP $HTTP_CODE) — güvenlik açığı!"
fi

# ═══════════════════════════════════════
#  TEST 2: Eksik İmza Header
# ═══════════════════════════════════════
section "TEST 2: Eksik İmza Header Reddedilmeli"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/v1/billing/webhook" \
    -H "Content-Type: application/json" \
    -d "$BODY" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    pass "Eksik imza reddedildi (HTTP $HTTP_CODE)"
else
    fail "Eksik imza reddedilmedi (HTTP $HTTP_CODE)"
fi

# ═══════════════════════════════════════
#  TEST 3: Süresi Dolmuş İmza
# ═══════════════════════════════════════
section "TEST 3: Süresi Dolmuş İmza Reddedilmeli"

OLD_TS=$(($(date +%s) - 600))
OLD_PAYLOAD="${OLD_TS}.${BODY}"
OLD_SIG=$(echo -n "$OLD_PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/v1/billing/webhook" \
    -H "Content-Type: application/json" \
    -H "polar-signature: t=${OLD_TS},v1=${OLD_SIG}" \
    -d "$BODY" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
    pass "Süresi dolmuş imza reddedildi (HTTP $HTTP_CODE)"
else
    fail "Süresi dolmuş imza reddedilmedi (HTTP $HTTP_CODE)"
fi

# ═══════════════════════════════════════
#  TEST 4: subscription.created
# ═══════════════════════════════════════
section "TEST 4: Webhook Event'leri"

send_webhook "subscription.created" \
    '{"id":"sub_test_001","customer_id":"cust_test_001","external_customer_id":"550e8400-e29b-41d4-a716-446655440000","product_id":"prod_test","status":"active"}' \
    "subscription.created"

# ═══════════════════════════════════════
#  TEST 5: subscription.updated
# ═══════════════════════════════════════
send_webhook "subscription.updated" \
    '{"id":"sub_test_001","customer_id":"cust_test_001","product_id":"prod_test","status":"active"}' \
    "subscription.updated (active)"

# ═══════════════════════════════════════
#  TEST 6: subscription.updated (canceled)
# ═══════════════════════════════════════
send_webhook "subscription.updated" \
    '{"id":"sub_test_001","customer_id":"cust_test_001","product_id":"prod_test","status":"canceled"}' \
    "subscription.updated (canceled status)"

# ═══════════════════════════════════════
#  TEST 7: subscription.updated (past_due)
# ═══════════════════════════════════════
send_webhook "subscription.updated" \
    '{"id":"sub_test_002","customer_id":"cust_test_001","product_id":"prod_test","status":"past_due"}' \
    "subscription.updated (past_due → payment failed)"

# ═══════════════════════════════════════
#  TEST 8: subscription.canceled
# ═══════════════════════════════════════
send_webhook "subscription.canceled" \
    '{"id":"sub_test_001"}' \
    "subscription.canceled"

# ═══════════════════════════════════════
#  TEST 9: order.completed
# ═══════════════════════════════════════
send_webhook "order.completed" \
    '{"id":"order_test_001","amount":4900,"currency":"USD","customer_id":"cust_test_001"}' \
    "order.completed (49.00 USD)"

# ═══════════════════════════════════════
#  TEST 10: order.created (legacy)
# ═══════════════════════════════════════
send_webhook "order.created" \
    '{"id":"order_test_002","amount":14900,"currency":"USD","customer_id":"cust_test_001"}' \
    "order.created (legacy, 149.00 USD)"

# ═══════════════════════════════════════
#  TEST 11: Bilinmeyen Event
# ═══════════════════════════════════════
send_webhook "unknown.event.type" \
    '{"test":true}' \
    "unknown.event.type (ignored)"

# ═══════════════════════════════════════
#  TEST 12: Boş Body
# ═══════════════════════════════════════
section "TEST 12: Boş/Geçersiz Body"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/v1/billing/webhook" \
    -H "Content-Type: application/json" \
    -H "polar-signature: t=$(date +%s),v1=abc" \
    -d '' 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "400" ]; then
    pass "Boş body reddedildi (HTTP $HTTP_CODE)"
else
    fail "Boş body reddedilmedi (HTTP $HTTP_CODE)"
fi

# ═══════════════════════════════════════
#  TEST 13: Replay Attack
# ═══════════════════════════════════════
section "TEST 13: Replay Attack Koruması"

# Aynı webhook'u tekrar gönder
BODY_REPLAY='{"type":"order.completed","data":{"id":"order_replay_001","amount":4900,"currency":"USD"}}'
TS_REPLAY=$(date +%s)
SIGNED_REPLAY="${TS_REPLAY}.${BODY_REPLAY}"
SIG_REPLAY=$(echo -n "$SIGNED_REPLAY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# İlk gönderim
curl -s -o /dev/null \
    -X POST "$API_URL/v1/billing/webhook" \
    -H "Content-Type: application/json" \
    -H "polar-signature: t=${TS_REPLAY},v1=${SIG_REPLAY}" \
    -d "$BODY_REPLAY" 2>&1

# Tekrar gönderim (aynı timestamp + signature)
RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$API_URL/v1/billing/webhook" \
    -H "Content-Type: application/json" \
    -H "polar-signature: t=${TS_REPLAY},v1=${SIG_REPLAY}" \
    -d "$BODY_REPLAY" 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "409" ]; then
    pass "Replay attack idempotent olarak işlendi (HTTP $HTTP_CODE)"
else
    fail "Replay attack beklenmeyen yanıt (HTTP $HTTP_CODE)"
fi

# ═══════════════════════════════════════
#  ÖZET
# ═══════════════════════════════════════
section "TEST SONUÇLARI"
echo ""
echo -e "  ${GREEN}✅ Başarılı: $PASS${NC}"
echo -e "  ${RED}❌ Başarısız: $FAIL${NC}"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo -e "${RED}⚠️  $FAIL test başarısız!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Tüm webhook testleri başarılı!${NC}"
    exit 0
fi
