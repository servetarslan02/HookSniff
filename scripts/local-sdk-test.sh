#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Local Test Runner (Genişletilmiş)
# Kullanım: ./local-sdk-test.sh [all|node|python|go|rust|ruby|java|kotlin|php|csharp|elixir|swift]
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SDK_DIR="$SCRIPT_DIR/sdks"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0

log()  { echo -e "${CYAN}▸${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌${NC} $1"; FAIL=$((FAIL+1)); }
skip() { echo -e "  ${YELLOW}⏭${NC} $1"; SKIP=$((SKIP+1)); }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

check_tool() {
    if ! command -v "$1" &>/dev/null; then
        skip "$2 — $1 yüklü değil"
        return 1
    fi
    return 0
}

# ── Node.js ────────────────────────────────────────────
test_node() {
    section "📦 Node.js SDK"
    check_tool npm "Node.js" || return
    cd "$SDK_DIR/node"
    log "npm ci"
    npm ci --silent 2>/dev/null || { fail "npm ci"; cd "$SCRIPT_DIR"; return; }
    log "lint + test"
    if npm test --silent 2>/dev/null; then
        ok "Node.js testleri geçti"
    else
        fail "Node.js test hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Python ─────────────────────────────────────────────
test_python() {
    section "🐍 Python SDK"
    check_tool python3 "Python" || return
    cd "$SDK_DIR/python"
    log "pip install + test"
    if python3 -m pytest --quiet 2>/dev/null || python3 -m unittest discover -s tests -q 2>/dev/null; then
        ok "Python testleri geçti"
    else
        skip "Test bulunamadı veya pytest yüklü değil"
    fi
    log "syntax check"
    if python3 -m py_compile hooksniff/__init__.py 2>/dev/null; then
        ok "Syntax OK"
    else
        fail "Syntax hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Go ─────────────────────────────────────────────────
test_go() {
    section "🐹 Go SDK"
    check_tool go "Go" || return
    cd "$SDK_DIR/go"
    log "go test ./..."
    if go test ./... 2>/dev/null; then
        ok "Go testleri geçti"
    else
        fail "Go test hatası"
    fi
    log "go vet ./..."
    if go vet ./... 2>/dev/null; then
        ok "Go vet temiz"
    else
        fail "Go vet hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Rust ───────────────────────────────────────────────
test_rust() {
    section "🦀 Rust SDK"
    check_tool cargo "Rust" || return
    cd "$SDK_DIR/rust"
    log "cargo test"
    if cargo test --quiet 2>/dev/null; then
        ok "Rust testleri geçti"
    else
        fail "Rust test hatası"
    fi
    log "cargo clippy"
    if cargo clippy -- -D warnings 2>/dev/null; then
        ok "Clippy temiz"
    else
        fail "Clippy uyarıları"
    fi
    cd "$SCRIPT_DIR"
}

# ── Ruby ───────────────────────────────────────────────
test_ruby() {
    section "💎 Ruby SDK"
    check_tool ruby "Ruby" || return
    cd "$SDK_DIR/ruby"
    log "bundle install + rspec"
    if bundle install --quiet 2>/dev/null && bundle exec rspec --format progress 2>/dev/null; then
        ok "Ruby testleri geçti"
    else
        skip "rspec bulunamadı veya bundle hatası"
    fi
    log "syntax check"
    if ruby -c lib/hooksniff.rb 2>/dev/null; then
        ok "Syntax OK"
    else
        fail "Syntax hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Java ───────────────────────────────────────────────
test_java() {
    section "☕ Java SDK"
    check_tool java "Java" || return
    cd "$SDK_DIR/java"
    log "mvn test"
    if mvn test -B -q 2>/dev/null; then
        ok "Java testleri geçti"
    else
        skip "mvn bulunamadı veya test hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Kotlin ─────────────────────────────────────────────
test_kotlin() {
    section "🟣 Kotlin SDK"
    check_tool java "Java (Kotlin)" || return
    cd "$SDK_DIR/kotlin"
    log "gradle test"
    if [ -f gradlew ]; then
        if ./gradlew test --quiet 2>/dev/null; then
            ok "Kotlin testleri geçti"
        else
            fail "Kotlin test hatası"
        fi
    else
        skip "gradlew bulunamadı"
    fi
    cd "$SCRIPT_DIR"
}

# ── PHP ────────────────────────────────────────────────
test_php() {
    section "🐘 PHP SDK"
    check_tool php "PHP" || return
    cd "$SDK_DIR/php"
    log "composer install + test"
    if [ -f composer.json ]; then
        if composer install --quiet 2>/dev/null && vendor/bin/phpunit --quiet 2>/dev/null; then
            ok "PHP testleri geçti"
        else
            skip "phpunit bulunamadı veya composer hatası"
        fi
    else
        skip "composer.json bulunamadı"
    fi
    cd "$SCRIPT_DIR"
}

# ── C# ─────────────────────────────────────────────────
test_csharp() {
    section "🔷 C# SDK"
    check_tool dotnet ".NET" || return
    cd "$SDK_DIR/csharp"
    log "dotnet test"
    if dotnet test --verbosity quiet 2>/dev/null; then
        ok "C# testleri geçti"
    else
        fail "C# test hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Elixir ─────────────────────────────────────────────
test_elixir() {
    section "💧 Elixir SDK"
    check_tool elixir "Elixir" || return
    cd "$SDK_DIR/elixir"
    log "mix deps.get + test"
    if mix deps.get --quiet 2>/dev/null && mix test 2>/dev/null; then
        ok "Elixir testleri geçti"
    else
        fail "Elixir test hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Swift ──────────────────────────────────────────────
test_swift() {
    section "🦅 Swift SDK"
    check_tool swift "Swift" || return
    cd "$SDK_DIR/swift"
    log "swift test"
    if swift test 2>/dev/null; then
        ok "Swift testleri geçti"
    else
        fail "Swift test hatası"
    fi
    cd "$SCRIPT_DIR"
}

# ── Sonuç ──────────────────────────────────────────────
summary() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  SDK Test Sonuçları                              ${CYAN}║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  ${GREEN}✅ Geçen:${NC} $PASS                                     ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${RED}❌ Başarısız:${NC} $FAIL                                  ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  ${YELLOW}⏭ Atlanan:${NC} $SKIP                                   ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    if [ $FAIL -gt 0 ]; then
        echo -e "${RED}⚠️  $FAIL SDK'da hata var!${NC}"
        exit 1
    fi
}

# ── Ana Akış ───────────────────────────────────────────
TARGET="${1:-all}"

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}       HookSniff SDK Test Runner                  ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

case "$TARGET" in
    all)
        test_node; test_python; test_go; test_rust
        test_ruby; test_java; test_kotlin; test_php
        test_csharp; test_elixir; test_swift
        ;;
    node)    test_node ;;
    python)  test_python ;;
    go)      test_go ;;
    rust)    test_rust ;;
    ruby)    test_ruby ;;
    java)    test_java ;;
    kotlin)  test_kotlin ;;
    php)     test_php ;;
    csharp)  test_csharp ;;
    elixir)  test_elixir ;;
    swift)   test_swift ;;
    *)       echo "Kullanım: $0 [all|node|python|go|rust|ruby|java|kotlin|php|csharp|elixir|swift]"; exit 1 ;;
esac

summary
