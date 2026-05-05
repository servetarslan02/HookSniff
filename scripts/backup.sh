#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookRelay — CockroachDB Backup Script
# Supports full and incremental backups with S3/GCS upload
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-26257}"
DB_NAME="${DB_NAME:-hookrelay}"
DB_USER="${DB_USER:-root}"
DB_INSECURE="${DB_INSECURE:-true}"

# Storage backend: "local", "s3", or "gcs"
BACKUP_STORAGE="${BACKUP_STORAGE:-local}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hookrelay}"

# S3 configuration
S3_BUCKET="${S3_BUCKET:-hookrelay-backups}"
S3_PREFIX="${S3_PREFIX:-cockroachdb}"
S3_REGION="${S3_REGION:-us-east-1}"

# GCS configuration
GCS_BUCKET="${GCS_BUCKET:-hookrelay-backups}"
GCS_PREFIX="${GCS_PREFIX:-cockroachdb}"

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

get_cockroach_cmd() {
    local cmd="cockroach sql --host=${DB_HOST} --port=${DB_PORT}"
    if [ "${DB_INSECURE}" = "true" ]; then
        cmd="${cmd} --insecure"
    fi
    echo "${cmd}"
}

# ── Backup functions ──

backup_full() {
    local timestamp
    timestamp=$(get_timestamp)
    local backup_path

    case "${BACKUP_STORAGE}" in
        local)
            backup_path="${BACKUP_DIR}/full/${timestamp}"
            mkdir -p "${backup_path}"
            log "Starting FULL backup to ${backup_path}"

            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "BACKUP DATABASE ${DB_NAME} TO 'nodelocal://1/${backup_path}';"
            ;;
        s3)
            backup_path="s3://${S3_BUCKET}/${S3_PREFIX}/full/${timestamp}"
            log "Starting FULL backup to ${backup_path}"

            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "BACKUP DATABASE ${DB_NAME} TO '${backup_path}' WITH kms='aws-kms:///key?AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}&AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}';"
            ;;
        gcs)
            backup_path="gs://${GCS_BUCKET}/${GCS_PREFIX}/full/${timestamp}"
            log "Starting FULL backup to ${backup_path}"

            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "BACKUP DATABASE ${DB_NAME} TO '${backup_path}';"
            ;;
        *)
            error "Unknown storage backend: ${BACKUP_STORAGE}"
            ;;
    esac

    log "✅ Full backup completed: ${backup_path}"
}

backup_incremental() {
    local timestamp
    timestamp=$(get_timestamp)
    local backup_path
    local full_path

    # Find the latest full backup
    case "${BACKUP_STORAGE}" in
        local)
            full_path=$(ls -td "${BACKUP_DIR}/full/"*/ 2>/dev/null | head -1)
            if [ -z "${full_path}" ]; then
                log "No full backup found. Running full backup first."
                backup_full
                return
            fi
            backup_path="${BACKUP_DIR}/incremental/${timestamp}"
            mkdir -p "${backup_path}"
            log "Starting INCREMENTAL backup (base: ${full_path}) to ${backup_path}"

            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "BACKUP DATABASE ${DB_NAME} INTO 'nodelocal://1/${backup_path}' WITH incremental_location='nodelocal://1/${full_path}';"
            ;;
        s3)
            # List S3 to find latest full backup
            full_path=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/full/" | \
                sort -r | head -1 | awk '{print $2}' | tr -d '/')
            if [ -z "${full_path}" ]; then
                log "No full backup found. Running full backup first."
                backup_full
                return
            fi
            backup_path="s3://${S3_BUCKET}/${S3_PREFIX}/incremental/${timestamp}"
            local full_s3="s3://${S3_BUCKET}/${S3_PREFIX}/full/${full_path}"
            log "Starting INCREMENTAL backup (base: ${full_s3}) to ${backup_path}"

            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "BACKUP DATABASE ${DB_NAME} INTO '${backup_path}' WITH incremental_location='${full_s3}';"
            ;;
        gcs)
            full_path=$(gsutil ls "gs://${GCS_BUCKET}/${GCS_PREFIX}/full/" | \
                sort -r | head -1 | sed 's|/$||' | xargs -I{} basename {})
            if [ -z "${full_path}" ]; then
                log "No full backup found. Running full backup first."
                backup_full
                return
            fi
            backup_path="gs://${GCS_BUCKET}/${GCS_PREFIX}/incremental/${timestamp}"
            local full_gcs="gs://${GCS_BUCKET}/${GCS_PREFIX}/full/${full_path}"
            log "Starting INCREMENTAL backup (base: ${full_gcs}) to ${backup_path}"

            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "BACKUP DATABASE ${DB_NAME} INTO '${backup_path}' WITH incremental_location='${full_gcs}';"
            ;;
    esac

    log "✅ Incremental backup completed: ${backup_path}"
}

# ── Retention cleanup ──

cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."

    case "${BACKUP_STORAGE}" in
        local)
            find "${BACKUP_DIR}" -type d -mtime "+${RETENTION_DAYS}" -exec rm -rf {} + 2>/dev/null || true
            ;;
        s3)
            # Use S3 lifecycle policy (recommended) or delete manually
            local cutoff
            cutoff=$(date -d "-${RETENTION_DAYS} days" '+%Y%m%d')
            aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/full/" | while read -r line; do
                local dir
                dir=$(echo "${line}" | awk '{print $2}' | tr -d '/')
                if [[ "${dir}" < "${cutoff}" ]]; then
                    log "Deleting old backup: s3://${S3_BUCKET}/${S3_PREFIX}/full/${dir}"
                    aws s3 rm "s3://${S3_BUCKET}/${S3_PREFIX}/full/${dir}" --recursive
                fi
            done
            ;;
        gcs)
            local cutoff
            cutoff=$(date -d "-${RETENTION_DAYS} days" '+%Y%m%d')
            gsutil ls "gs://${GCS_BUCKET}/${GCS_PREFIX}/full/" | while read -r path; do
                local dir
                dir=$(basename "${path}" | tr -d '/')
                if [[ "${dir}" < "${cutoff}" ]]; then
                    log "Deleting old backup: ${path}"
                    gsutil -m rm -r "${path}" 2>/dev/null || true
                fi
            done
            ;;
    esac

    log "✅ Cleanup completed"
}

# ── Main ──

usage() {
    echo "Usage: $0 {full|incremental|cleanup}"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST          CockroachDB host (default: localhost)"
    echo "  DB_PORT          CockroachDB port (default: 26257)"
    echo "  DB_NAME          Database name (default: hookrelay)"
    echo "  BACKUP_STORAGE   Storage backend: local, s3, gcs (default: local)"
    echo "  BACKUP_DIR       Local backup directory (default: /var/backups/hookrelay)"
    echo "  S3_BUCKET        S3 bucket name"
    echo "  GCS_BUCKET       GCS bucket name"
    echo "  RETENTION_DAYS   Days to keep backups (default: 30)"
}

case "${1:-}" in
    full)
        backup_full
        cleanup_old_backups
        ;;
    incremental)
        backup_incremental
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
