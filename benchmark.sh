#!/bin/bash
# ═══════════════════════════════════════════════════════════
# HookSniff SDK Performance Benchmark
# Kullanım: ./benchmark.sh [sdk-name|all]
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
warn() { echo -e "  ${YELLOW}⚠️${NC} $1"; }
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }

RESULTS_FILE="$SCRIPT_DIR/benchmark-results.md"

init_results() {
    echo "# HookSniff SDK Benchmark Results" > "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
    echo "Date: $(date)" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE}"
    echo "| SDK | File Count | Total Size | Install Size |" >> "$RESULTS_FILE"
    echo "|-----|-----------|------------|--------------|" >> "$RESULTS_FILE"
}

benchmark_sdk() {
    local name=$1
    local dir="$SDK_DIR/$name"
    
    if [ ! -d "$dir" ]; then
        warn "SDK not found: $name"
        return
    fi
    
    section "$name"
    
    # File count
    local file_count=$(find "$dir" -type f \( -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.rb" -o -name "*.java" -o -name "*.kt" -o -name "*.php" -o -name "*.cs" -o -name "*.ex" -o -name "*.swift" \) 2>/dev/null | wc -l)
    log "Source files: $file_count"
    
    # Total size
    local total_size=$(du -sh "$dir" 2>/dev/null | cut -f1)
    log "Total size: $total_size"
    
    # Line count
    local line_count=$(find "$dir" -type f \( -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.rb" -o -name "*.java" -o -name "*.kt" -o -name "*.php" -o -name "*.cs" -o -name "*.ex" -o -name "*.swift" \) -exec cat {} + 2>/dev/null | wc -l)
    log "Lines of code: $line_count"
    
    # Model count
    local model_count=0
    case $name in
        node)    model_count=$(grep -c "export interface" "$dir/src/generated/types.ts" 2>/dev/null || echo 0) ;;
        python)  model_count=$(grep -c "@dataclass" "$dir/hooksniff/models/generated/generated_models.py" 2>/dev/null || echo 0) ;;
        go)      model_count=$(grep -c "^type.*struct" "$dir/generated/generated_models.go" 2>/dev/null || echo 0) ;;
        rust)    model_count=$(grep -c "pub struct" "$dir/src/" -r 2>/dev/null || echo 0) ;;
        *)       model_count="N/A" ;;
    esac
    log "Models: $model_count"
    
    # Install size (node_modules, target, etc.)
    local install_size="N/A"
    if [ -d "$dir/node_modules" ]; then
        install_size=$(du -sh "$dir/node_modules" 2>/dev/null | cut -f1)
    elif [ -d "$dir/target" ]; then
        install_size=$(du -sh "$dir/target" 2>/dev/null | cut -f1)
    fi
    log "Install size: $install_size"
    
    # Add to results
    echo "| $name | $file_count | $total_size | $install_size |" >> "$RESULTS_FILE"
    
    ok "Benchmark complete"
}

# ── Ana Akış ───────────────────────────────────────────

echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  HookSniff SDK Benchmark                         ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"

init_results

TARGET="${1:-all}"

case "$TARGET" in
    all)
        for sdk in node python go rust ruby java kotlin php csharp elixir swift; do
            benchmark_sdk "$sdk"
        done
        ;;
    *) benchmark_sdk "$TARGET" ;;
esac

echo ""
echo -e "📊 Results saved to: ${CYAN}benchmark-results.md${NC}"
