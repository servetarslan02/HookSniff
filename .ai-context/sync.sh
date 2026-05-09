#!/bin/bash
# Auto-sync .ai-context/ to GitHub
# Runs every 10 minutes via OpenClaw cron
set -e
cd /root/.openclaw/workspace/HookSniff
git pull --rebase origin main 2>/dev/null || true
git add .ai-context/
if ! git diff --cached --quiet; then
  git commit -m "docs: hafıza dosyaları otomatik senkron [$(date +%Y-%m-%d\ %H:%M)]"
  git push origin main 2>/dev/null || echo "push failed, will retry next cycle"
  echo "Synced at $(date)"
else
  echo "No changes at $(date)"
fi
