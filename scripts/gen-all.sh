#!/bin/bash
export JAVA_HOME=/tmp/jdk-17.0.12
export PATH=$JAVA_HOME/bin:$PATH
SPEC="docs/openapi.yaml"
FLAGS="--skip-validate-spec"

generate() {
  local lang=$1 gen=$2 pkg=$3 extra=$4
  echo "[$(date +%H:%M:%S)] Generating $lang..."
  npx @openapitools/openapi-generator-cli generate -i "$SPEC" -g "$gen" -o "sdks/$lang" --package-name "$pkg" $extra $FLAGS 2>&1 | grep -c "ERROR" | xargs -I{} echo "  $lang: {} errors"
  echo "[$(date +%H:%M:%S)] $lang done: $(find sdks/$lang -type f \( -name '*.ts' -o -name '*.py' -o -name '*.go' -o -name '*.rs' -o -name '*.rb' -o -name '*.java' -o -name '*.kt' -o -name '*.php' -o -name '*.cs' -o -name '*.ex' -o -name '*.exs' -o -name '*.swift' \) 2>/dev/null | wc -l) source files"
}

generate "node"     "typescript-node" "hooksniff"  "--additional-properties=npmName=@hooksniff/sdk,npmVersion=0.3.0" &
generate "python"   "python"          "hooksniff"  "--additional-properties=packageName=hooksniff,packageVersion=0.3.0" &
generate "go"       "go"              "hooksniff"  "--additional-properties=packageName=hooksniff,packageVersion=0.3.0" &
generate "rust"     "rust"            "hooksniff"  "--additional-properties=packageName=hooksniff,packageVersion=0.3.0" &
wait
echo "--- Batch 1 done ---"

generate "ruby"     "ruby"            "hooksniff"  "--additional-properties=gemName=hooksniff,gemVersion=0.3.0" &
generate "java"     "java"            "hooksniff"  "--additional-properties=groupId=io.github.servetarslan02,artifactId=hooksniff-sdk,artifactVersion=0.3.0" &
generate "kotlin"   "kotlin"          "hooksniff"  "--additional-properties=groupId=io.github.servetarslan02,artifactId=hooksniff,artifactVersion=0.3.0" &
generate "php"      "php"             "hooksniff"  "--additional-properties=packageName=hooksniff,packageVersion=0.3.0" &
wait
echo "--- Batch 2 done ---"

generate "csharp"   "csharp"          "hooksniff"  "--additional-properties=packageName=HookSniff,packageVersion=0.3.0" &
generate "elixir"   "elixir"          "hooksniff"  "--additional-properties=packageName=hooksniff" &
generate "swift"    "swift5"          "hooksniff"  "--additional-properties=packageName=HookSniff" &
wait
echo "--- Batch 3 done ---"

echo "=== ALL 11 SDKs GENERATED ==="
