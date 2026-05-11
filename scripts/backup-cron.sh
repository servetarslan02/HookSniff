#!/usr/bin/env bash
set -euo pipefail

# SECURITY: DATABASE_URL must be set via environment variable or secret manager.
# Never hardcode credentials in scripts.
if [ -z "${DATABASE_URL:-}" ]; then
    echo "[$(date)] ERROR: DATABASE_URL environment variable is not set." >&2
    echo "Set it via: export DATABASE_URL='postgresql://...'" >&2
    exit 1
fi

BACKUP_DIR="/var/backups/hooksniff"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
cd /root/.openclaw/workspace/HookSniff
node scripts/neon-backup.mjs --out "${BACKUP_DIR}"
# Keep only last 30 days
find "${BACKUP_DIR}" -name "hooksniff-backup-*.sql" -type f -mtime +30 -delete 2>/dev/null || true
echo "[$(date)] Backup completed"
