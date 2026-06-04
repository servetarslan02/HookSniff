#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — Webhook Queue Latency Benchmark
# ──────────────────────────────────────────────────────────────
# Measures first-trigger latency for webhook delivery.
# Compares PG queue (USE_REDIS_QUEUE=false) vs Redis queue (USE_REDIS_QUEUE=true).
#
# Usage:
#   ./scripts/benchmark-webhook-latency.sh <API_URL> <API_KEY> <ENDPOINT_ID>
#
# Example:
#   ./scripts/benchmark-webhook-latency.sh https://api.hooksniff.com hr_live_xxx ep-uuid
# ──────────────────────────────────────────────────────────────
set -euo pipefail

API_URL="${1:?Usage: $0 <API_URL> <API_KEY> <ENDPOINT_ID>}"
API_KEY="${2:?Missing API_KEY}"
ENDPOINT_ID="${3:?Missing ENDPOINT_ID}"
COUNT="${4:-100}"

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  HookSniff — Webhook Latency Benchmark                  ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  API:       $API_URL"
echo "║  Endpoint:  $ENDPOINT_ID"
echo "║  Requests:  $COUNT"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

TOTAL_MS=0
MIN_MS=999999
MAX_MS=0
SUCCESS=0
FAILED=0

for i in $(seq 1 "$COUNT"); do
    START=$(date +%s%N)

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST "$API_URL/v1/webhooks" \
        -H "Authorization: Bearer $API_KEY" \
        -H "Content-Type: application/json" \
        -H "Idempotency-Key: bench-$i-$(date +%s)" \
        -d "{
            \"endpoint_id\": \"$ENDPOINT_ID\",
            \"event\": \"benchmark.test\",
            \"data\": {\"index\": $i, \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}
        }" 2>/dev/null || echo "000")

    END=$(date +%s%N)
    DURATION_MS=$(( (END - START) / 1000000 ))

    if [[ "$HTTP_CODE" == "200" ]]; then
        TOTAL_MS=$((TOTAL_MS + DURATION_MS))
        SUCCESS=$((SUCCESS + 1))
        [[ $DURATION_MS -lt $MIN_MS ]] && MIN_MS=$DURATION_MS
        [[ $DURATION_MS -gt $MAX_MS ]] && MAX_MS=$DURATION_MS
        echo "  [$i/$COUNT] ✅ ${DURATION_MS}ms (HTTP $HTTP_CODE)"
    else
        FAILED=$((FAILED + 1))
        echo "  [$i/$COUNT] ❌ ${DURATION_MS}ms (HTTP $HTTP_CODE)"
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Results                                                 ║"
echo "╠══════════════════════════════════════════════════════════╣"

if [[ $SUCCESS -gt 0 ]]; then
    AVG_MS=$((TOTAL_MS / SUCCESS))
    echo "║  Successful:  $SUCCESS / $COUNT"
    echo "║  Failed:      $FAILED / $COUNT"
    echo "║  Avg latency: ${AVG_MS}ms"
    echo "║  Min latency: ${MIN_MS}ms"
    echo "║  Max latency: ${MAX_MS}ms"
    echo "║                                                          ║"

    if [[ $AVG_MS -lt 50 ]]; then
        echo "║  🚀 EXCELLENT — Redis queue active (< 50ms avg)"
    elif [[ $AVG_MS -lt 200 ]]; then
        echo "║  ✅ GOOD — Fast delivery (< 200ms avg)"
    elif [[ $AVG_MS -lt 1000 ]]; then
        echo "║  ⚠️  OK — PG queue or slow endpoint (< 1s avg)"
    else
        echo "║  ❌ SLOW — Check endpoint health (> 1s avg)"
    fi
else
    echo "║  ❌ All requests failed!"
fi

echo "╚══════════════════════════════════════════════════════════╝"
