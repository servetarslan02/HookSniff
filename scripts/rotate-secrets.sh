#!/usr/bin/env bash
# scripts/rotate-secrets.sh — Secret rotation tracker & reminder
# Usage:
#   ./scripts/rotate-secrets.sh              # Show status of all secrets
#   ./scripts/rotate-secrets.sh --update JWT_SECRET 2026-05-12  # Update rotation date
#   ./scripts/rotate-secrets.sh --check      # Show only overdue secrets

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
STATE_FILE="${PROJECT_ROOT}/.secret-rotation-state.json"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Secret definitions: name|frequency_days|severity
SECRETS=(
  "JWT_SECRET|90|CRITICAL"
  "DATABASE_URL|90|CRITICAL"
  "REDIS_URL|90|HIGH"
  "POLAR_SECRET_KEY|90|CRITICAL"
  "POLAR_WEBHOOK_SECRET|90|HIGH"
  "RESEND_API_KEY|90|HIGH"
  "OTEL_EXPORTER_OTLP_HEADERS|180|LOW"
  "GRAFANA_SERVICE_ACCOUNT_TOKEN|180|LOW"
  "CLOUDFLARE_R2_ACCESS_KEY|90|HIGH"
  "ADMIN_API_KEY|30|CRITICAL"
  "NEON_API_KEY|90|HIGH"
  "GOOGLE_OAUTH_CLIENT_SECRET|180|HIGH"
)

init_state() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo "{}" > "$STATE_FILE"
    echo -e "${CYAN}Created state file: ${STATE_FILE}${NC}"
  fi
}

get_rotation_date() {
  local name="$1"
  python3 -c "
import json, sys
with open('${STATE_FILE}') as f:
    data = json.load(f)
print(data.get('$name', {}).get('last_rotation', 'never'))
" 2>/dev/null || echo "never"
}

update_rotation_date() {
  local name="$1"
  local date="$2"
  python3 -c "
import json
with open('${STATE_FILE}', 'r+') as f:
    data = json.load(f)
    if '$name' not in data:
        data['$name'] = {}
    data['$name']['last_rotation'] = '$date'
    data['$name']['updated_by'] = 'manual'
    f.seek(0)
    f.truncate()
    json.dump(data, f, indent=2)
"
  echo -e "${GREEN}✅ Updated ${name} rotation date to ${date}${NC}"
}

days_since() {
  local date_str="$1"
  if [[ "$date_str" == "never" ]]; then
    echo "999"
    return
  fi
  local then_epoch
  then_epoch=$(date -d "$date_str" +%s 2>/dev/null || date -j -f "%Y-%m-%d" "$date_str" +%s 2>/dev/null || echo "0")
  local now_epoch
  now_epoch=$(date +%s)
  echo $(( (now_epoch - then_epoch) / 86400 ))
}

show_status() {
  local check_only="${1:-false}"
  local overdue_count=0

  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║           🔐 HookSniff — Secret Rotation Status                ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════════════════════╝${NC}"
  echo ""

  for entry in "${SECRETS[@]}"; do
    IFS='|' read -r name freq severity <<< "$entry"
    last_rotation=$(get_rotation_date "$name")
    days=$(days_since "$last_rotation")

    if [[ "$last_rotation" == "never" ]]; then
      display_date="⚠️  Never rotated"
    else
      display_date="$last_rotation"
    fi

    # Status indicator
    if (( days > freq )); then
      status="${RED}🔴 OVERDUE${NC} (${days}d / ${freq}d)"
      ((overdue_count++))
    elif (( days > freq - 14 )); then
      status="${YELLOW}🟡 SOON${NC} (${days}d / ${freq}d)"
    else
      status="${GREEN}🟢 OK${NC} (${days}d / ${freq}d)"
    fi

    if [[ "$check_only" == "true" ]] && (( days <= freq )); then
      continue
    fi

    # Severity badge
    case "$severity" in
      CRITICAL) sev_badge="${RED}[CRITICAL]${NC}" ;;
      HIGH)     sev_badge="${YELLOW}[HIGH]${NC}" ;;
      *)        sev_badge="${GREEN}[LOW]${NC}" ;;
    esac

    printf "  %-35s %b  Last: %-16s %b\n" "$name" "$sev_badge" "$display_date" "$status"
  done

  echo ""
  echo -e "${BOLD}────────────────────────────────────────────────────────────────${NC}"

  if (( overdue_count > 0 )); then
    echo -e "  ${RED}${BOLD}⚠️  ${overdue_count} secret(s) overdue for rotation!${NC}"
    echo -e "  ${YELLOW}Run: ./scripts/rotate-secrets.sh --help${NC}"
  else
    echo -e "  ${GREEN}✅ All secrets within rotation schedule.${NC}"
  fi

  echo ""
}

show_help() {
  echo "Usage:"
  echo "  ./scripts/rotate-secrets.sh                     Show all secrets status"
  echo "  ./scripts/rotate-secrets.sh --check              Show only overdue secrets"
  echo "  ./scripts/rotate-secrets.sh --update NAME DATE   Update rotation date"
  echo "  ./scripts/rotate-secrets.sh --help               Show this help"
  echo ""
  echo "Examples:"
  echo "  ./scripts/rotate-secrets.sh --update JWT_SECRET 2026-05-12"
  echo "  ./scripts/rotate-secrets.sh --check"
}

# --- Main ---

init_state

case "${1:-}" in
  --update)
    if [[ -z "${2:-}" || -z "${3:-}" ]]; then
      echo -e "${RED}Error: --update requires SECRET_NAME and DATE${NC}"
      echo "Usage: $0 --update SECRET_NAME YYYY-MM-DD"
      exit 1
    fi
    update_rotation_date "$2" "$3"
    ;;
  --check)
    show_status "true"
    ;;
  --help|-h)
    show_help
    ;;
  "")
    show_status "false"
    ;;
  *)
    echo -e "${RED}Unknown option: $1${NC}"
    show_help
    exit 1
    ;;
esac
