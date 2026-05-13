#!/bin/bash
# HookSniff → Grafana Prometheus Remote Write
# Runs periodically to push webhook delivery metrics

GRAFANA_RW_URL="https://prometheus-prod-65-prod-eu-west-2.grafana.net/api/prom/push"
GRAFANA_USER="1625476"
GRAFANA_TOKEN="glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmLW90ZWwiLCJrIjoiOHZuSDRNdlU0NTEzTkMzbGt3eDE0eDljIiwibSI6eyJyIjoidXMifX0="

# Fetch health data from API
HEALTH=$(curl -s https://hooksniff-api-1046140057667.europe-west1.run.app/health 2>/dev/null)

if [ -z "$HEALTH" ]; then
  echo "API unreachable"
  exit 1
fi

DB_LATENCY=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['checks']['database']['latency_ms'])" 2>/dev/null)
QUEUE_PENDING=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['checks']['queue_detail']['pending'])" 2>/dev/null)
QUEUE_FAILED=$(echo "$HEALTH" | python3 -c "import sys,json; print(json.load(sys.stdin)['checks']['queue_detail']['failed_last_hour'])" 2>/dev/null)
API_STATUS=$(echo "$HEALTH" | python3 -c "import sys,json; print(1 if json.load(sys.stdin)['status']=='healthy' else 0)" 2>/dev/null)

TIMESTAMP=$(date +%s)

# Build Prometheus remote_write payload (Snappy-compressed protobuf is complex, use JSON exposition)
# Instead, use the Grafana Cloud Metrics API (simpler)
echo "HookSniff metrics: DB=${DB_LATENCY}ms Queue=${QUEUE_PENDING} Failed=${QUEUE_FAILED} Status=${API_STATUS}"
