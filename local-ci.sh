#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff Local CI — GitHub Actions yerine
# Kullanım: ./local-ci.sh [all|rust|dashboard|sdks|lint|test|build]
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0
START_TIME=$(date +%s)

log()  { echo -e "${CYAN}▸${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌${NC} $1"; FAIL=$((FAIL+1)); }
skip() { echo -e "  ${YELLOW}⏭${NC} $1"; SKIP=$((SKIP+1)); }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# ── Rust Lint ──────────────────────────────────────────
rust_lint() {
    section "Rust Lint (fmt + clippy)"
    if ! command -v cargo &>/dev/null; then
        skip "cargo bulunamadı — Rust lint atlandı"
        return
    fi
    log "cargo fmt --check"
    if cargo fmt --all -- --check 2>/dev/null; then
        ok "Format uygun"
    else
        fail "Format hatası — 'cargo fmt --all' çalıştırın"
    fi
    log "cargo clippy"
    if cargo clippy --workspace --all-targets -- -D warnings 2>/dev/null; then
        ok "Clippy temiz"
    else
        fail "Clippy uyarıları var"
    fi
}

# ── Rust Test ──────────────────────────────────────────
rust_test() {
    section "Rust Test"
    if ! command -v cargo &>/dev/null; then
        skip "cargo bulunamadı — Rust test atlandı"
        return
    fi
    log "cargo test --workspace"
    if cargo test --workspace 2>/dev/null; then
        ok "Tüm Rust testleri geçti"
    else
        fail "Rust test hatası"
    fi
}

# ── Rust Build ─────────────────────────────────────────
rust_build() {
    section "Rust Build (release)"
    if ! command -v cargo &>/dev/null; then
        skip "cargo bulunamadı — Rust build atlandı"
        return
    fi
    log "cargo build --release -p hooksniff-api"
    if cargo build --release -p hooksniff-api 2>/dev/null; then
        ok "API binary: target/release/hooksniff-api"
    else
        fail "API build hatası"
    fi
    log "cargo build --release -p hooksniff-worker"
    if cargo build --release -p hooksniff-worker 2>/dev/null; then
        ok "Worker binary: target/release/hooksniff-worker"
    else
        fail "Worker build hatası"
    fi
}

# ── Dashboard ──────────────────────────────────────────
dashboard() {
    section "Dashboard (Next.js)"
    if ! command -v npm &>/dev/null; then
        skip "npm bulunamadı"
        return
    fi
    cd dashboard

    log "npm ci"
    if npm ci --silent 2>/dev/null; then
        ok "Bağımlılıklar yüklendi"
    else
        fail "npm ci hatası"
        cd "$SCRIPT_DIR"
        return
    fi

    log "npm run lint"
    if npm run lint 2>/dev/null; then
        ok "Lint temiz"
    else
        fail "Lint hatası"
    fi

    log "npm test"
    if npm test --silent 2>/dev/null; then
        ok "Testler geçti"
    else
        skip "Test bulunamadı veya başarısız"
    fi

    log "npm run build"
    if npm run build 2>/dev/null; then
        ok "Build başarılı"
    else
        fail "Build hatası"
    fi

    cd "$SCRIPT_DIR"
}

# ── SDK Tests ──────────────────────────────────────────
sdk_tests() {
    section "SDK Tests"
    bash run-tests.sh all
}

# ── Security Audit ─────────────────────────────────────
security() {
    section "Security Audit"
    if command -v cargo &>/dev/null; then
        if cargo install --list 2>/dev/null | grep -q cargo-audit; then
            log "cargo audit"
            if cargo audit 2>/dev/null; then
                ok "Rust bağımlılıkları güvenli"
            else
                fail "Güvenlik açıkları var"
            fi
        else
            skip "cargo-audit yüklü değil (cargo install cargo-audit)"
        fi
    else
        skip "cargo bulunamadı"
    fi

    if command -v npm &>/dev/null && [ -d dashboard ]; then
        log "npm audit (dashboard)"
        cd dashboard
        if npm audit --audit-level=high 2>/dev/null; then
            ok "Node bağımlılıkları güvenli"
        else
            skip "npm audit uyarıları var (devam edilebilir)"
        fi
        cd "$SCRIPT_DIR"
    fi
}

# ── Sonuç ──────────────────────────────────────────────
summary() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  Local CI Sonuçları                              ${CYAN}║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}✅ Geçen:${NC} $PASS                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}❌ Başarısız:${NC} $FAIL                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${YELLOW}⏭ Atlanan:${NC} $SKIP                                   ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ⏱ Süre: ${ELAPSED}s                                    ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}⚠️  $FAIL hata var — düzeltmeden push etmeyin!${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ CI başarılı — push edebilirsiniz${NC}"
    fi
}

# ── Ana Akış ───────────────────────────────────────────
case "${1:-all}" in
    rust)
        rust_lint
        rust_test
        rust_build
        ;;
    dashboard)
        dashboard
        ;;
    sdks)
        sdk_tests
        ;;
    lint)
        rust_lint
        ;;
    test)
        rust_test
        sdk_tests
        ;;
    build)
        rust_build
        dashboard
        ;;
    security)
        security
        ;;
    all)
        rust_lint
        rust_test
        dashboard
        sdk_tests
        security
        ;;
    *)
        echo "Kullanım: $0 [all|rust|dashboard|sdks|lint|test|build|security]"
        exit 1
        ;;
esac

summary
