#!/bin/bash
# Requires: export RENDER_API_KEY=rnd_...  (from Render Dashboard → Account Settings → API Keys)
set -euo pipefail

API_KEY="${RENDER_API_KEY:?Set RENDER_API_KEY to your Render API key}"
REPO="https://github.com/servetarslan02/HookSniff"
BRANCH="main"

curl -X POST https://api.render.com/v1/blueprint-registrations \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"repo\": \"${REPO}\", \"branch\": \"${BRANCH}\"}"
