#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookRelay — PostgreSQL Restore Script
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-hookrelay}"
DB_USER="${DB_USER:-hookrelay}"

# Storage backend
BACKUP_STORAGE="${BACKUP_STORAGE:-local}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hookrelay}"

S3_BUCKET="${S3_BUCKET:-hookrelay-backups}"
S3_PREFIX="${S3_PREFIX:-postgres}"

GCS_BUCKET="${GCS_BUCKET:-hookrelay-backups}"
GCS_PREFIX="${GCS_PREFIX:-postgres}"

# ── Helpers ──

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
    exit 1
}

# ── Restore functions ──

list_backups() {
    log "Available backups:"

    case "${BACKUP_STORAGE}" in
        local)
            ls -1t "${BACKUP_DIR}"/hookrelay-*.dump 2>/dev/null || echo "  (none)"
            ;;
        s3)
            aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" 2>/dev/null || echo "  (none)"
            ;;
        gcs)
            gsutil ls "gs://${GCS_BUCKET}/${GCS_PREFIX}/" 2>/dev/null || echo "  (none)"
            ;;
    esac
}

restore_full() {
    local backup_path="${1:?Usage: restore.sh full <backup_path>}"

    log "⚠️  WARNING: This will overwrite the '${DB_NAME}' database!"
    read -rp "Continue? (yes/no): " confirm
    if [ "${confirm}" != "yes" ]; then
        log "Restore cancelled."
        exit 0
    fi

    log "Restoring from: ${backup_path}"

    case "${BACKUP_STORAGE}" in
        local)
            pg_restore \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                --clean --if-exists \
                "${backup_path}"
            ;;
        s3)
            aws s3 cp "${backup_path}" - \
            | pg_restore \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                --clean --if-exists
            ;;
        gcs)
            gsutil cat "${backup_path}" \
            | pg_restore \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                --clean --if-exists
            ;;
    esac

    log "✅ Restore completed from: ${backup_path}"
}

# ── Main ──

usage() {
    echo "Usage: $0 {list|full <path>}"
    echo ""
    echo "Commands:"
    echo "  list               List available backups"
    echo "  full <path>        Restore from a backup file"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST          PostgreSQL host (default: localhost)"
    echo "  DB_PORT          PostgreSQL port (default: 5432)"
    echo "  DB_NAME          Database name (default: hookrelay)"
    echo "  DB_USER          Database user (default: hookrelay)"
    echo "  PGPASSWORD       Database password (or use .pgpass)"
    echo "  BACKUP_STORAGE   Storage backend: local, s3, gcs (default: local)"
    echo "  BACKUP_DIR       Local backup directory (default: /var/backups/hookrelay)"
    echo "  S3_BUCKET        S3 bucket name"
    echo "  GCS_BUCKET       GCS bucket name"
}

case "${1:-}" in
    list)
        list_backups
        ;;
    full)
        restore_full "${2:-}"
        ;;
    *)
        usage
        exit 1
        ;;
esac
