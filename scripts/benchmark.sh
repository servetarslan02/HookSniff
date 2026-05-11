#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — Benchmark Runner
# ──────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

export PATH="$HOME/.cargo/bin:$PATH"

cd "$PROJECT_ROOT/api"

echo "🪝 HookSniff — Running API Benchmarks"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

case "${1:-all}" in
    all)
        echo "Running all benchmarks..."
        cargo bench --bench api_benchmarks
        ;;
    quick)
        echo "Running quick benchmarks (fewer samples)..."
        cargo bench --bench api_benchmarks -- --quick
        ;;
    report)
        echo "Running benchmarks with HTML report..."
        cargo bench --bench api_benchmarks
        echo ""
        echo "📊 HTML report generated at:"
        echo "   api/target/criterion/report/index.html"
        ;;
    list)
        echo "Listing available benchmarks..."
        cargo bench --bench api_benchmarks -- --list
        ;;
    *)
        echo "Usage: $0 [all|quick|report|list]"
        echo ""
        echo "  all     - Run all benchmarks (default)"
        echo "  quick   - Run with fewer samples (faster)"
        echo "  report  - Run and generate HTML report"
        echo "  list    - List available benchmarks"
        exit 1
        ;;
esac

echo ""
echo "✅ Benchmarks complete."
