#!/bin/bash
# HookSniff AI Agent Test Script
# Kullanım: API_URL TOKEN ile çalıştırın
# ./test_agent_flow.sh https://hooksniff-api-xxx.run.app YOUR_JWT_TOKEN

API_URL="${1:-http://localhost:3000/v1}"
TOKEN="$2"

if [ -z "$TOKEN" ]; then
    echo "❌ Kullanım: ./test_agent_flow.sh API_URL JWT_TOKEN"
    exit 1
fi

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'
PASS=0
FAIL=0

test_endpoint() {
    local method=$1 path=$2 data=$3 expect=$4 desc=$5
    if [ "$method" = "GET" ]; then
        resp=$(curl -s -w "\n%{http_code}" "$API_URL$path" -H "Authorization: Bearer $TOKEN")
    else
        resp=$(curl -s -w "\n%{http_code}" -X "$method" "$API_URL$path" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    code=$(echo "$resp" | tail -1)
    body=$(echo "$resp" | sed '$d')
    if [ "$code" = "$expect" ]; then
        echo -e "${GREEN}✓${NC} $desc ($code)"
        PASS=$((PASS+1))
    else
        echo -e "${RED}✗${NC} $desc — beklenen: $expect, gelen: $code"
        echo "  $body" | head -3
        FAIL=$((FAIL+1))
    fi
    echo "$body"
}

echo "🧪 HookSniff AI Agent Test Başlıyor..."
echo "API: $API_URL"
echo ""

# 1. Agent Oluştur
echo "━━━ 1. Agent CRUD ━━━"
CREATE_RESP=$(curl -s -X POST "$API_URL/agents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Agent","description":"Test agent for testing"}')
echo "$CREATE_RESP"
AGENT_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
AGENT_KEY=$(echo "$CREATE_RESP" | grep -o '"agent_key":"[^"]*"' | cut -d'"' -f4)
echo "Agent ID: $AGENT_ID"
echo "Agent Key: $AGENT_KEY"
echo ""

# 2. Agent Listele
test_endpoint "GET" "/agents" "" "200" "Agent listele"

# 3. Agent Detayı
test_endpoint "GET" "/agents/$AGENT_ID" "" "200" "Agent detayı"

# 4. Agent Güncelle
test_endpoint "PUT" "/agents/$AGENT_ID" '{"name":"Updated Agent","description":"Updated"}' "200" "Agent güncelle"

# 5. Duplicate Name
test_endpoint "POST" "/agents" '{"name":"Updated Agent"}' "400" "Duplicate name engeli"

# 6. Geçersiz Ad
test_endpoint "POST" "/agents" '{"name":""}' "400" "Boş ad engeli"

echo ""
echo "━━━ 2. Event Sistemi ━━━"

# 7. Event Gönder
test_endpoint "POST" "/agents/$AGENT_ID/emit" '{"event_type":"order.created","payload":{"id":123,"total":99.99}}' "200" "Event gönder"

# 8. Event Geçmişi
test_endpoint "GET" "/agents/$AGENT_ID/events" "" "200" "Event geçmişi"

# 9. Event Filtrele
test_endpoint "GET" "/agents/$AGENT_ID/events?direction=emit" "" "200" "Event filtrele (direction)"

# 10. Geçersiz Event Type
test_endpoint "POST" "/agents/$AGENT_ID/emit" '{"event_type":"invalid!@#","payload":{}}' "400" "Geçersiz event type engeli"

echo ""
echo "━━━ 3. Routing ━━━"

# 11. İkinci agent oluştur
AGENT2_RESP=$(curl -s -X POST "$API_URL/agents" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Receiver Agent"}')
AGENT2_ID=$(echo "$AGENT2_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Agent 2 ID: $AGENT2_ID"

# 12. Route oluştur
test_endpoint "POST" "/agents/routes" "{\"event_type\":\"order.created\",\"target_agent_id\":\"$AGENT2_ID\"}" "201" "Route oluştur"

# 13. Route listele
test_endpoint "GET" "/agents/routes" "" "200" "Route listele"

# 14. Routing ile event gönder
test_endpoint "POST" "/agents/$AGENT_ID/emit" '{"event_type":"order.created","payload":{"id":456}}' "200" "Routing event gönder"

# 15. Receiver'ın event'leri
test_endpoint "GET" "/agents/$AGENT2_ID/events" "" "200" "Receiver event'leri"

echo ""
echo "━━━ 4. Rate Limit & Anomaly ━━━"

# 16. Rate limit
test_endpoint "GET" "/agents/$AGENT_ID/rate-limit" "" "200" "Rate limit durumu"

# 17. Rate limit güncelle
test_endpoint "PUT" "/agents/$AGENT_ID/rate-limit" '{"max_events_per_minute":120}' "200" "Rate limit güncelle"

# 18. Anomaly
test_endpoint "GET" "/agents/$AGENT_ID/anomaly" "" "200" "Anomaly kontrolü"

# 19. Stats
test_endpoint "GET" "/agents/$AGENT_ID/stats" "" "200" "Event istatistikleri"

echo ""
echo "━━━ 5. Audit Log ━━━"

# 20. Audit log
test_endpoint "GET" "/agents/audit" "" "200" "Audit log"

echo ""
echo "━━━ 6. Temizlik ━━━"

# 21. Agent sil
test_endpoint "DELETE" "/agents/$AGENT2_ID" "" "200" "Agent 2 sil"

# 22. Silinen agent'a erişim
test_endpoint "GET" "/agents/$AGENT2_ID" "" "404" "Silinen agent 404"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━"
echo -e "✅ Başarılı: ${GREEN}$PASS${NC}"
echo -e "❌ Başarısız: ${RED}$FAIL${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━"
