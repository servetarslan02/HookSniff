#!/usr/bin/env bash
# ============================================================================
# HookSniff Local CI Script
# ============================================================================
# GitHub Actions yerine kullanılır. Her push öncesi çalıştırılmalı.
#
# Kullanım:
#   chmod +x scripts/ci-local.sh
#   ./scripts/ci-local.sh
#
# Veya sadece belirli adımlar:
#   ./scripts/ci-local.sh fmt        # Sadece format kontrolü
#   ./scripts/ci-local.sh clippy     # Sadece lint
#   ./scripts/ci-local.sh test       # Sadece test
#   ./scripts/ci-local.sh build      # Sadece build
#   ./scripts/ci-local.sh dashboard  # Sadece dashboard
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

log() { echo -e "${BLUE}[CI]${NC} $1"; }
ok()  { echo -e "${GREEN}✅ $1${NC}"; }
fail(){ echo -e "${RED}❌ $1${NC}"; exit 1; }
warn(){ echo -e "${YELLOW}⚠️  $1${NC}"; }

cd "$ROOT_DIR"

# Source Rust environment if available
if [ -f "$HOME/.cargo/env" ]; then
    source "$HOME/.cargo/env"
fi

run_fmt() {
    log "Format kontrolü..."
    cargo fmt --all -- --check
    ok "Format OK"
}

run_clippy() {
    log "Clippy lint..."
    cargo clippy --workspace --all-targets -- -D warnings
    ok "Clippy OK"
}

run_test() {
    log "Test çalıştırılıyor..."
    cargo test --workspace
    ok "Tüm testler geçti"
}

run_build() {
    log "Release build..."
    cargo build --release -p hooksniff-api
    cargo build --release -p hooksniff-worker
    ok "Build OK"
}

run_dashboard() {
    log "Dashboard build..."
    cd dashboard
    npm ci 2>/dev/null || npm install
    npm run lint
    npm run build
    cd ..
    ok "Dashboard OK"
}

run_all() {
    log "=== HookSniff Local CI Başlıyor ==="
    echo ""

    run_fmt
    run_clippy
    run_test
    run_build
    run_dashboard

    echo ""
    ok "=== Tüm CI kontrolleri geçti! ==="
}

# Anadług
case "${1:-all}" in
    fmt)        run_fmt ;;
    clippy)     run_clippy ;;
    test)       run_test ;;
    build)      run_build ;;
    dashboard)  run_dashboard ;;
    all)        run_all ;;
    *)          echo "Kullanım: $0 [fmt|clippy|test|build|dashboard|all]"; exit 1 ;;
esac
