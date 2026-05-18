#!/bin/bash
set -e

export JAVA_HOME=/tmp/jdk-17.0.12
export PATH=$JAVA_HOME/bin:$PATH
SPEC="docs/openapi.yaml"
BASE_URL="https://hooksniff-api-1046140057667.europe-west1.run.app"

generate() {
  local lang=$1
  local generator=$2
  local pkg=$3
  local out="sdks/$lang"
  
  echo "=== Generating $lang ($generator) ==="
  rm -rf "$out/src" "$out/lib" "$out/Sources" "$out/hooksniff" "$out/hooksniff.go" "$out/hooksniff_test.go" "$out/HookSniffClient.cs" "$out/WebhookVerification.cs"
  
  npx @openapitools/openapi-generator-cli generate \
    -i "$SPEC" \
    -g "$generator" \
    -o "$out" \
    --package-name "$pkg" \
    --global-property=models,apis,supportingFiles \
    --additional-properties=npmName=@hooksniff/sdk,npmVersion=0.3.0,packageName=hooksniff,packageVersion=0.3.0 \
    2>&1 | tail -3
  
  echo "  Done: $(find $out -name '*.ts' -o -name '*.py' -o -name '*.go' -o -name '*.rs' -o -name '*.rb' -o -name '*.java' -o -name '*.kt' -o -name '*.php' -o -name '*.cs' -o -name '*.ex' -o -name '*.swift' 2>/dev/null | wc -l) files"
  echo ""
}

generate "node" "typescript-node" "hooksniff"
generate "python" "python" "hooksniff"
generate "go" "go" "hooksniff"
generate "rust" "rust" "hooksniff"
generate "ruby" "ruby" "hooksniff"
generate "java" "java" "hooksniff"
generate "kotlin" "kotlin" "hooksniff"
generate "php" "php" "hooksniff"
generate "csharp" "csharp" "hooksniff"
generate "elixir" "elixir" "hooksniff"
generate "swift" "swift5" "hooksniff"

echo "=== ALL DONE ==="
