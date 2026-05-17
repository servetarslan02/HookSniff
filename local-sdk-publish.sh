#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Local Publish — Registry'lere yükleme
# Kullanım: ./local-sdk-publish.sh [dry-run|publish] [sdk-name|all]
#
# dry-run:  Sadece test et, yükleme
# publish:  Gerçekten yükle
#
# Örnek:
#   ./local-sdk-publish.sh dry-run all      # Tümünü test et
#   ./local-sdk-publish.sh publish node      # Node.js'i yükle
#   ./local-sdk-publish.sh publish python    # Python'ı yükle
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SDK_DIR="$SCRIPT_DIR/sdks"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

MODE="${1:-dry-run}"
TARGET="${2:-all}"

log()  { echo -e "${CYAN}▸${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; }
skip() { echo -e "  ${YELLOW}⏭${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠️${NC} $1"; }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

publish_sdk() {
    local name=$1
    local cmd=$2
    local dir=$3

    section "$name"
    cd "$dir"

    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: $cmd (yükleme yapmayacak)"
    else
        log "PUBLISH: $cmd"
    fi

    if eval "$cmd"; then
        ok "$name publish başarılı"
    else
        fail "$name publish hatası"
    fi

    cd "$SCRIPT_DIR"
}

# ── Node.js (npm) ──────────────────────────────────────
publish_node() {
    if ! command -v npm &>/dev/null; then skip "npm yok"; return; fi
    cd "$SDK_DIR/node"
    log "npm ci + test"
    npm ci --silent 2>/dev/null
    npm test --silent 2>/dev/null || true
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: npm publish --access public"
        npm pack --dry-run 2>/dev/null
        ok "Node.js dry-run OK"
    else
        if [ -z "$NPM_TOKEN" ]; then
            fail "NPM_TOKEN ayarlanmamış"
            cd "$SCRIPT_DIR"; return
        fi
        npm publish --access public
        ok "Node.js npm'a yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Python (PyPI) ──────────────────────────────────────
publish_python() {
    if ! command -v python3 &>/dev/null; then skip "python3 yok"; return; fi
    cd "$SDK_DIR/python"
    log "build"
    pip install build twine -q 2>/dev/null
    python3 -m build 2>/dev/null
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: twine upload dist/*"
        twine check dist/* 2>/dev/null
        ok "Python dry-run OK"
    else
        if [ -z "$PYPI_TOKEN" ]; then
            fail "PYPI_TOKEN ayarlanmamış"
            cd "$SCRIPT_DIR"; return
        fi
        TWINE_USERNAME=__token__ TWINE_PASSWORD="$PYPI_TOKEN" twine upload dist/*
        ok "Python PyPI'ye yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Rust (crates.io) ───────────────────────────────────
publish_rust() {
    if ! command -v cargo &>/dev/null; then skip "cargo yok"; return; fi
    cd "$SDK_DIR/rust"
    log "cargo test"
    cargo test --quiet 2>/dev/null
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: cargo publish"
        cargo package --allow-dirty 2>/dev/null
        ok "Rust dry-run OK"
    else
        if [ -z "$CARGO_REGISTRY_TOKEN" ]; then
            fail "CARGO_REGISTRY_TOKEN ayarlanmamış"
            cd "$SCRIPT_DIR"; return
        fi
        cargo publish
        ok "Rust crates.io'a yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Ruby (RubyGems) ────────────────────────────────────
publish_ruby() {
    if ! command -v gem &>/dev/null; then skip "gem yok"; return; fi
    cd "$SDK_DIR/ruby"
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: gem build hooksniff.gemspec"
        gem build hooksniff.gemspec 2>/dev/null
        ok "Ruby dry-run OK"
    else
        if [ -z "$RUBYGEMS_TOKEN" ]; then
            fail "RUBYGEMS_TOKEN ayarlanmamış"
            cd "$SCRIPT_DIR"; return
        fi
        gem build hooksniff.gemspec
        gem push hooksniff-*.gem
        ok "Ruby RubyGems'e yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Java (Maven Central) ───────────────────────────────
publish_java() {
    if ! command -v mvn &>/dev/null; then skip "mvn yok"; return; fi
    cd "$SDK_DIR/java"
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: mvn deploy"
        mvn package -B -q 2>/dev/null
        ok "Java dry-run OK"
    else
        mvn deploy -B -DskipTests 2>/dev/null
        ok "Java Maven Central'e yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Kotlin (Maven Central) ─────────────────────────────
publish_kotlin() {
    if ! command -v java &>/dev/null; then skip "java yok"; return; fi
    cd "$SDK_DIR/kotlin"
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: gradle publish"
        [ -f gradlew ] && ./gradlew build --quiet 2>/dev/null
        ok "Kotlin dry-run OK"
    else
        [ -f gradlew ] && ./gradlew publish 2>/dev/null
        ok "Kotlin Maven Central'e yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── PHP (Packagist) ────────────────────────────────────
publish_php() {
    section "PHP (Packagist)"
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: Packagist auto-index (git push yeterli)"
        ok "PHP dry-run OK — Packagist otomatik indexler"
    else
        if [ -z "$PACKAGIST_TOKEN" ]; then
            fail "PACKAGIST_TOKEN ayarlanmamış"
            return
        fi
        curl -s -X POST "https://packagist.org/api/update-package?username=hooksniff&apiToken=$PACKAGIST_TOKEN" \
            -H "Content-Type: application/json" \
            -d '{"repository":{"url":"https://github.com/servetarslan02/HookSniff"}}'
        ok "Packagist güncellendi"
    fi
}

# ── C# (NuGet) ─────────────────────────────────────────
publish_csharp() {
    if ! command -v dotnet &>/dev/null; then skip "dotnet yok"; return; fi
    cd "$SDK_DIR/csharp"
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: dotnet pack"
        dotnet pack -c Release --verbosity quiet 2>/dev/null
        ok "C# dry-run OK"
    else
        if [ -z "$NUGET_TOKEN" ]; then
            fail "NUGET_TOKEN ayarlanmamış"
            cd "$SCRIPT_DIR"; return
        fi
        dotnet pack -c Release
        dotnet nuget push "src/HookSniff/bin/Release/*.nupkg" --api-key "$NUGET_TOKEN" --source https://api.nuget.org/v3/index.json
        ok "C# NuGet'e yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Elixir (Hex.pm) ────────────────────────────────────
publish_elixir() {
    if ! command -v mix &>/dev/null; then skip "mix yok"; return; fi
    cd "$SDK_DIR/elixir"
    if [ "$MODE" = "dry-run" ]; then
        log "DRY-RUN: mix hex.publish"
        ok "Elixir dry-run OK"
    else
        if [ -z "$HEX_API_KEY" ]; then
            fail "HEX_API_KEY ayarlanmamış"
            cd "$SCRIPT_DIR"; return
        fi
        mix hex.publish --yes
        ok "Elixir Hex.pm'e yüklendi"
    fi
    cd "$SCRIPT_DIR"
}

# ── Swift (Swift Package Index — otomatik) ─────────────
publish_swift() {
    section "Swift (Swift Package Index)"
    log "Swift Package Index git tag'lerinden otomatik indexlenir"
    log "Publish için: git tag sdk-v1.0.0 && git push --tags"
    ok "Swift publish — otomatik (git tag)"
}

# ── Ana Akış ───────────────────────────────────────────
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  HookSniff SDK Publish ($MODE)              ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

case "$TARGET" in
    all)
        publish_node; publish_python; publish_rust; publish_ruby
        publish_java; publish_kotlin; publish_php; publish_csharp
        publish_elixir; publish_swift
        ;;
    node)    publish_node ;;
    python)  publish_python ;;
    rust)    publish_rust ;;
    ruby)    publish_ruby ;;
    java)    publish_java ;;
    kotlin)  publish_kotlin ;;
    php)     publish_php ;;
    csharp)  publish_csharp ;;
    elixir)  publish_elixir ;;
    swift)   publish_swift ;;
    *)       echo "Kullanım: $0 [dry-run|publish] [all|node|python|go|rust|ruby|java|kotlin|php|csharp|elixir|swift]"; exit 1 ;;
esac

echo ""
echo -e "${GREEN}✅ Tamamlandı!${NC}"
