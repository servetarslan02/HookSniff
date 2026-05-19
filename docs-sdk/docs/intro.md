---
sidebar_position: 1
slug: /
---

# HookSniff SDK Documentation

Official SDKs for the [HookSniff](https://hooksniff.vercel.app) webhook delivery API.

## Available SDKs

| Language | Package | Version | Registry |
|----------|---------|---------|----------|
| **Node.js** | `hooksniff` | 1.3.0 | npm |
| **Python** | `hooksniff` | 1.1.0 | PyPI |
| **Go** | `hooksniff-go` | v1.3.0 | pkg.go.dev |
| **Rust** | `hooksniff` | 1.5.0 | crates.io |
| **Ruby** | `hooksniff` | 1.2.0 | RubyGems |
| **Java** | `hooksniff-sdk` | 1.1.0 | Maven Central |
| **Kotlin** | `hooksniff-sdk-kotlin` | 1.2.0 | Maven Central |
| **PHP** | `hooksniff/hooksniff` | 1.1.0 | Packagist |
| **C#** | `HookSniff` | 1.2.0 | NuGet |
| **Elixir** | `hooksniff` | 1.1.0 | Hex.pm |
| **Swift** | `HookSniff` | 1.2.0 | SPM |

## Quick Example

```javascript
// Node.js
import { HookSniff } from 'hooksniff';

const hs = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY });
const endpoints = await hs.endpoint.list();
```

```python
# Python
from hooksniff import HookSniff
import os

hs = HookSniff(api_key=os.environ["HOOKSNIFF_API_KEY"])
endpoints = hs.endpoint.list()
```

```go
// Go
hs := hooksniff.NewClient(os.Getenv("HOOKSNIFF_API_KEY"))
endpoints, _ := hs.Endpoint.List(ctx, nil)
```

## All SDKs Include

- ✅ **HMAC-SHA256 verification** — Standard Webhooks compliant
- ✅ **Auto-retry** — exponential backoff with jitter, respects 429 Retry-After
- ✅ **Pagination** — cursor-based, with auto-paginate helpers
- ✅ **Idempotency keys** — prevent duplicate deliveries
- ✅ **Rate limit parsing** — X-RateLimit-* header handling
- ✅ **SSE streaming** — real-time delivery events (Node.js, Go, Rust, Ruby)
- ✅ **Type safety** — full type definitions for all API resources

## Getting Started

Pick your language from the [Quick Start](/docs/quickstart/node) guide, or see the full [API Reference](/docs/api-reference).
