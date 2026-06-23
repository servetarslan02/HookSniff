---
sidebar_position: 1
slug: /
---

# HookSniff SDK Documentation

Official SDKs for the [HookSniff](https://hooksniff.vercel.app) webhook delivery API.

## Available SDKs

| Language | Package | Version | Registry |
|----------|---------|---------|----------|
| **Node.js** | `hooksniff-node` | v0.4.10 | [npm](https://www.npmjs.com/package/hooksniff-node) |
| **Python** | `hooksniff-python` | v0.4.4 | [PyPI](https://pypi.org/project/hooksniff-python/) |
| **Go** | `hooksniff-go` | v1.4.0 | [pkg.go.dev](https://pkg.go.dev/github.com/servetarslan02/hooksniff-go@v1.4.0) |
| **Kotlin** | `com.hooksniff:hooksniff-kotlin` | v0.5.0 | [Maven Central](https://central.sonatype.com/artifact/com.hooksniff/hooksniff-kotlin/0.5.0) |
| **Rust** | `hooksniff` | — | 🔄 Planned |
| **Ruby** | `hooksniff` | — | 🔄 Planned |
| **Java** | `com.hooksniff` | — | 🔄 Planned |
| **PHP** | `hooksniff/hooksniff` | — | 🔄 Planned |
| **C#** | `HookSniff` | — | 🔄 Planned |
| **Elixir** | `hooksniff` | — | 🔄 Planned |
| **Swift** | `HookSniff` | — | 🔄 Planned |

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
