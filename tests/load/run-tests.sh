#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — Load Test Runner
# Wraps k6 tests with environment setup and reporting
# ──────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESULTS_DIR="${SCRIPT_DIR}/results/$(date '+%Y%m%d_%H%M%S')"
BASE_URL="${BASE_URL:-http://localhost:3000}"
API_KEY="${API_KEY:-}"
RECEIVER_URL="${RECEIVER_URL:-http://localhost:8090}"

mkdir -p "${RESULTS_DIR}"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

# ── Check prerequisites ──
check_prereqs() {
    if ! command -v k6 &>/dev/null; then
        log "❌ k6 not found. Install: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi

    if [[ -z "${API_KEY}" ]]; then
        log "❌ API_KEY not set. Usage: API_KEY=hr_live_xxx $0"
        exit 1
    fi

    log "✅ Prerequisites OK"
    log "   Base URL: ${BASE_URL}"
    log "   Receiver: ${RECEIVER_URL}"
    log "   Results:  ${RESULTS_DIR}"
}

# ── Start test receiver ──
start_receiver() {
    log "🚀 Starting test webhook receiver on ${RECEIVER_URL}..."
    node "${SCRIPT_DIR}/webhook_receiver.js" &
    RECEIVER_PID=$!
    sleep 1

    if kill -0 "${RECEIVER_PID}" 2>/dev/null; then
        log "✅ Receiver running (PID: ${RECEIVER_PID})"
    else
        log "⚠️  Receiver failed to start (may already be running)"
    fi
}

# ── Stop test receiver ──
stop_receiver() {
    if [[ -n "${RECEIVER_PID:-}" ]]; then
        kill "${RECEIVER_PID}" 2>/dev/null || true
        log "🛑 Receiver stopped"
    fi
}

# ── Run test ──
run_test() {
    local test_name="$1"
    local test_file="$2"
    local desc="$3"

    log ""
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "🧪 Running: ${test_name}"
    log "   ${desc}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    k6 run \
        --summary-export="${RESULTS_DIR}/${test_name}.json" \
        --out json="${RESULTS_DIR}/${test_name}_raw.json" \
        -e "BASE_URL=${BASE_URL}" \
        -e "API_KEY=${API_KEY}" \
        -e "RECEIVER_URL=${RECEIVER_URL}" \
        "${test_file}" 2>&1 | tee "${RESULTS_DIR}/${test_name}.log"

    local exit_code=${PIPESTATUS[0]}
    if [[ ${exit_code} -eq 0 ]]; then
        log "✅ ${test_name} passed"
    else
        log "⚠️  ${test_name} exited with code ${exit_code}"
    fi

    return ${exit_code}
}

# ── Generate report ──
generate_report() {
    log ""
    log "📊 Generating report..."

    cat > "${RESULTS_DIR}/report.md" << EOF
# HookSniff Load Test Report

**Date:** $(date '+%Y-%m-%d %H:%M:%S')
**Base URL:** ${BASE_URL}
**Receiver:** ${RECEIVER_URL}

## Results

| Test | Status | Details |
|------|--------|---------|
| Smoke | $(if [[ -f "${RESULTS_DIR}/smoke.json" ]]; then echo "✅"; else echo "⏭️"; fi) | Quick validation |
| Webhook Flow | $(if [[ -f "${RESULTS_DIR}/webhook_flow.json" ]]; then echo "✅"; else echo "⏭️"; fi) | End-to-end delivery |
| API Stress | $(if [[ -f "${RESULTS_DIR}/api_stress.json" ]]; then echo "✅"; else echo "⏭️"; fi) | Latency under load |

## Files

$(ls -la "${RESULTS_DIR}"/ 2>/dev/null | awk '{print "- " $NF}')

## Interpretation

See \`tests/load/README.md\` for baselines and how to read results.
EOF

    log "📄 Report: ${RESULTS_DIR}/report.md"
}

# ── Main ──
trap stop_receiver EXIT

check_prereqs

case "${1:-all}" in
    smoke)
        start_receiver
        run_test "smoke" "${SCRIPT_DIR}/smoke_test.js" "Quick health check (30s, 5 VUs)"
        ;;
    flow)
        start_receiver
        run_test "webhook_flow" "${SCRIPT_DIR}/k6_webhook_flow.js" "End-to-end webhook delivery (6.5min)"
        ;;
    stress)
        start_receiver
        run_test "api_stress" "${SCRIPT_DIR}/k6_api_stress.js" "API stress test (5min)"
        ;;
    ws)
        start_receiver
        run_test "ws_stress" "${SCRIPT_DIR}/k6_ws_stress.js" "WebSocket stress test (100 connections)" -e "MODE=stress"
        ;;
    ws-memory)
        start_receiver
        run_test "ws_memory" "${SCRIPT_DIR}/k6_ws_stress.js" "WebSocket memory leak test (10min)" -e "MODE=memory"
        ;;
    ws-reconnect)
        start_receiver
        run_test "ws_reconnect" "${SCRIPT_DIR}/k6_ws_stress.js" "WebSocket reconnect test" -e "MODE=reconnect"
        ;;
    integration)
        start_receiver
        run_test "ws_integration" "${SCRIPT_DIR}/../integration/ws_integration_test.js" "WS integration test" || true
        ;;
    e2e)
        start_receiver
        run_test "e2e" "${SCRIPT_DIR}/../integration/e2e_test.js" "End-to-end test suite" || true
        ;;
    all)
        start_receiver
        run_test "smoke" "${SCRIPT_DIR}/smoke_test.js" "Quick health check" || true
        sleep 5
        run_test "webhook_flow" "${SCRIPT_DIR}/k6_webhook_flow.js" "End-to-end webhook delivery" || true
        sleep 5
        run_test "api_stress" "${SCRIPT_DIR}/k6_api_stress.js" "API stress test" || true
        sleep 5
        run_test "ws_stress" "${SCRIPT_DIR}/k6_ws_stress.js" "WebSocket stress test" -e "MODE=stress" || true
        sleep 5
        run_test "ws_integration" "${SCRIPT_DIR}/../integration/ws_integration_test.js" "WS integration test" || true
        sleep 5
        run_test "e2e" "${SCRIPT_DIR}/../integration/e2e_test.js" "End-to-end test suite" || true
        generate_report
        ;;
    *)
        echo "Usage: $0 {smoke|flow|stress|ws|ws-memory|ws-reconnect|integration|e2e|all}"
        echo ""
        echo "Environment:"
        echo "  BASE_URL      API base URL (default: http://localhost:3000)"
        echo "  API_KEY       Your hr_live_* API key (required)"
        echo "  RECEIVER_URL  Test receiver URL (default: http://localhost:8090)"
        exit 1
        ;;
esac

log ""
log "🎉 Done! Results in: ${RESULTS_DIR}/"
