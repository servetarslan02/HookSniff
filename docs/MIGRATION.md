# HookSniff SDK Migration Guide

Migrating from [Svix](https://svix.com) to [HookSniff](https://hooksniff.com)? Here's what changed.

## Quick Migration

### Node.js

```bash
# Remove Svix
npm uninstall svix

# Install HookSniff
npm install hooksniff
```

```diff
- import { Svix } from 'svix';
+ import { HookSniff } from 'hooksniff';

- const client = new Svix({ apiKey: 'sk_xxx' });
+ const client = new HookSniff({ apiKey: 'hs_xxx' });
```

### Python

```bash
pip uninstall svix
pip install hooksniff
```

```diff
- from svix import Svix
+ from hooksniff import HookSniff

- client = Svix("sk_xxx")
+ client = HookSniff("hs_xxx")
```

### Go

```bash
go get github.com/servetarslan02/hooksniff-go
```

```diff
- import svix "github.com/svix/svix-webhooks/go"
+ import hooksniff "github.com/servetarslan02/hooksniff-go"

- client := svix.New("sk_xxx")
+ client := hooksniff.New("hs_xxx")
```

## What Changed

| Svix | HookSniff | Notes |
|------|-----------|-------|
| `svix.Svix` | `hooksniff.HookSniff` | Main client class |
| `svix.Application` | `hooksniff.Endpoint` | Applications → Endpoints |
| `svix_id` header | `hooksniff_id` header | Webhook verification |
| `svix_signature` | `hooksniff_signature` | Webhook verification |
| `svix_timestamp` | `hooksniff_timestamp` | Webhook verification |
| `api.svix.com` | `api.hooksniff.com` | API base URL |

## Removed Features

These Svix features are not available in HookSniff:

- ❌ Autoconfig
- ❌ Streaming
- ❌ Ingest (inbound webhook sources)
- ❌ Connectors (Shopify, Stripe, etc.)
- ❌ Environment management
- ❌ Integration
- ❌ Operational webhooks
- ❌ Background tasks
- ❌ Message poller

## New Features in HookSniff

- ✅ Built-in analytics
- ✅ Team management
- ✅ Alert rules
- ✅ Schema registry
- ✅ Webhook builder (visual)
- ✅ Playground (test webhooks)

## Webhook Verification

```diff
- import { Webhook } from 'svix';
+ import { Webhook } from 'hooksniff';

  const wh = new Webhook('whsec_xxx');
  const payload = wh.verify(rawBody, {
-   'svix-id': headers['svix-id'],
-   'svix-signature': headers['svix-signature'],
-   'svix-timestamp': headers['svix-timestamp'],
+   'hooksniff-id': headers['hooksniff-id'],
+   'hooksniff-signature': headers['hooksniff-signature'],
+   'hooksniff-timestamp': headers['hooksniff-timestamp'],
  });
```

## API Endpoint Mapping

| Svix Endpoint | HookSniff Endpoint |
|---------------|-------------------|
| `POST /api/v1/app` | `POST /v1/endpoints` |
| `GET /api/v1/app` | `GET /v1/endpoints` |
| `POST /api/v1/app/{id}/endpoint` | `POST /v1/endpoints` |
| `POST /api/v1/msg` | `POST /v1/messages` |
| `GET /api/v1/app/{id}/msg` | `GET /v1/messages` |

## Need Help?

- [Documentation](https://docs.hooksniff.com)
- [GitHub Issues](https://github.com/servetarslan02/HookSniff/issues)
- [Email Support](mailto:support@hooksniff.com)
