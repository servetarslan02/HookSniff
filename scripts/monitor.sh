#!/bin/bash
# HookSniff Full Monitoring — Metrics → Grafana Prometheus via OTLP
# Runs every minute via cron

set -euo pipefail

API_URL="https://hooksniff-api-1046140057667.europe-west1.run.app"
OTLP_URL="https://otlp-gateway-prod-eu-west-2.grafana.net/otlp/v1/metrics"
DB_URL="postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require"
export DB_URL
OTLP_AUTH="Authorization: Basic $(echo -n '1625476:glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmLW90ZWwiLCJrIjoiOHZuSDRNdlU0NTEzTkMzbGt3eDE0eDljIiwibSI6eyJyIjoidXMifX0=' | base64 -w0)"
NOW_NS=$(date +%s%N)

# 1. API Health
HEALTH=$(curl -sf --max-time 10 "$API_URL/health" 2>/dev/null || echo '{}')
API_OK=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(1 if d.get('status') in ('healthy','operational') else 0)" 2>/dev/null || echo "0")
DB_LATENCY=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['database']['latency_ms'])" 2>/dev/null || echo "0")
QUEUE_PENDING=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['queue_detail']['pending'])" 2>/dev/null || echo "0")
QUEUE_FAILED=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['queue_detail']['failed_last_hour'])" 2>/dev/null || echo "0")
QUEUE_LATENCY=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['queue']['latency_ms'])" 2>/dev/null || echo "0")

# 2. DB Metrics
DB_STATS=$(cd /root/.openclaw/workspace/HookSniff && node scripts/metrics.js 2>/dev/null || echo '{}')

D1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('deliveries_1h',0))" 2>/dev/null || echo "0")
OK1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('delivered_1h',0))" 2>/dev/null || echo "0")
FL1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failed_1h',0))" 2>/dev/null || echo "0")
D24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('deliveries_24h',0))" 2>/dev/null || echo "0")
OK24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('delivered_24h',0))" 2>/dev/null || echo "0")
FL24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failed_24h',0))" 2>/dev/null || echo "0")
QP=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('queue_pending',0))" 2>/dev/null || echo "0")
QPR=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('queue_processing',0))" 2>/dev/null || echo "0")
QD=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('queue_delivered',0))" 2>/dev/null || echo "0")
EP=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_endpoints',0))" 2>/dev/null || echo "0")
EP24=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('new_endpoints_24h',0))" 2>/dev/null || echo "0")
CU=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_customers',0))" 2>/dev/null || echo "0")
CU24=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('new_customers_24h',0))" 2>/dev/null || echo "0")
CU7D=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('new_customers_7d',0))" 2>/dev/null || echo "0")
AU=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('active_users_24h',0))" 2>/dev/null || echo "0")
PF=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_free',0))" 2>/dev/null || echo "0")
PD=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_developer',0))" 2>/dev/null || echo "0")
PS=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_startup',0))" 2>/dev/null || echo "0")
PP=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_pro',0))" 2>/dev/null || echo "0")
PE=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_enterprise',0))" 2>/dev/null || echo "0")
LI=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('logins_1h',0))" 2>/dev/null || echo "0")
FA=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failed_actions_1h',0))" 2>/dev/null || echo "0")
AE=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('audit_events_24h',0))" 2>/dev/null || echo "0")
RL=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('rate_limited_1h',0))" 2>/dev/null || echo "0")

# Success rates
if [ "$D1H" -gt 0 ] 2>/dev/null; then SR1H=$(python3 -c "print(round($OK1H/$D1H*100,1))"); else SR1H="100.0"; fi
if [ "$D24H" -gt 0 ] 2>/dev/null; then SR24H=$(python3 -c "print(round($OK24H/$D24H*100,1))"); else SR24H="100.0"; fi

# 3b. Fetch Prometheus /metrics from API for cache + detailed metrics
METRICS_SECRET="${METRICS_SECRET:-1d4487405a247de66acd5a8775294334707bb9ac0ea3318c8fbd1508074bd28d}"
PROM_METRICS=$(curl -sf --max-time 10 \
  -H "Authorization: Bearer ${METRICS_SECRET}" \
  "$API_URL/metrics" 2>/dev/null || echo "")

