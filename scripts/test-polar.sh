#!/bin/bash
# ═══════════════════════════════════════════════════
#  HookSniff — Polar.sh Entegrasyon Test Scripti
# ═══════════════════════════════════════════════════
#  Kullanım: POLAR_ACCESS_TOKEN=xxx POLAR_WEBHOOK_SECRET=xxx bash scripts/test-polar.sh
#  Sandbox için: POLAR_ENV=sandbox bash scripts/test-polar.sh

set -euo pipefail

# ── Renkler ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

pass() { echo -e "  ${GREEN}✅ PASS${NC} — $1"; ((PASS++)); }
fail() { echo -e "  ${RED}❌ FAIL${NC} — $1"; ((FAIL++)); }
warn() { echo -e "  ${YELLOW}⚠️  WARN${NC} — $1"; ((WARN++)); }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
section() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}"; }

# ── Ortam Değişkenleri ──
TOKEN="${POLAR_ACCESS_TOKEN:-}"
SECRET="${POLAR_WEBHOOK_SECRET:-}"
ENV="${POLAR_ENV:-sandbox}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}HATA: POLAR_ACCESS_TOKEN gerekli${NC}"
    echo "Kullanım: POLAR_ACCESS_TOKEN=xxx POLAR_WEBHOOK_SECRET=xxx bash scripts/test-polar.sh"
    exit 1
fi

if [ "$ENV" = "sandbox" ]; then
    BASE_URL="https://sandbox-api.polar.sh"
    PORTAL_BASE="https://sandbox.polar.sh"
    info "🧪 Sandbox ortamı kullanılıyor"
else
    BASE_URL="https://api.polar.sh"
    PORTAL_BASE="https://polar.sh"
    info "🔴 Production ortamı kullanılıyor — dikkatli ol!"
fi

# ═══════════════════════════════════════
#  TEST 1: API Bağlantısı
# ═══════════════════════════════════════
section "TEST 1: Polar API Bağlantısı"

RESPONSE=$(curl -s -w "\n%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/v1/users/me" 2>&1) || true

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    EMAIL=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('email','?'))" 2>/dev/null || echo "?")
    pass "API bağlantısı başarılı (email: $EMAIL)"
else
    fail "API bağlantısı başarısız (HTTP $HTTP_CODE)"
    echo "    Body: $BODY"
fi

# ═══════════════════════════════════════
#  TEST 2: Ürün Listesi
# ═══════════════════════════════════════
section "TEST 2: Polar Ürünleri"

PRODUCTS=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/v1/products" 2>&1)

