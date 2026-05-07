#!/bin/bash
# GitHub Memory Sync - pushes workspace state to GitHub
# Called periodically by cron or manually

set -e
cd /root/.openclaw/workspace/HookSniff

# Configure git if needed
git config user.name "HookSniff Agent" 2>/dev/null
git config user.email "agent@hooksniff.dev" 2>/dev/null

# Stage all memory/tracking files (both root and .ai-context)
git add .ai-context/ MEMORY.md TODO.md STATUS.md SESSION_NOTES.md CONTEXT.md HEARTBEAT.md IDENTITY.md USER.md 2>/dev/null

# Check if there are changes
if git diff --cached --quiet 2>/dev/null; then
    echo "No changes to commit"
    exit 0
fi

# Commit and push
TIMESTAMP=$(TZ='Europe/Istanbul' date '+%Y-%m-%d %H:%M')
git commit -m "🧠 Memory sync: $TIMESTAMP" --allow-empty 2>/dev/null
git push origin main 2>&1

echo "✅ Synced to GitHub at $TIMESTAMP"
