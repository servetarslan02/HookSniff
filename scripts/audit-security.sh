#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Security Audit
# Kullanım: ./audit-security.sh [sdk-name|all]
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SDK_DIR="$SCRIPT_DIR/sdks"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}▸${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠️${NC} $1"; }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

ISSUES=0

check_secret_patterns() {
    local dir=$1
    local name=$2
    
    # Check for hardcoded secrets
    local patterns=(
        'password\s*=\s*["\x27][^"\x27]+'
        'secret\s*=\s*["\x27][^"\x27]+'
        'token\s*=\s*["\x27][^"\x27]+'
        'api_key\s*=\s*["\x27][^"\x27]+'
        'BEGIN.*PRIVATE KEY'
    )
    
    for pattern in "${patterns[@]}"; do
        if grep -rqE "$pattern" "$dir" --include="*.ts" --include="*.py" --include="*.go" --include="*.rs" --include="*.rb" --include="*.java" --include="*.kt" --include="*.php" --include="*.cs" --include="*.ex" --include="*.swift" 2>/dev/null; then
            local matches=$(grep -rlE "$pattern" "$dir" --include="*.ts" --include="*.py" --include="*.go" --include="*.rs" --include="*.rb" --include="*.java" --include="*.kt" --include="*.php" --include="*.cs" --include="*.ex" --include="*.swift" 2>/dev/null | head -5)
            fail "Potential hardcoded secret in $name: $matches"
            ISSUES=$((ISSUES + 1))
        fi
    done
}

check_dependencies() {
    local dir=$1
    local name=$2
    
    # Node.js
    if [ -f "$dir/package.json" ]; then
        log "Node.js: npm audit"
        cd "$dir"
        if npm audit --audit-level=high 2>/dev/null; then
            ok "No high/critical vulnerabilities"
        else
            warn "Vulnerabilities found — run 'npm audit fix'"
            ISSUES=$((ISSUES + 1))
        fi
        cd "$SCRIPT_DIR"
    fi
    
    # Python
    if [ -f "$dir/requirements.txt" ] || [ -f "$dir/pyproject.toml" ]; then
        log "Python: pip-audit"
        if command -v pip-audit &>/dev/null; then
            cd "$dir"
            if pip-audit 2>/dev/null; then
                ok "No known vulnerabilities"
            else
                warn "Vulnerabilities found"
                ISSUES=$((ISSUES + 1))
            fi
            cd "$SCRIPT_DIR"
        else
            warn "pip-audit not installed (pip install pip-audit)"
        fi
    fi
    
    # Rust
    if [ -f "$dir/Cargo.toml" ]; then
        log "Rust: cargo audit"
        if command -v cargo-audit &>/dev/null; then
            cd "$dir"
            if cargo audit 2>/dev/null; then
                ok "No known vulnerabilities"
            else
                warn "Vulnerabilities found"
                ISSUES=$((ISSUES + 1))
            fi
            cd "$SCRIPT_DIR"
        else
            warn "cargo-audit not installed (cargo install cargo-audit)"
        fi
    fi
}

audit_sdk() {
    local name=$1
    local dir="$SDK_DIR/$name"
    
    if [ ! -d "$dir" ]; then
        warn "SDK not found: $name"
        return
    fi
    
    section "$name"
    
    # 1. Check for hardcoded secrets
    log "Checking for hardcoded secrets..."
    check_secret_patterns "$dir" "$name"
    
    # 2. Check dependencies
    log "Checking dependencies..."
    check_dependencies "$dir" "$name"
    
    # 3. Check for eval/exec
    if grep -rqE '\beval\b|\bexec\b' "$dir" --include="*.ts" --include="*.py" --include="*.js" 2>/dev/null; then
        warn "eval/exec usage found (review for injection risks)"
        ISSUES=$((ISSUES + 1))
    else
        ok "No eval/exec usage"
    fi
    
    # 4. Check for HTTP (not HTTPS)
    if grep -rqE 'http://' "$dir" --include="*.ts" --include="*.py" --include="*.go" --include="*.rs" 2>/dev/null; then
        local http_urls=$(grep -rnE 'http://' "$dir" --include="*.ts" --include="*.py" --include="*.go" --include="*.rs" 2>/dev/null | grep -v localhost | grep -v 127.0.0.1 | head -3)
        if [ -n "$http_urls" ]; then
            warn "HTTP URLs found (should be HTTPS): $http_urls"
        fi
    else
        ok "All URLs use HTTPS"
    fi
}

# ── Ana Akış ───────────────────────────────────────────

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  HookSniff Security Audit                        ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

TARGET="${1:-all}"

case "$TARGET" in
    all)
        for sdk in node python go rust ruby java kotlin php csharp elixir swift; do
            audit_sdk "$sdk"
        done
        ;;
    *) audit_sdk "$TARGET" ;;
esac

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  Sonuç                                           ${CYAN}║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
if [ $ISSUES -eq 0 ]; then
    echo -e "${CYAN}║${NC}  ${GREEN}✅ Güvenlik sorunu bulunamadı${NC}                   ${CYAN}║${NC}"
else
    echo -e "${CYAN}║${NC}  ${YELLOW}⚠️  $ISSUES sorun bulundu${NC}                          ${CYAN}║${NC}"
fi
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
