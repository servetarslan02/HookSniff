#!/usr/bin/env bash
# Generate test coverage report using cargo-tarpaulin.
#
# Usage:
#   ./scripts/coverage.sh          # HTML report (opens in browser)
#   ./scripts/coverage.sh --xml    # Cobertura XML (for CI)
#   ./scripts/coverage.sh --text   # Terminal summary only
#
# Requires: cargo-tarpaulin  (cargo install cargo-tarpaulin)

set -euo pipefail

cd "$(dirname "$0")/.."

FORMAT="${1:---html}"

echo "📊 Running coverage analysis..."
echo ""

case "$FORMAT" in
  --html)
    echo "→ Generating HTML report..."
    cargo tarpaulin \
      --workspace \
      --skip-clean \
      --out Html \
      --output-dir coverage/ \
      --timeout 300
    echo ""
    echo "✅ Coverage report: coverage/tarpaulin-report.html"
    ;;
  --xml)
    echo "→ Generating Cobertura XML..."
    cargo tarpaulin \
      --workspace \
      --skip-clean \
      --out Xml \
      --output-dir coverage/ \
      --timeout 300
    echo ""
    echo "✅ Coverage report: coverage/cobertura.xml"
    ;;
  --text)
    echo "→ Running coverage (text summary)..."
    cargo tarpaulin \
      --workspace \
      --skip-clean \
      --timeout 300
    ;;
  *)
    echo "Unknown format: $FORMAT"
    echo "Usage: $0 [--html|--xml|--text]"
    exit 1
    ;;
esac
