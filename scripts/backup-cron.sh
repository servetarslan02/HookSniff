#!/usr/bin/env bash
set -euo pipefail
export DATABASE_URL="postgresql://neondb_owner:npg_HUw5KmSC2nQL@ep-frosty-bar-al0hyt9d-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require"
BACKUP_DIR="/var/backups/hooksniff"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
cd /root/.openclaw/workspace/HookSniff
node scripts/neon-backup.mjs --out "${BACKUP_DIR}"
# Keep only last 30 days
find "${BACKUP_DIR}" -name "hooksniff-backup-*.sql" -type f -mtime +30 -delete 2>/dev/null || true
echo "[$(date)] Backup completed"
