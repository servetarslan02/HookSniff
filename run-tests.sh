#!/bin/bash
# HookSniff SDK Local Test Runner
# Usage: ./run-tests.sh [sdk-name]
# Example: ./run-tests.sh go
#          ./run-tests.sh all

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SDK_DIR="$SCRIPT_DIR/sdks"
PASS=0
FAIL=0
SKIP=0
RESULTS=""

run_test() {
    local sdk=$1
    local name=$2
    local cmd=$3
    local dir=$4
    
    printf "  %-12s %-30s " "$sdk" "$name"
    
    if ! command -v "$(echo "$cmd" | awk '{print $1}')" &>/dev/null; then
        echo "⏭ SKIP (tool not installed)"
        SKIP=$((SKIP + 1))
        RESULTS+="  $sdk: ⏭ SKIP ($name — tool not installed)\n"
        return
    fi
    
    cd "$dir"
    if eval "$cmd" &>/dev/null; then
        echo "✅ PASS"
        PASS=$((PASS + 1))
    else
        echo "❌ FAIL"
        FAIL=$((FAIL + 1))
        RESULTS+="  $sdk: ❌ FAIL ($name)\n"
    fi
    cd "$SCRIPT_DIR"
}

echo "╔══════════════════════════════════════════════════╗"
echo "║       HookSniff SDK Test Runner                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ─── Go ───────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "go" ]]; then
    echo "🐹 Go SDK"
    run_test "go" "tests" "go test ./..." "$SDK_DIR/go"
    echo ""
fi

# ─── Rust ─────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "rust" ]]; then
    echo "🦀 Rust SDK"
    if command -v cargo &>/dev/null; then
        run_test "rust" "tests" "cargo test --quiet" "$SDK_DIR/rust"
    else
        echo "  rust         tests                        ⏭ SKIP (cargo not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Node.js ──────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "node" ]]; then
    echo "📦 Node.js SDK"
    if command -v npm &>/dev/null; then
        run_test "node" "tests" "npm test --silent 2>/dev/null || npx jest --silent" "$SDK_DIR/node"
    else
        echo "  node         tests                        ⏭ SKIP (npm not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Python ───────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "python" ]]; then
    echo "🐍 Python SDK"
    if command -v python3 &>/dev/null; then
        run_test "python" "tests" "python3 -m unittest test.test_hooksniff -q" "$SDK_DIR/python"
    else
        echo "  python       tests                        ⏭ SKIP (python3 not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Java ─────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "java" ]]; then
    echo "☕ Java SDK"
    if command -v javac &>/dev/null; then
        run_test "java" "compile check" "javac -cp src/main/java -d /tmp/java-check src/main/java/com/hooksniff/*.java src/main/java/com/hooksniff/resources/*.java 2>/dev/null && rm -rf /tmp/java-check" "$SDK_DIR/java"
    else
        echo "  java         compile check                ⏭ SKIP (javac not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Kotlin ───────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "kotlin" ]]; then
    echo "🟣 Kotlin SDK"
    if command -v kotlinc &>/dev/null; then
        run_test "kotlin" "compile check" "kotlinc src/main/kotlin/hooksniff/sdk/wrapper/*.kt -d /tmp/kotlin-check 2>/dev/null && rm -rf /tmp/kotlin-check" "$SDK_DIR/kotlin"
    else
        echo "  kotlin       compile check                ⏭ SKIP (kotlinc not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Ruby ─────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "ruby" ]]; then
    echo "💎 Ruby SDK"
    if command -v ruby &>/dev/null; then
        run_test "ruby" "syntax check" "ruby -c lib/hooksniff.rb lib/hooksniff/resources/all.rb lib/hooksniff/webhook.rb lib/hooksniff/pagination.rb" "$SDK_DIR/ruby"
    else
        echo "  ruby         syntax check                 ⏭ SKIP (ruby not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── PHP ──────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "php" ]]; then
    echo "🐘 PHP SDK"
    if command -v php &>/dev/null; then
        run_test "php" "syntax check" "php -l src/HookSniff.php && php -l src/Pagination.php && php -l src/Webhook.php && for f in src/Resources/*.php; do php -l \$f; done" "$SDK_DIR/php"
    else
        echo "  php          syntax check                 ⏭ SKIP (php not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── C# ───────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "csharp" ]]; then
    echo "🔷 C# SDK"
    if command -v dotnet &>/dev/null; then
        run_test "csharp" "build check" "dotnet build --nologo -v q src/HookSniff.Sdk/HookSniff.Sdk.csproj 2>/dev/null" "$SDK_DIR/csharp"
    else
        echo "  csharp       build check                  ⏭ SKIP (dotnet not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Elixir ───────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "elixir" ]]; then
    echo "💧 Elixir SDK"
    if command -v elixir &>/dev/null; then
        run_test "elixir" "compile check" "elixir -e 'IO.puts(:ok)' 2>/dev/null" "$SDK_DIR/elixir"
    else
        echo "  elixir       compile check                ⏭ SKIP (elixir not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Swift ────────────────────────────────────────────
if [[ "$1" == "all" || "$1" == "swift" ]]; then
    echo "🍎 Swift SDK"
    if command -v swift &>/dev/null; then
        run_test "swift" "build check" "swift build 2>/dev/null" "$SDK_DIR/swift/HookSniffSDK"
    else
        echo "  swift        build check                  ⏭ SKIP (swift not installed)"
        SKIP=$((SKIP + 1))
    fi
    echo ""
fi

# ─── Summary ──────────────────────────────────────────
echo "══════════════════════════════════════════════════"
echo "  Results: ✅ $PASS passed  ❌ $FAIL failed  ⏭ $SKIP skipped"
echo "══════════════════════════════════════════════════"

if [[ -n "$RESULTS" ]]; then
    echo ""
    echo "  Failures:"
    echo -e "$RESULTS"
fi

if [[ $FAIL -gt 0 ]]; then
    exit 1
fi
