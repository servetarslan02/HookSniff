#!/bin/bash
# HookSniff .ai-context/ auto-sync to GitHub
# Runs every 10 minutes via OpenClaw cron

cd /root/.openclaw/workspace/HookSniff

# Check if there are changes in .ai-context/
if git diff --quiet .ai-context/ && git diff --cached --quiet .ai-context/; then
    echo "No changes to sync"
    exit 0
fi

# Stage and commit
git add .ai-context/
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
git commit -m "auto-sync: .ai-context/ güncellendi — $TIMESTAMP" 2>/dev/null

# Push
git push origin main 2>&1

echo "Synced at $TIMESTAMP"
