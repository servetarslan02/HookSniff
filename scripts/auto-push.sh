#!/bin/bash
# Auto-push memory files to GitHub
# Runs every 10 minutes via cron

cd /root/.openclaw/workspace/HookSniff

# Pull latest first (in case other sessions pushed)
git pull --rebase origin main 2>/dev/null

# Stage memory-related files
git add MEMORY.md TODO.md SESSION_NOTES.md CONTEXT.md .ai-context/ 2>/dev/null

# Check if there are changes
if git diff --cached --quiet 2>/dev/null; then
  exit 0
fi

# Commit and push
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
git commit -m "🤖 auto-sync: memory update $TIMESTAMP" 2>/dev/null
git push origin main 2>/dev/null
