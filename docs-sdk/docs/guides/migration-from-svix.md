---
sidebar_position: 5
---

# Migration from Svix

Migrating from Svix to HookSniff is straightforward. The APIs are similar — HookSniff is a Svix-compatible alternative with more features and a generous free tier.

## Why Migrate?

- 💰 **10,000 webhooks/month free** (vs Svix's 500/day)
- 📡 **More delivery methods** — HTTP, WebSocket, Email
- 🔀 **Smart Routing** — round-robin, latency-based, failover
- 📊 **Real-time Streaming** — SSE for live monitoring
- 📦 **11 SDKs** — Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift

## SDK Changes

### Node.js

```javascript
// Before (Svix)
import { Svix } from 'svix';
const svix = new Svix({ token: 'sk_live_xxx' });
const endpoints = await svix.endpoint.list('app_id');

// After (HookSniff)
import { HookSniff } from 'hooksniff';
const hs = new HookSniff({ apiKey: 'hr_live_xxx' });
const endpoints = await hs.endpoint.list();
// No app_id needed!
```

### Python

```python
# Before (Svix)
from svix.api import Svix
svix = Svix(token="sk_live_xxx")
endpoints = svix.endpoint.list("app_id")

# After (HookSniff)
from hooksniff import HookSniff
hs = HookSniff(api_key="hr_live_xxx")
endpoints = hs.endpoint.list()
```

## API Differences

| Feature | Svix | HookSniff |
|---------|------|-----------|
| Authentication | Bearer token per app | JWT + API key |
| App concept | Multi-app (app_id required) | Single account |
| Endpoint URL | `/api/v1/app/{app_id}/endpoint/` | `/v1/endpoints/` |
| Message URL | `/api/v1/app/{app_id}/msg/` | `/v1/webhooks/` |
| Headers | `svix-id`, `svix-timestamp`, `svix-signature` | `webhook-id`, `webhook-timestamp`, `webhook-signature` |
| Free tier | 500/day | 10,000/month |

## Step-by-Step

1. Create HookSniff account at `hooksniff.vercel.app`
2. Replace SDK: uninstall Svix, install HookSniff
3. Create endpoints via API or dashboard
4. Update webhook handler: change header names
5. Remove `app_id` parameters from API calls
6. Test with Playground, then switch production traffic
