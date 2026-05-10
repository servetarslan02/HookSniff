#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — Deploy Grafana Alert Rules to Grafana Cloud
# ──────────────────────────────────────────────────────────────
set -euo pipefail

GRAFANA_URL="${GRAFANA_URL:?Set GRAFANA_URL (e.g. https://your-stack.grafana.net)}"
GRAFANA_API_KEY="${GRAFANA_API_KEY:?Set GRAFANA_API_KEY (Grafana Cloud → API Keys)}"
ALERT_FILE="${1:-monitoring/alerts/alert_rules.yml}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if [[ ! -f "${ALERT_FILE}" ]]; then
    echo "❌ Alert file not found: ${ALERT_FILE}"
    exit 1
fi

log "📤 Deploying alert rules to ${GRAFANA_URL}..."

# Grafana Cloud uses the provisioning API for alert rules
# Convert our Prometheus-style rules to Grafana-native alert rules

# First, check if the Grafana instance is reachable
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
    "${GRAFANA_URL}/api/health")

if [[ "${HTTP_CODE}" != "200" ]]; then
    echo "❌ Cannot reach Grafana at ${GRAFANA_URL} (HTTP ${HTTP_CODE})"
    exit 1
fi
log "✅ Grafana is reachable"

# Create or update contact point for email notifications
log "📧 Setting up email contact point..."
curl -s -X POST \
    -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
    -H "Content-Type: application/json" \
    "${GRAFANA_URL}/api/v1/provisioning/contact-points" \
    -d '{
        "name": "hooksniff-email",
        "type": "email",
        "settings": {
            "addresses": "'"${NOTIFY_EMAIL:-servetarslan02@gmail.com}"'"
        },
        "disableResolveMessage": false
    }' || log "⚠️ Contact point may already exist"

# Create notification policy (route all alerts to email)
log "📋 Setting up notification policy..."
curl -s -X PUT \
    -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
    -H "Content-Type: application/json" \
    "${GRAFANA_URL}/api/v1/provisioning/policies" \
    -d '{
        "receiver": "hooksniff-email",
        "group_by": ["alertname"],
        "group_wait": "30s",
        "group_interval": "5m",
        "repeat_interval": "4h"
    }' || log "⚠️ Policy update may have failed"

# Deploy alert rules using Grafana unified alerting API
log "🔔 Deploying alert rules..."

deploy_rule() {
    local name="$1"
    local query="$2"
    local condition="$3"
    local summary="$4"
    local severity="${5:-warning}"

    curl -s -X POST \
        -H "Authorization: Bearer ${GRAFANA_API_KEY}" \
        -H "Content-Type: application/json" \
        "${GRAFANA_URL}/api/v1/provisioning/alert-rules" \
        -d '{
            "folderUID": "hooksniff",
            "ruleGroup": "hooksniff_alerts",
            "title": "'"${name}"'",
            "condition": "C",
            "data": [
                {
                    "refId": "A",
                    "relativeTimeRange": { "from": 300, "to": 0 },
                    "datasourceUid": "${expr}",
                    "model": {
                        "expr": "'"${query}"'",
                        "refId": "A"
                    }
                },
                {
                    "refId": "C",
                    "relativeTimeRange": { "from": 300, "to": 0 },
                    "datasourceUid": "__expr__",
                    "model": {
                        "type": "threshold",
                        "refId": "C",
                        "conditions": [
                            {
                                "evaluator": { "type": "gt", "params": [0] },
                                "operator": { "type": "and" },
                                "query": { "params": ["A"] },
                                "reducer": { "type": "last" }
                            }
                        ]
                    }
                }
            ],
            "for": "2m",
            "annotations": {
                "summary": "'"${summary}"'"
            },
            "labels": {
                "severity": "'"${severity}"'"
            },
            "noDataState": "OK",
            "execErrState": "Error"
        }' 2>/dev/null && log "  ✅ ${name}" || log "  ⚠️ ${name} (may already exist)"
}

# Deploy each alert rule
deploy_rule "HighErrorRate" \
    'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05' \
    "C" \
    "High error rate detected (>5% 5xx)" \
    "critical"

deploy_rule "HighLatencyP99" \
    'histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2' \
    "C" \
    "P99 latency above 2 seconds" \
    "warning"

deploy_rule "HighDeliveryFailureRate" \
    'sum(rate(webhook_deliveries_total{status="failed"}[5m])) / sum(rate(webhook_deliveries_total[5m])) > 0.1' \
    "C" \
    "Webhook delivery failure rate >10%" \
    "critical"

deploy_rule "APIServiceDown" \
    'up{job="hooksniff-api"} == 0' \
    "C" \
    "HookSniff API is down" \
    "critical"

deploy_rule "WorkerServiceDown" \
    'up{job="hooksniff-worker"} == 0' \
    "C" \
    "HookSniff Worker is down" \
    "critical"

deploy_rule "HighQueueLatency" \
    'queue_publish_latency_seconds > 5' \
    "C" \
    "Queue publish latency above 5 seconds" \
    "warning"

deploy_rule "HighDatabaseLatency" \
    'db_query_duration_seconds > 2' \
    "C" \
    "Database query latency above 2 seconds" \
    "warning"

log "🎉 Alert deployment complete!"
log ""
log "Next steps:"
log "  1. Check Grafana dashboard: ${GRAFANA_URL}/alerting/list"
log "  2. Test alerts: curl ${GRAFANA_URL}/api/v1/provisioning/alert-rules"
log "  3. Set up Grafana Cloud OTEL exporter in Cloud Run env vars"
