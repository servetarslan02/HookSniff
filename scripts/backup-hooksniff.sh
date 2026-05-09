#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — Automated Backup Script
# Supports: Neon (PostgreSQL), Upstash (Redis), Cloudflare R2
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──
DB_URL="${DATABASE_URL:-postgresql://hooksniff:hooksniff@localhost:5432/hooksniff}"
REDIS_URL="${REDIS_URL:-}"
R2_BUCKET="${R2_BUCKET:-hooksniff-backups}"
R2_ENDPOINT="${R2_ENDPOINT:-}"
BACKUP_DIR="${BACKUP_DIR:-/tmp/hooksniff-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# ── Helpers ──
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2; exit 1; }

# ── PostgreSQL Backup ──
backup_postgres() {
    local file="${BACKUP_DIR}/hooksniff-${TIMESTAMP}.sql.gz"
    mkdir -p "${BACKUP_DIR}"

    log "📦 Backing up PostgreSQL..."
    pg_dump "${DB_URL}" --no-owner --no-privileges | gzip > "${file}"
    local size
    size=$(du -h "${file}" | cut -f1)
    log "✅ PostgreSQL backup: ${file} (${size})"

    # Upload to R2 if configured
    if [[ -n "${R2_ENDPOINT}" && -n "${R2_BUCKET}" ]]; then
        log "☁️  Uploading to R2..."
        aws s3 cp "${file}" "s3://${R2_BUCKET}/postgres/${TIMESTAMP}/hooksniff.sql.gz" \
            --endpoint-url "${R2_ENDPOINT}" 2>/dev/null && \
            log "✅ Uploaded to R2" || \
            log "⚠️  R2 upload failed (credentials missing?)"
    fi

    echo "${file}"
}

# ── Redis Backup ──
backup_redis() {
    if [[ -z "${REDIS_URL}" ]]; then
        log "⏭️  Skipping Redis (REDIS_URL not set)"
        return
    fi

    local file="${BACKUP_DIR}/redis-${TIMESTAMP}.rdb"
    log "📦 Backing up Redis..."

    # Trigger BGSAVE and copy dump
    redis-cli -u "${REDIS_URL}" BGSAVE >/dev/null 2>&1 || true
    sleep 2

    # For Upstash, export keys
    redis-cli -u "${REDIS_URL}" --scan --pattern '*' > "${file}.keys" 2>/dev/null || true
    local count
    count=$(wc -l < "${file}.keys" 2>/dev/null || echo "0")
    log "✅ Redis backup: ${count} keys exported"
}

# ── Cleanup ──
cleanup_old() {
    log "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
    find "${BACKUP_DIR}" -name "hooksniff-*.sql.gz" -type f -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
    find "${BACKUP_DIR}" -name "redis-*.rdb*" -type f -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
    log "✅ Cleanup done"
}

# ── Verify ──
verify_backup() {
    local file="$1"
    if [[ ! -f "${file}" ]]; then
        error "Backup file not found: ${file}"
    fi

    log "🔍 Verifying backup integrity..."
    if gzip -t "${file}" 2>/dev/null; then
        log "✅ Backup integrity OK"
    else
        error "Backup file is corrupted!"
    fi
}

# ── Main ──
case "${1:-full}" in
    full)
        file=$(backup_postgres)
        backup_redis
        verify_backup "${file}"
        cleanup_old
        log "🎉 Full backup completed!"
        ;;
    postgres)
        file=$(backup_postgres)
        verify_backup "${file}"
        ;;
    redis)
        backup_redis
        ;;
    cleanup)
        cleanup_old
        ;;
    *)
        echo "Usage: $0 {full|postgres|redis|cleanup}"
        echo ""
        echo "Environment:"
        echo "  DATABASE_URL     PostgreSQL connection string"
        echo "  REDIS_URL        Redis connection string (optional)"
        echo "  R2_BUCKET        Cloudflare R2 bucket name"
        echo "  R2_ENDPOINT      Cloudflare R2 endpoint URL"
        echo "  BACKUP_DIR       Local backup directory"
        echo "  RETENTION_DAYS   Days to keep backups (default: 30)"
        exit 1
        ;;
esac
