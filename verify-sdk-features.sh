#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Feature Verification
# Tüm yeni feature'ları doğrular: WebhookEvent, ResponseMetadata, Config, Debug
# Kullanım: ./verify-sdk-features.sh [sdk-name|all]
# ═══════════════════════════════════════════════════════════
set -e

WORKSPACE="/root/.openclaw/workspace"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
SKIP=0
RESULTS=""

ok()   { echo -e "  ${GREEN}✅${NC} $1"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}❌${NC} $1"; FAIL=$((FAIL+1)); RESULTS+="  ❌ $1\n"; }
skip() { echo -e "  ${YELLOW}⏭${NC} $1"; SKIP=$((SKIP+1)); }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

# ═══════════════════════════════════════════════════════════
# Node.js (TypeScript)
# ═══════════════════════════════════════════════════════════
verify_node() {
    section "Node.js (TypeScript)"
    local dir="$WORKSPACE/hooksniff-node"
    
    # TypeScript compile check
    if command -v npx &>/dev/null; then
        cd "$dir"
        if npx tsc --noEmit 2>/dev/null; then
            ok "TypeScript compile — geçti"
        else
            fail "TypeScript compile — hata var"
        fi
    else
        skip "npx bulunamadı"
    fi
    
    # Check files exist
    for f in src/webhook.ts src/webhook-events.ts src/util.ts src/request.ts; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    # Check features in code
    if grep -q "ResponseMetadata" "$dir/src/util.ts" 2>/dev/null; then
        ok "ResponseMetadata type tanımlı"
    else
        fail "ResponseMetadata type eksik"
    fi
    
    if grep -q "lastResponse" "$dir/src/index.ts" 2>/dev/null; then
        ok "lastResponse getter mevcut"
    else
        fail "lastResponse getter eksik"
    fi
    
    if grep -q "headers.*Record" "$dir/src/index.ts" 2>/dev/null; then
        ok "customHeaders config mevcut"
    else
        fail "customHeaders config eksik"
    fi
    
    if grep -q "ctx.debug" "$dir/src/request.ts" 2>/dev/null; then
        ok "Debug logging mevcut"
    else
        fail "Debug logging eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Python
# ═══════════════════════════════════════════════════════════
verify_python() {
    section "Python"
    local dir="$WORKSPACE/hooksniff-python"
    
    if command -v python3 &>/dev/null; then
        cd "$dir"
        
        # Import check
        if python3 -c "
from hooksniff import HookSniff, Webhook, WebhookEvent, ResponseMetadata
from hooksniff.webhook_events import parse_webhook_event
from hooksniff.api.common import ResponseMetadata as RM
from hooksniff.api.hooksniff import HookSniffOptions
print('OK')
" 2>/dev/null; then
            ok "Tüm import'lar çalışıyor"
        else
            fail "Import hatası"
        fi
        
        # WebhookEvent test
        if python3 -c "
from hooksniff.webhook_events import parse_webhook_event
e = parse_webhook_event({'event': 'test', 'data': {'x': 1}, 'timestamp': '2026-01-01'})
assert e.event == 'test'
assert e.data == {'x': 1}
assert e.timestamp == '2026-01-01'
print('OK')
" 2>/dev/null; then
            ok "WebhookEvent parse çalışıyor"
        else
            fail "WebhookEvent parse hatası"
        fi
        
        # ResponseMetadata test
        if python3 -c "
from hooksniff.api.common import ResponseMetadata
rm = ResponseMetadata(status_code=200, request_id='req_123', rate_limit_remaining=99)
assert rm.status_code == 200
assert rm.request_id == 'req_123'
print('OK')
" 2>/dev/null; then
            ok "ResponseMetadata çalışıyor"
        else
            fail "ResponseMetadata hatası"
        fi
        
        # Config test
        if python3 -c "
from hooksniff.api.hooksniff import HookSniffOptions
opts = HookSniffOptions(debug=True, headers={'X-Test': 'val'}, timeout=60.0)
assert opts.debug == True
assert opts.headers == {'X-Test': 'val'}
print('OK')
" 2>/dev/null; then
            ok "Config options çalışıyor"
        else
            fail "Config options hatası"
        fi
    else
        skip "python3 bulunamadı"
    fi
    
    # File checks
    for f in hooksniff/webhook_events.py hooksniff/api/common.py hooksniff/__init__.py; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
}

# ═══════════════════════════════════════════════════════════
# Go
# ═══════════════════════════════════════════════════════════
verify_go() {
    section "Go"
    local dir="$WORKSPACE/hooksniff-go"
    
    for f in webhook_event.go response_metadata.go; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    # Check struct definitions
    if grep -q "type WebhookEvent struct" "$dir/webhook_event.go" 2>/dev/null; then
        ok "WebhookEvent struct tanımlı"
    else
        fail "WebhookEvent struct eksik"
    fi
    
    if grep -q "type ResponseMetadata struct" "$dir/response_metadata.go" 2>/dev/null; then
        ok "ResponseMetadata struct tanımlı"
    else
        fail "ResponseMetadata struct eksik"
    fi
    
    if grep -q "func.*VerifyAndParse" "$dir/webhook_event.go" 2>/dev/null; then
        ok "VerifyAndParse method mevcut"
    else
        fail "VerifyAndParse method eksik"
    fi
    
    if grep -q "LastResponse" "$dir/internal/svix_http_client.go" 2>/dev/null; then
        ok "LastResponse field mevcut"
    else
        fail "LastResponse field eksik"
    fi
    
    if grep -q "Debug" "$dir/internal/svix_http_client.go" 2>/dev/null; then
        ok "Debug logging mevcut"
    else
        fail "Debug logging eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Rust
# ═══════════════════════════════════════════════════════════
verify_rust() {
    section "Rust"
    local dir="$WORKSPACE/hooksniff-rust"
    
    for f in src/webhook_event.rs src/response_metadata.rs src/config.rs; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    # Check lib.rs has new modules
    local modules=("webhook_event" "response_metadata" "config")
    for mod in "${modules[@]}"; do
        if grep -q "pub mod $mod" "$dir/src/lib.rs" 2>/dev/null; then
            ok "Modül tanımlı: $mod"
        else
            fail "Modül eksik: $mod"
        fi
    done
    
    if grep -q "pub struct WebhookEvent" "$dir/src/webhook_event.rs" 2>/dev/null; then
        ok "WebhookEvent struct tanımlı"
    else
        fail "WebhookEvent struct eksik"
    fi
    
    if grep -q "pub struct ResponseMetadata" "$dir/src/response_metadata.rs" 2>/dev/null; then
        ok "ResponseMetadata struct tanımlı"
    else
        fail "ResponseMetadata struct eksik"
    fi
    
    if grep -q "pub struct HookSniffConfig" "$dir/src/config.rs" 2>/dev/null; then
        ok "HookSniffConfig struct tanımlı"
    else
        fail "HookSniffConfig struct eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Ruby
# ═══════════════════════════════════════════════════════════
verify_ruby() {
    section "Ruby"
    local dir="$WORKSPACE/hooksniff-ruby"
    
    for f in lib/hooksniff/webhook_event.rb lib/hooksniff/response_metadata.rb lib/hooksniff/options.rb; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    # Check requires in hooksniff.rb
    local requires=("webhook_event" "response_metadata" "options")
    for req in "${requires[@]}"; do
        if grep -q "require.*$req" "$dir/lib/hooksniff.rb" 2>/dev/null; then
            ok "Require mevcut: $req"
        else
            fail "Require eksik: $req"
        fi
    done
    
    if grep -q "class WebhookEvent" "$dir/lib/hooksniff/webhook_event.rb" 2>/dev/null; then
        ok "WebhookEvent class tanımlı"
    else
        fail "WebhookEvent class eksik"
    fi
    
    if grep -q "class ResponseMetadata" "$dir/lib/hooksniff/response_metadata.rb" 2>/dev/null; then
        ok "ResponseMetadata class tanımlı"
    else
        fail "ResponseMetadata class eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Java
# ═══════════════════════════════════════════════════════════
verify_java() {
    section "Java"
    local dir="$WORKSPACE/hooksniff-java/lib/src/main/java/com/hooksniff"
    
    for f in WebhookEvent.java ResponseMetadata.java HookSniffOptions.java; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    if grep -q "class WebhookEvent" "$dir/WebhookEvent.java" 2>/dev/null; then
        ok "WebhookEvent class tanımlı"
    else
        fail "WebhookEvent class eksik"
    fi
    
    if grep -q "verifyAndParse" "$dir/WebhookBase.java" 2>/dev/null; then
        ok "verifyAndParse method mevcut"
    else
        fail "verifyAndParse method eksik"
    fi
    
    if grep -q "timeoutMs" "$dir/HookSniffOptions.java" 2>/dev/null; then
        ok "timeoutMs config mevcut"
    else
        fail "timeoutMs config eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Kotlin
# ═══════════════════════════════════════════════════════════
verify_kotlin() {
    section "Kotlin"
    local dir="$WORKSPACE/hooksniff-kotlin/lib/src/main/kotlin"
    
    for f in WebhookEvent.kt ResponseMetadata.kt HookSniffOptions.kt; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    if grep -q "data class WebhookEvent" "$dir/WebhookEvent.kt" 2>/dev/null; then
        ok "WebhookEvent data class tanımlı"
    else
        fail "WebhookEvent data class eksik"
    fi
    
    if grep -q "verifyAndParse" "$dir/Webhook.kt" 2>/dev/null; then
        ok "verifyAndParse method mevcut"
    else
        fail "verifyAndParse method eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# PHP
# ═══════════════════════════════════════════════════════════
verify_php() {
    section "PHP"
    local dir="$WORKSPACE/hooksniff-php/src"
    
    for f in WebhookEvent.php ResponseMetadata.php HookSniffOptions.php; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    if grep -q "class WebhookEvent" "$dir/WebhookEvent.php" 2>/dev/null; then
        ok "WebhookEvent class tanımlı"
    else
        fail "WebhookEvent class eksik"
    fi
    
    if grep -q "class ResponseMetadata" "$dir/ResponseMetadata.php" 2>/dev/null; then
        ok "ResponseMetadata class tanımlı"
    else
        fail "ResponseMetadata class eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# C#
# ═══════════════════════════════════════════════════════════
verify_csharp() {
    section "C#"
    local dir="$WORKSPACE/hooksniff-csharp/HookSniff"
    
    for f in WebhookEvent.cs ResponseMetadata.cs HookSniffOptions.cs; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    if grep -q "class WebhookEvent" "$dir/WebhookEvent.cs" 2>/dev/null; then
        ok "WebhookEvent class tanımlı"
    else
        fail "WebhookEvent class eksik"
    fi
    
    if grep -q "VerifyAndParse" "$dir/Webhook.cs" 2>/dev/null; then
        ok "VerifyAndParse method mevcut"
    else
        fail "VerifyAndParse method eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Swift
# ═══════════════════════════════════════════════════════════
verify_swift() {
    section "Swift"
    local dir="$WORKSPACE/hooksniff-swift/HookSniffSDK/Sources/HookSniff"
    
    for f in WebhookEvent.swift ResponseMetadata.swift; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    if grep -q "struct WebhookEvent" "$dir/WebhookEvent.swift" 2>/dev/null; then
        ok "WebhookEvent struct tanımlı"
    else
        fail "WebhookEvent struct eksik"
    fi
    
    if grep -q "struct ResponseMetadata" "$dir/ResponseMetadata.swift" 2>/dev/null; then
        ok "ResponseMetadata struct tanımlı"
    else
        fail "ResponseMetadata struct eksik"
    fi
    
    if grep -q "debug" "$dir/HookSniff.swift" 2>/dev/null; then
        ok "Debug config mevcut"
    else
        fail "Debug config eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Elixir
# ═══════════════════════════════════════════════════════════
verify_elixir() {
    section "Elixir"
    local dir="$WORKSPACE/hooksniff-elixir/lib/hooksniff"
    
    for f in webhook_event.ex response_metadata.ex config.ex; do
        if [ -f "$dir/$f" ]; then
            ok "Dosya mevcut: $f"
        else
            fail "Dosya eksik: $f"
        fi
    done
    
    if grep -q "defmodule HookSniff.WebhookEvent" "$dir/webhook_event.ex" 2>/dev/null; then
        ok "WebhookEvent module tanımlı"
    else
        fail "WebhookEvent module eksik"
    fi
    
    if grep -q "defmodule HookSniff.ResponseMetadata" "$dir/response_metadata.ex" 2>/dev/null; then
        ok "ResponseMetadata module tanımlı"
    else
        fail "ResponseMetadata module eksik"
    fi
    
    if grep -q "defmodule HookSniff.Config" "$dir/config.ex" 2>/dev/null; then
        ok "Config module tanımlı"
    else
        fail "Config module eksik"
    fi
}

# ═══════════════════════════════════════════════════════════
# Git Status
# ═══════════════════════════════════════════════════════════
verify_git() {
    section "Git Status"
    
    local repos="hooksniff-node hooksniff-python hooksniff-go hooksniff-rust hooksniff-ruby hooksniff-java hooksniff-kotlin hooksniff-php hooksniff-csharp hooksniff-swift hooksniff-elixir HookSniff"
    
    for repo in $repos; do
        cd "$WORKSPACE/$repo"
        local status=$(git status --porcelain 2>/dev/null)
        local author=$(git log -1 --format='%ae' 2>/dev/null)
        
        if [ -z "$status" ]; then
            if [ "$author" = "servetarslan02@gmail.com" ]; then
                ok "$repo — clean + correct email"
            else
                fail "$repo — wrong author email: $author"
            fi
        else
            fail "$repo — uncommitted changes"
        fi
    done
}

# ═══════════════════════════════════════════════════════════
# Ana Akış
# ═══════════════════════════════════════════════════════════
case "${1:-all}" in
    node)     verify_node ;;
    python)   verify_python ;;
    go)       verify_go ;;
    rust)     verify_rust ;;
    ruby)     verify_ruby ;;
    java)     verify_java ;;
    kotlin)   verify_kotlin ;;
    php)      verify_php ;;
    csharp)   verify_csharp ;;
    swift)    verify_swift ;;
    elixir)   verify_elixir ;;
    git)      verify_git ;;
    all)
        verify_node
        verify_python
        verify_go
        verify_rust
        verify_ruby
        verify_java
        verify_kotlin
        verify_php
        verify_csharp
        verify_swift
        verify_elixir
        verify_git
        ;;
    *)
        echo "Kullanım: $0 [node|python|go|rust|ruby|java|kotlin|php|csharp|swift|elixir|git|all]"
        exit 1
        ;;
esac

# ── Sonuç ──────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  SDK Feature Verification Sonuçları              ${CYAN}║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}✅ Geçen:${NC} $PASS                                     ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${RED}❌ Başarısız:${NC} $FAIL                                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${YELLOW}⏭ Atlanan:${NC} $SKIP                                   ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

if [ -n "$RESULTS" ]; then
    echo ""
    echo -e "${RED}Başarısız olanlar:${NC}"
    echo -e "$RESULTS"
fi

echo ""
if [ $FAIL -gt 0 ]; then
    echo -e "${RED}⚠️  $FAIL hata var — düzeltmeden devam etmeyin!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Tüm kontroller geçti — yayına hazır!${NC}"
    exit 0
fi
