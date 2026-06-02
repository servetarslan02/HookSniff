#!/bin/bash
API_KEY="rnd_wnnEz7F4r8PaOrmepaRYANRKv6Ky"
REPO="https://github.com/servetarslan02/HookSniff"
BRANCH="main"

curl -X POST https://api.render.com/v1/blueprint-registrations \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"repo\": \"$REPO\", \"branch\": \"$BRANCH\"}"
