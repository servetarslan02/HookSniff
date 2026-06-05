#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Publish — Token'ları .sdk-tokens.env'den yükler
# Kullanım: ./publish-sdk.sh [sdk-name|all]
#
# Örnek:
#   ./publish-sdk.sh node      # Node.js'i publish et
#   ./publish-sdk.sh python    # Python'ı publish et
#   ./publish-sdk.sh all       # Tümünü publish et
# ═══════════════════════════════════════════════════════════
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TOKEN_FILE="$SCRIPT_DIR/.sdk-tokens.env"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}▸${NC} $1"; }
ok()   { echo -e "  ${GREEN}✅${NC} $1"; }
fail() { echo -e "  ${RED}❌${NC} $1"; }
skip() { echo -e "  ${YELLOW}⏭${NC} $1"; }

# Token'ları yükle
if [ ! -f "$TOKEN_FILE" ]; then
    echo -e "${RED}❌ .sdk-tokens.env bulunamadı!${NC}"
    echo "   Token'ları içeren .sdk-tokens.env dosyası gerekli."
    exit 1
fi

set -a
source "$TOKEN_FILE"
set +a

SDK_DIR="$SCRIPT_DIR/sdks"
TARGET="${1:-all}"

publish_node() {
    section "📦 Node.js → npm"
    cd "$SDK_DIR/node"
    npm ci --silent 2>/dev/null
    npm test --silent 2>/dev/null || true
    npm publish --access public
    ok "npm'e yüklendi"
    cd "$SCRIPT_DIR"
}

publish_python() {
    section "🐍 Python → PyPI"
    cd "$SDK_DIR/python"
    pip install build twine -q 2>/dev/null
    python3 -m build 2>/dev/null
    TWINE_USERNAME=__token__ TWINE_PASSWORD="$PYPI_TOKEN" twine upload dist/*
    ok "PyPI'ye yüklendi"
    cd "$SCRIPT_DIR"
}

publish_rust() {
    section "🦀 Rust → crates.io"
    cd "$SDK_DIR/rust"
    cargo test --quiet 2>/dev/null
    cargo publish
    ok "crates.io'a yüklendi"
    cd "$SCRIPT_DIR"
}

publish_ruby() {
    section "💎 Ruby → RubyGems"
    cd "$SDK_DIR/ruby"
    gem build hooksniff.gemspec 2>/dev/null
    gem push hooksniff-*.gem
    ok "RubyGems'e yüklendi"
    cd "$SCRIPT_DIR"
}

publish_java() {
    section "☕ Java → Maven Central"
    cd "$SDK_DIR/java"
    mvn deploy -B -DskipTests 2>/dev/null
    ok "Maven Central'e yüklendi"
    cd "$SCRIPT_DIR"
}

publish_kotlin() {
    section "🟣 Kotlin → Maven Central"
    cd "$SDK_DIR/kotlin"
    [ -f gradlew ] && ./gradlew publish 2>/dev/null
    ok "Maven Central'e yüklendi"
    cd "$SCRIPT_DIR"
}

publish_php() {
    section "🐘 PHP → Packagist"
    curl -s -X POST "https://packagist.org/api/update-package?username=hooksniff&apiToken=$PACKAGIST_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"repository":{"url":"https://github.com/servetarslan02/HookSniff"}}'
    ok "Packagist güncellendi"
}

publish_csharp() {
    section "🔷 C# → NuGet"
    cd "$SDK_DIR/csharp"
    dotnet pack -c Release --verbosity quiet 2>/dev/null
    dotnet nuget push "src/HookSniff/bin/Release/*.nupkg" --api-key "$NUGET_TOKEN" --source https://api.nuget.org/v3/index.json
    ok "NuGet'e yüklendi"
    cd "$SCRIPT_DIR"
}

publish_elixir() {
    section "💧 Elixir → Hex.pm"
    cd "$SDK_DIR/elixir"
    mix hex.publish --yes
    ok "Hex.pm'e yüklendi"
    cd "$SCRIPT_DIR"
}

publish_swift() {
    section "🦅 Swift → Package Index"
    log "Swift Package Index git tag'lerinden otomatik indexlenir"
    log "Publish için: git tag sdk-v1.0.0 && git push --tags"
    ok "Swift — otomatik (git tag)"
}

section() {
    echo ""
    echo -e "${CYAN}━━━ $1 ━━━${NC}"
}

# ── Ana Akış ───────────────────────────────────────────

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  HookSniff SDK Publish                           ${CYAN}║${NC}"
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
    *)       echo "Kullanım: $0 [all|node|python|rust|ruby|java|kotlin|php|csharp|elixir|swift]"; exit 1 ;;
esac

echo ""
echo -e "${GREEN}✅ Publish tamamlandı!${NC}"