# Extract cache metrics from Prometheus exposition format
CACHE_HITS=$(echo "$PROM_METRICS" | grep '^cache_hits_total' | awk '{print $2}' | head -1)
CACHE_MISSES=$(echo "$PROM_METRICS" | grep '^cache_misses_total' | awk '{print $2}' | head -1)
CACHE_HIT_RATE=$(echo "$PROM_METRICS" | grep '^cache_hit_rate_percent' | awk '{print $2}' | head -1)
ACTIVE_CONNS=$(echo "$PROM_METRICS" | grep '^active_connections ' | awk '{print $2}' | head -1)
ACTIVE_EPS=$(echo "$PROM_METRICS" | grep '^active_endpoints ' | awk '{print $2}' | head -1)

# Default to 0 if empty
CACHE_HITS="${CACHE_HITS:-0}"
CACHE_MISSES="${CACHE_MISSES:-0}"
CACHE_HIT_RATE="${CACHE_HIT_RATE:-0}"
ACTIVE_CONNS="${ACTIVE_CONNS:-0}"
ACTIVE_EPS="${ACTIVE_EPS:-0}"

# 4. Push all metrics to Grafana Prometheus via OTLP
build_gauge() {
  local name=$1 value=$2
  echo "{\"name\":\"$name\",\"gauge\":{\"dataPoints\":[{\"timeUnixNano\":\"$NOW_NS\",\"asDouble\":$value}]}}"
}

METRICS=$(IFS=,; echo "
$(build_gauge hooksniff_api_healthy $API_OK),
$(build_gauge hooksniff_db_latency_ms $DB_LATENCY),
$(build_gauge hooksniff_queue_pending $QP),
$(build_gauge hooksniff_queue_processing $QPR),
$(build_gauge hooksniff_queue_delivered $QD),
$(build_gauge hooksniff_queue_failed_1h $QUEUE_FAILED),
$(build_gauge hooksniff_queue_latency_ms $QUEUE_LATENCY),
$(build_gauge hooksniff_deliveries_1h $D1H),
$(build_gauge hooksniff_delivered_1h $OK1H),
$(build_gauge hooksniff_failed_1h $FL1H),
$(build_gauge hooksniff_deliveries_24h $D24H),
$(build_gauge hooksniff_delivered_24h $OK24H),
$(build_gauge hooksniff_failed_24h $FL24H),
$(build_gauge hooksniff_success_rate_1h $SR1H),
$(build_gauge hooksniff_success_rate_24h $SR24H),
$(build_gauge hooksniff_endpoints_total $EP),
$(build_gauge hooksniff_endpoints_new_24h $EP24),
$(build_gauge hooksniff_customers_total $CU),
$(build_gauge hooksniff_customers_new_24h $CU24),
$(build_gauge hooksniff_customers_new_7d $CU7D),
$(build_gauge hooksniff_active_users_24h $AU),
$(build_gauge hooksniff_plan_free $PF),
$(build_gauge hooksniff_plan_developer $PD),
$(build_gauge hooksniff_plan_startup $PS),
$(build_gauge hooksniff_plan_pro $PP),
$(build_gauge hooksniff_plan_enterprise $PE),
$(build_gauge hooksniff_logins_1h $LI),
$(build_gauge hooksniff_failed_actions_1h $FA),
$(build_gauge hooksniff_audit_events_24h $AE),
$(build_gauge hooksniff_rate_limited_1h $RL),
$(build_gauge hooksniff_cache_hits $CACHE_HITS),
$(build_gauge hooksniff_cache_misses $CACHE_MISSES),
$(build_gauge hooksniff_cache_hit_rate $CACHE_HIT_RATE),
$(build_gauge hooksniff_active_connections $ACTIVE_CONNS),
$(build_gauge hooksniff_active_endpoints_from_metrics $ACTIVE_EPS)
")

curl -sf -X POST "$OTLP_URL" \
  -H "Content-Type: application/json" \
  -H "$OTLP_AUTH" \
  -d "{
    \"resourceMetrics\": [{
      \"resource\": {\"attributes\": [{\"key\": \"service.name\", \"value\": {\"stringValue\": \"hooksniff\"}}]},
      \"scopeMetrics\": [{
        \"scope\": {\"name\": \"hooksniff-monitor\"},
        \"metrics\": [$METRICS]
      }]
    }]
  }" >/dev/null 2>&1

echo "[$(date -Iseconds)] API=$API_OK DB=${DB_LATENCY}ms Q=$QP Rate=${SR1H}% CU=$CU EP=$EP"
