#!/bin/bash
# HookSniff Full Monitoring — All-in-one metrics → Grafana OTLP
# Runs every minute via cron

set -euo pipefail

API_URL="https://hooksniff-api-1046140057667.europe-west1.run.app"
OTLP_URL="https://otlp-gateway-prod-eu-west-2.grafana.net/otlp/v1/logs"
DB_URL="postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require"
export DB_URL
OTLP_AUTH="Authorization: Basic $(echo -n '1625476:glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmLW90ZWwiLCJrIjoiOHZuSDRNdlU0NTEzTkMzbGt3eDE0eDljIiwibSI6eyJyIjoidXMifX0=' | base64 -w0)"
NOW_NS=$(date +%s%N)

# 1. API Health
HEALTH=$(curl -sf --max-time 10 "$API_URL/health" 2>/dev/null || echo '{}')
API_STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','down'))" 2>/dev/null || echo "down")
DB_LATENCY=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['database']['latency_ms'])" 2>/dev/null || echo "0")
QUEUE_PENDING=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['queue_detail']['pending'])" 2>/dev/null || echo "0")
QUEUE_FAILED=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['queue_detail']['failed_last_hour'])" 2>/dev/null || echo "0")
QUEUE_LATENCY=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['queue']['latency_ms'])" 2>/dev/null || echo "0")
DB_SIZE=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['checks']['db_size']['size'])" 2>/dev/null || echo "0")

# 2. Full DB Metrics (external script to avoid quoting issues)
DB_STATS=$(cd /root/.openclaw/workspace/HookSniff && node scripts/metrics.js 2>/dev/null || echo '{}')

# Parse all values
DELIVERIES_1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('deliveries_1h',0))" 2>/dev/null || echo "0")
DELIVERED_1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('delivered_1h',0))" 2>/dev/null || echo "0")
FAILED_1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failed_1h',0))" 2>/dev/null || echo "0")
DELIVERIES_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('deliveries_24h',0))" 2>/dev/null || echo "0")
DELIVERED_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('delivered_24h',0))" 2>/dev/null || echo "0")
FAILED_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failed_24h',0))" 2>/dev/null || echo "0")
TOTAL_ENDPOINTS=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_endpoints',0))" 2>/dev/null || echo "0")
NEW_ENDPOINTS_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('new_endpoints_24h',0))" 2>/dev/null || echo "0")
TOTAL_CUSTOMERS=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('total_customers',0))" 2>/dev/null || echo "0")
NEW_CUSTOMERS_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('new_customers_24h',0))" 2>/dev/null || echo "0")
NEW_CUSTOMERS_7D=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('new_customers_7d',0))" 2>/dev/null || echo "0")
ACTIVE_USERS_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('active_users_24h',0))" 2>/dev/null || echo "0")
PLAN_FREE=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_free',0))" 2>/dev/null || echo "0")
PLAN_DEVELOPER=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_developer',0))" 2>/dev/null || echo "0")
PLAN_STARTUP=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_startup',0))" 2>/dev/null || echo "0")
PLAN_PRO=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_pro',0))" 2>/dev/null || echo "0")
PLAN_ENTERPRISE=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('plan_enterprise',0))" 2>/dev/null || echo "0")
LOGINS_1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('logins_1h',0))" 2>/dev/null || echo "0")
FAILED_ACTIONS_1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('failed_actions_1h',0))" 2>/dev/null || echo "0")
AUDIT_EVENTS_24H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('audit_events_24h',0))" 2>/dev/null || echo "0")
RATE_LIMITED_1H=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('rate_limited_1h',0))" 2>/dev/null || echo "0")
Q_PENDING=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('queue_pending',0))" 2>/dev/null || echo "0")
Q_PROCESSING=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('queue_processing',0))" 2>/dev/null || echo "0")
Q_DELIVERED=$(echo "$DB_STATS" | python3 -c "import sys,json; print(json.load(sys.stdin).get('queue_delivered',0))" 2>/dev/null || echo "0")

# Success rates
if [ "$DELIVERIES_1H" -gt 0 ] 2>/dev/null; then
    SUCCESS_RATE_1H=$(python3 -c "print(round($DELIVERED_1H/$DELIVERIES_1H*100, 1))")
else
    SUCCESS_RATE_1H="100.0"
fi
if [ "$DELIVERIES_24H" -gt 0 ] 2>/dev/null; then
    SUCCESS_RATE_24H=$(python3 -c "print(round($DELIVERED_24H/$DELIVERIES_24H*100, 1))")
else
    SUCCESS_RATE_24H="100.0"
fi

# Severity
SEVERITY=9
if [ "$API_STATUS" != "healthy" ] && [ "$API_STATUS" != "operational" ]; then SEVERITY=17; fi
if [ "$Q_PENDING" -gt 50 ] 2>/dev/null; then SEVERITY=13; fi

