#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookSniff — PostgreSQL Backup Script
# Supports full backups with S3/GCS upload
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-hooksniff}"
DB_USER="${DB_USER:-hooksniff}"

# Storage backend: "local", "s3", or "gcs"
BACKUP_STORAGE="${BACKUP_STORAGE:-local}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hooksniff}"

# S3 configuration
S3_BUCKET="${S3_BUCKET:-hooksniff-backups}"
S3_PREFIX="${S3_PREFIX:-postgres}"
S3_REGION="${S3_REGION:-us-east-1}"

# GCS configuration
GCS_BUCKET="${GCS_BUCKET:-hooksniff-backups}"
GCS_PREFIX="${GCS_PREFIX:-postgres}"

# Retention
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# ── Helpers ──

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
    exit 1
}

get_timestamp() {
    date '+%Y%m%d_%H%M%S'
}

# ── Backup functions ──

backup_full() {
    local timestamp
    timestamp=$(get_timestamp)
    local backup_file="hooksniff-${timestamp}.dump"

    case "${BACKUP_STORAGE}" in
        local)
            mkdir -p "${BACKUP_DIR}"
            log "Starting FULL backup to ${BACKUP_DIR}/${backup_file}"

            PGPASSWORD="${PGPASSWORD:-}" pg_dump \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                --format=custom \
                --file="${BACKUP_DIR}/${backup_file}"
            ;;
        s3)
            log "Starting FULL backup to s3://${S3_BUCKET}/${S3_PREFIX}/${backup_file}"

            PGPASSWORD="${PGPASSWORD:-}" pg_dump \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                --format=custom \
            | aws s3 cp - "s3://${S3_BUCKET}/${S3_PREFIX}/${backup_file}" \
                --region "${S3_REGION}"
            ;;
        gcs)
            log "Starting FULL backup to gs://${GCS_BUCKET}/${GCS_PREFIX}/${backup_file}"

            PGPASSWORD="${PGPASSWORD:-}" pg_dump \
                -h "${DB_HOST}" \
                -p "${DB_PORT}" \
                -U "${DB_USER}" \
                -d "${DB_NAME}" \
                --format=custom \
            | gsutil cp - "gs://${GCS_BUCKET}/${GCS_PREFIX}/${backup_file}"
            ;;
        *)
            error "Unknown storage backend: ${BACKUP_STORAGE}"
            ;;
    esac

    log "✅ Full backup completed: ${backup_file}"
}

# ── Retention cleanup ──

cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."

    case "${BACKUP_STORAGE}" in
        local)
            find "${BACKUP_DIR}" -name "hooksniff-*.dump" -type f -mtime "+${RETENTION_DAYS}" -delete 2>/dev/null || true
            ;;
        s3)
            local cutoff
            cutoff=$(date -d "-${RETENTION_DAYS} days" '+%Y%m%d')
            aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" | while read -r line; do
                local file
                file=$(echo "${line}" | awk '{print $4}')
                local file_date
                file_date=$(echo "${file}" | grep -oP '\d{8}' | head -1)
                if [[ -n "${file_date}" && "${file_date}" < "${cutoff}" ]]; then
                    log "Deleting old backup: s3://${S3_BUCKET}/${S3_PREFIX}/${file}"
                    aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/${file}"
                fi
            done
            ;;
        gcs)
            local cutoff
            cutoff=$(date -d "-${RETENTION_DAYS} days" '+%Y%m%d')
            gsutil ls "gs://${GCS_BUCKET}/${GCS_PREFIX}/" | while read -r path; do
                local file
                file=$(basename "${path}")
                local file_date
                file_date=$(echo "${file}" | grep -oP '\d{8}' | head -1)
                if [[ -n "${file_date}" && "${file_date}" < "${cutoff}" ]]; then
                    log "Deleting old backup: ${path}"
                    gsutil rm "${path}" 2>/dev/null || true
                fi
            done
            ;;
    esac

    log "✅ Cleanup completed"
}

# ── Main ──

usage() {
    echo "Usage: $0 {full|cleanup}"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST          PostgreSQL host (default: localhost)"
    echo "  DB_PORT          PostgreSQL port (default: 5432)"
    echo "  DB_NAME          Database name (default: hooksniff)"
    echo "  DB_USER          Database user (default: hooksniff)"
    echo "  PGPASSWORD       Database password (or use .pgpass)"
    echo "  BACKUP_STORAGE   Storage backend: local, s3, gcs (default: local)"
    echo "  BACKUP_DIR       Local backup directory (default: /var/backups/hooksniff)"
    echo "  S3_BUCKET        S3 bucket name"
    echo "  GCS_BUCKET       GCS bucket name"
    echo "  RETENTION_DAYS   Days to keep backups (default: 30)"
}

case "${1:-}" in
    full)
        backup_full
        cleanup_old_backups
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    *)
        usage
        exit 1
        ;;
esac
