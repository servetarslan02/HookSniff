#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# HookRelay — CockroachDB Restore Script
# Supports full and point-in-time recovery
# ──────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-26257}"
DB_NAME="${DB_NAME:-hookrelay}"
DB_USER="${DB_USER:-root}"
DB_INSECURE="${DB_INSECURE:-true}"

# Storage backend
BACKUP_STORAGE="${BACKUP_STORAGE:-local}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/hookrelay}"

S3_BUCKET="${S3_BUCKET:-hookrelay-backups}"
S3_PREFIX="${S3_PREFIX:-cockroachdb}"

GCS_BUCKET="${GCS_BUCKET:-hookrelay-backups}"
GCS_PREFIX="${GCS_PREFIX:-cockroachdb}"

# ── Helpers ──

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
    exit 1
}

get_cockroach_cmd() {
    local cmd="cockroach sql --host=${DB_HOST} --port=${DB_PORT}"
    if [ "${DB_INSECURE}" = "true" ]; then
        cmd="${cmd} --insecure"
    fi
    echo "${cmd}"
}

# ── Restore functions ──

list_backups() {
    log "Available backups:"

    case "${BACKUP_STORAGE}" in
        local)
            echo "── Full backups ──"
            ls -1d "${BACKUP_DIR}/full/"*/ 2>/dev/null || echo "  (none)"
            echo ""
            echo "── Incremental backups ──"
            ls -1d "${BACKUP_DIR}/incremental/"*/ 2>/dev/null || echo "  (none)"
            ;;
        s3)
            echo "── Full backups ──"
            aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/full/" 2>/dev/null || echo "  (none)"
            echo ""
            echo "── Incremental backups ──"
            aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/incremental/" 2>/dev/null || echo "  (none)"
            ;;
        gcs)
            echo "── Full backups ──"
            gsutil ls "gs://${GCS_BUCKET}/${GCS_PREFIX}/full/" 2>/dev/null || echo "  (none)"
            echo ""
            echo "── Incremental backups ──"
            gsutil ls "gs://${GCS_BUCKET}/${GCS_PREFIX}/incremental/" 2>/dev/null || echo "  (none)"
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

    # Drop and recreate the database
    $(get_cockroach_cmd) -e "DROP DATABASE IF EXISTS ${DB_NAME} CASCADE;"
    $(get_cockroach_cmd) -e "CREATE DATABASE ${DB_NAME};"

    case "${BACKUP_STORAGE}" in
        local)
            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "RESTORE DATABASE ${DB_NAME} FROM 'nodelocal://1/${backup_path}';"
            ;;
        s3)
            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "RESTORE DATABASE ${DB_NAME} FROM '${backup_path}';"
            ;;
        gcs)
            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "RESTORE DATABASE ${DB_NAME} FROM '${backup_path}';"
            ;;
    esac

    log "✅ Restore completed from: ${backup_path}"
}

restore_incremental() {
    local full_path="${1:?Usage: restore.sh incremental <full_path> <incremental_path>}"
    local incr_path="${2:?Usage: restore.sh incremental <full_path> <incremental_path>}"

    log "⚠️  WARNING: This will overwrite the '${DB_NAME}' database!"
    read -rp "Continue? (yes/no): " confirm
    if [ "${confirm}" != "yes" ]; then
        log "Restore cancelled."
        exit 0
    fi

    log "Restoring from full: ${full_path} + incremental: ${incr_path}"

    $(get_cockroach_cmd) -e "DROP DATABASE IF EXISTS ${DB_NAME} CASCADE;"
    $(get_cockroach_cmd) -e "CREATE DATABASE ${DB_NAME};"

    case "${BACKUP_STORAGE}" in
        local)
            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "RESTORE DATABASE ${DB_NAME} FROM LATEST IN 'nodelocal://1/${incr_path}' WITH incremental_location='nodelocal://1/${full_path}';"
            ;;
        s3)
            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "RESTORE DATABASE ${DB_NAME} FROM LATEST IN '${incr_path}' WITH incremental_location='${full_path}';"
            ;;
        gcs)
            $(get_cockroach_cmd) -d "${DB_NAME}" \
                -e "RESTORE DATABASE ${DB_NAME} FROM LATEST IN '${incr_path}' WITH incremental_location='${full_path}';"
            ;;
    esac

    log "✅ Restore completed"
}

# ── Main ──

usage() {
    echo "Usage: $0 {list|full <path>|incremental <full_path> <incr_path>}"
    echo ""
    echo "Commands:"
    echo "  list                     List available backups"
    echo "  full <path>              Restore from a full backup"
    echo "  incremental <full> <inc> Restore from full + incremental backup"
    echo ""
    echo "Environment variables:"
    echo "  DB_HOST          CockroachDB host (default: localhost)"
    echo "  DB_PORT          CockroachDB port (default: 26257)"
    echo "  DB_NAME          Database name (default: hookrelay)"
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
    incremental)
        restore_incremental "${2:-}" "${3:-}"
        ;;
    *)
        usage
        exit 1
        ;;
esac
