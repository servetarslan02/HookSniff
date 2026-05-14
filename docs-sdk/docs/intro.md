---
sidebar_position: 1
slug: /
---

# HookSniff SDK Documentation

Official SDKs for the [HookSniff](https://hooksniff.vercel.app) webhook delivery API.

## Available SDKs

| Language | Package | Version |
|----------|---------|---------|
| **Node.js** | `hooksniff-sdk` | 0.4.0 |
| **Python** | `hooksniff` | 0.3.0 |
| **Go** | `hooksniff-go` | 0.4.0 |
| **Rust** | `hooksniff` | 0.4.0 |
| **Ruby** | `hooksniff` | 0.4.0 |
| **Java** | `hooksniff-sdk` | 0.4.0 |
| **Kotlin** | `hooksniff` | 0.4.0 |
| **PHP** | `hooksniff/hooksniff` | 0.4.0 |
| **C#** | `HookSniff` | 0.4.0 |
| **Elixir** | `hooksniff` | 0.4.0 |
| **Swift** | `HookSniff` | 0.4.0 |

## Quick Example

```javascript
// Node.js
const { HookSniff } = require('hooksniff-sdk');

const client = new HookSniff('sk_live_your_api_key');
const endpoints = await client.endpoints.list();
```

```python
# Python
from hooksniff import HookSniff

client = HookSniff(api_key="sk_live_your_api_key")
endpoints = client.endpoints.list()
```

```go
// Go
client, _ := hooksniff.NewHookSniff("sk_live_your_api_key")
endpoints, _ := client.Endpoints.List()
```

## Features

- **Zero/minimal dependencies** — uses native HTTP and crypto libraries
- **Webhook signature verification** — HMAC-SHA256, Standard Webhooks compatible
- **Automatic retry** — exponential backoff with jitter
- **Pagination** — iterator pattern for large result sets
- **Type-safe** — full type definitions for all API resources
- **Idempotency** — automatic idempotency keys for POST requests

## Getting Started

Pick your language from the [Quick Start](/docs/quickstart/node) guide.