LOG_MSG="API=$API_STATUS DB=${DB_LATENCY}ms Queue=$Q_PENDING Rate=${SUCCESS_RATE_1H}% Customers=$TOTAL_CUSTOMERS EP=$TOTAL_ENDPOINTS"

# 3. Push to Grafana OTLP
curl -sf -X POST "$OTLP_URL" \
  -H "Content-Type: application/json" \
  -H "$OTLP_AUTH" \
  -d "{
    \"resourceLogs\": [{
      \"resource\": {\"attributes\": [{\"key\": \"service.name\", \"value\": {\"stringValue\": \"hooksniff-monitor\"}}]},
      \"scopeLogs\": [{
        \"scope\": {\"name\": \"full-monitor\"},
        \"logRecords\": [{
          \"timeUnixNano\": \"$NOW_NS\",
          \"severityNumber\": $SEVERITY,
          \"severityText\": \"$([ $SEVERITY -ge 13 ] && echo WARN || echo INFO)\",
          \"body\": {\"stringValue\": \"$LOG_MSG\"},
          \"attributes\": [
            {\"key\": \"api_status\", \"value\": {\"stringValue\": \"$API_STATUS\"}},
            {\"key\": \"db_latency_ms\", \"value\": {\"intValue\": $DB_LATENCY}},
            {\"key\": \"queue_pending\", \"value\": {\"intValue\": $Q_PENDING}},
            {\"key\": \"queue_processing\", \"value\": {\"intValue\": $Q_PROCESSING}},
            {\"key\": \"queue_delivered\", \"value\": {\"intValue\": $Q_DELIVERED}},
            {\"key\": \"queue_failed_1h\", \"value\": {\"intValue\": $QUEUE_FAILED}},
            {\"key\": \"queue_latency_ms\", \"value\": {\"intValue\": $QUEUE_LATENCY}},
            {\"key\": \"deliveries_1h\", \"value\": {\"intValue\": $DELIVERIES_1H}},
            {\"key\": \"delivered_1h\", \"value\": {\"intValue\": $DELIVERED_1H}},
            {\"key\": \"failed_1h\", \"value\": {\"intValue\": $FAILED_1H}},
            {\"key\": \"deliveries_24h\", \"value\": {\"intValue\": $DELIVERIES_24H}},
            {\"key\": \"delivered_24h\", \"value\": {\"intValue\": $DELIVERED_24H}},
            {\"key\": \"failed_24h\", \"value\": {\"intValue\": $FAILED_24H}},
            {\"key\": \"success_rate_1h\", \"value\": {\"doubleValue\": $SUCCESS_RATE_1H}},
            {\"key\": \"success_rate_24h\", \"value\": {\"doubleValue\": $SUCCESS_RATE_24H}},
            {\"key\": \"total_endpoints\", \"value\": {\"intValue\": $TOTAL_ENDPOINTS}},
            {\"key\": \"new_endpoints_24h\", \"value\": {\"intValue\": $NEW_ENDPOINTS_24H}},
            {\"key\": \"total_customers\", \"value\": {\"intValue\": $TOTAL_CUSTOMERS}},
            {\"key\": \"new_customers_24h\", \"value\": {\"intValue\": $NEW_CUSTOMERS_24H}},
            {\"key\": \"new_customers_7d\", \"value\": {\"intValue\": $NEW_CUSTOMERS_7D}},
            {\"key\": \"active_users_24h\", \"value\": {\"intValue\": $ACTIVE_USERS_24H}},
            {\"key\": \"plan_free\", \"value\": {\"intValue\": $PLAN_FREE}},
            {\"key\": \"plan_developer\", \"value\": {\"intValue\": $PLAN_DEVELOPER}},
            {\"key\": \"plan_startup\", \"value\": {\"intValue\": $PLAN_STARTUP}},
            {\"key\": \"plan_pro\", \"value\": {\"intValue\": $PLAN_PRO}},
            {\"key\": \"plan_enterprise\", \"value\": {\"intValue\": $PLAN_ENTERPRISE}},
            {\"key\": \"logins_1h\", \"value\": {\"intValue\": $LOGINS_1H}},
            {\"key\": \"failed_actions_1h\", \"value\": {\"intValue\": $FAILED_ACTIONS_1H}},
            {\"key\": \"audit_events_24h\", \"value\": {\"intValue\": $AUDIT_EVENTS_24H}},
            {\"key\": \"rate_limited_1h\", \"value\": {\"intValue\": $RATE_LIMITED_1H}},
            {\"key\": \"db_size\", \"value\": {\"stringValue\": \"$DB_SIZE\"}}
          ]
        }]
      }]
    }]
  }" >/dev/null 2>&1

echo "[$(date -Iseconds)] $LOG_MSG"