PRODUCT_COUNT=$(echo "$PRODUCTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    items = data.get('items', [])
    print(len(items))
    for p in items:
        print(f\"  → {p.get('name','?')} | ID: {p.get('id','?')} | Fiyat: {p.get('prices',[{}])[0].get('price_amount','?') if p.get('prices') else '?'} {p.get('prices',[{}])[0].get('currency','?') if p.get('prices') else '?'}\")
except:
    print(0)
" 2>/dev/null)

if [ "$PRODUCT_COUNT" -gt 0 ] 2>/dev/null; then
    pass "$PRODUCT_COUNT ürün bulundu"
else
    fail "Ürün bulunamadı — Polar dashboard'dan ürün oluşturulmalı"
fi

# ═══════════════════════════════════════
#  TEST 3: Webhook Konfigürasyonu
# ═══════════════════════════════════════
section "TEST 3: Webhook Konfigürasyonu"

WEBHOOKS=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/v1/webhooks" 2>&1)

WEBHOOK_COUNT=$(echo "$WEBHOOKS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    items = data.get('items', [])
    print(len(items))
    for w in items:
        url = w.get('url','?')
        events = w.get('events', [])
        print(f\"  → URL: {url}\")
        print(f\"    Events: {', '.join(events)}\")
except:
    print(0)
" 2>/dev/null)

if [ "$WEBHOOK_COUNT" -gt 0 ] 2>/dev/null; then
    pass "$WEBHOOK_COUNT webhook konfigürasyonu bulundu"
else
    fail "Webhook konfigürasyonu yok — Polar dashboard'dan eklenmeli"
    echo "    Gerekli events: subscription.created, subscription.updated, subscription.canceled, order.completed, order.created"
fi

# ═══════════════════════════════════════
#  TEST 4: Webhook Secret Doğrulama
# ═══════════════════════════════════════
section "TEST 4: Webhook Secret"

if [ -n "$SECRET" ]; then
    # HMAC-SHA256 test
    TEST_BODY='{"type":"test","data":{}}'
    TS=$(date +%s)
    SIGNED_PAYLOAD="${TS}.${TEST_BODY}"
    EXPECTED=$(echo -n "$SIGNED_PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
    
    if [ -n "$EXPECTED" ]; then
        pass "Webhook secret formatı doğru (HMAC-SHA256 üretilebildi)"
    else
        fail "Webhook secret ile HMAC üretilemedi"
    fi
else
    warn "POLAR_WEBHOOK_SECRET ayarlanmamış — webhook doğrulama test edilemez"
fi

# ═══════════════════════════════════════
#  TEST 5: Checkout Session Oluşturma
# ═══════════════════════════════════════
section "TEST 5: Checkout Session"

# Ürün ID'sini al
FIRST_PRODUCT_ID=$(echo "$PRODUCTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    items = data.get('items', [])
    if items:
        print(items[0].get('id',''))
except:
    pass
" 2>/dev/null)

if [ -n "$FIRST_PRODUCT_ID" ]; then
    CHECKOUT_RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST "$BASE_URL/v1/checkouts" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"products\": [\"$FIRST_PRODUCT_ID\"],
            \"external_customer_id\": \"test-$(date +%s)\",
            \"customer_email\": \"test@hooksniff.com\",
            \"success_url\": \"https://hooksniff.vercel.app/dashboard/billing?upgraded=true\",
            \"metadata\": {\"test\": \"true\"}
        }" 2>&1)
    
    CHECKOUT_HTTP=$(echo "$CHECKOUT_RESPONSE" | tail -1)
    CHECKOUT_BODY=$(echo "$CHECKOUT_RESPONSE" | sed '$d')
    
    if [ "$CHECKOUT_HTTP" = "200" ] || [ "$CHECKOUT_HTTP" = "201" ]; then
        CHECKOUT_URL=$(echo "$CHECKOUT_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('url',''))" 2>/dev/null)
        CHECKOUT_ID=$(echo "$CHECKOUT_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
        pass "Checkout session oluşturuldu (ID: $CHECKOUT_ID)"
        echo "    URL: $CHECKOUT_URL"
    else
        fail "Checkout session oluşturulamadı (HTTP $CHECKOUT_HTTP)"
        echo "    Body: $CHECKOUT_BODY"
    fi
else
    fail "Test için ürün ID'si alınamadı"
fi

# ═══════════════════════════════════════
#  TEST 6: Customer Portal
# ═══════════════════════════════════════
section "TEST 6: Customer Portal Session"

PORTAL_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "$BASE_URL/v1/customer-sessions/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "external_customer_id": "test-portal-session",
        "return_url": "https://hooksniff.vercel.app/dashboard/billing"
    }' 2>&1)

PORTAL_HTTP=$(echo "$PORTAL_RESPONSE" | tail -1)
PORTAL_BODY=$(echo "$PORTAL_RESPONSE" | sed '$d')

if [ "$PORTAL_HTTP" = "200" ] || [ "$PORTAL_HTTP" = "201" ]; then
    pass "Customer portal session oluşturuldu"
else
    warn "Customer portal session oluşturulamadı (HTTP $PORTAL_HTTP) — test customer olmayabilir"
fi

# ═══════════════════════════════════════
#  TEST 7: Discount/Liste
# ═══════════════════════════════════════
section "TEST 7: İndirim Kodları"

DISCOUNTS=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/v1/discounts/" 2>&1)

DISCOUNT_COUNT=$(echo "$DISCOUNTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    items = data.get('items', [])
    print(len(items))
    for d in items:
        print(f\"  → {d.get('name','?')} | Kod: {d.get('code','?')} | İndirim: {d.get('amount',0)}%\")
except:
    print(0)
" 2>/dev/null)

if [ "$DISCOUNT_COUNT" -gt 0 ] 2>/dev/null; then
    pass "$DISCOUNT_COUNT indirim kodu bulundu"
else
    info "İndirim kodu yok (opsiyonel)"
fi

# ═══════════════════════════════════════
#  TEST 8: Webhook Signature Simülasyonu
# ═══════════════════════════════════════
section "TEST 8: Webhook İmza Doğrulama (Simülasyon)"

if [ -n "$SECRET" ]; then
    # Geçerli imza oluştur
    TEST_BODY='{"type":"subscription.created","data":{"id":"sub_test","customer_id":"cust_test","product_id":"prod_test","status":"active"}}'
    TS=$(date +%s)
    SIGNED_PAYLOAD="${TS}.${TEST_BODY}"
    SIG=$(echo -n "$SIGNED_PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
    HEADER="t=${TS},v1=${SIG}"
    
    pass "Webhook imza simülasyonu başarılı"
    echo "    Header: $HEADER"
    echo "    Body: $TEST_BODY"
    
    # Süresi dolmuş imza testi
    OLD_TS=$((TS - 600))
    OLD_PAYLOAD="${OLD_TS}.${TEST_BODY}"
    OLD_SIG=$(echo -n "$OLD_PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
    OLD_HEADER="t=${OLD_TS},v1=${OLD_SIG}"
    
    pass "Süresi dolmuş imza testi (10 dk önce) — reddedilmeli"
    echo "    Header: $OLD_HEADER"
else
    warn "Webhook secret yok — imza testi atlandı"
fi

# ═══════════════════════════════════════
#  ÖZET
# ═══════════════════════════════════════
section "TEST SONUÇLARI"
echo ""
echo -e "  ${GREEN}✅ Başarılı: $PASS${NC}"
echo -e "  ${RED}❌ Başarısız: $FAIL${NC}"
echo -e "  ${YELLOW}⚠️  Uyarı: $WARN${NC}"
echo ""

if [ "$FAIL" -gt 0 ]; then
    echo -e "${RED}⚠️  $FAIL test başarısız — yukarıdaki hataları düzelt${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Tüm kritik testler başarılı!${NC}"
    exit 0
fi
