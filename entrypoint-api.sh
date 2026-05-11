#!/bin/sh
# entrypoint-api.sh — Startup wrapper for debugging Cloud Run failures
# Captures and logs all errors before the main binary starts

echo "=== HookSniff API Starting ==="
echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "PORT=${PORT:-3000}"
echo "APP_ENV=${APP_ENV:-not_set}"
echo "RUST_LOG=${RUST_LOG:-not_set}"
echo "OTEL_ENABLED=${OTEL_ENABLED:-not_set}"

# Check required env vars (log presence, not values)
[ -n "$DATABASE_URL" ] && echo "DATABASE_URL: set (${#DATABASE_URL} chars)" || echo "DATABASE_URL: MISSING"
[ -n "$REDIS_URL" ] && echo "REDIS_URL: set (${#REDIS_URL} chars)" || echo "REDIS_URL: MISSING"
[ -n "$HMAC_SECRET" ] && echo "HMAC_SECRET: set (${#HMAC_SECRET} chars)" || echo "HMAC_SECRET: MISSING"
[ -n "$JWT_SECRET" ] && echo "JWT_SECRET: set (${#JWT_SECRET} chars)" || echo "JWT_SECRET: MISSING"

# Check if binary exists and is executable
if [ ! -x /usr/local/bin/hooksniff-api ]; then
    echo "FATAL: hooksniff-api binary not found or not executable"
    exit 1
fi

echo "=== Starting hooksniff-api ==="

# exec replaces shell with binary (proper signal handling for Cloud Run)
exec /usr/local/bin/hooksniff-api
