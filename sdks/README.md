# HookSniff SDKs

Official SDK libraries for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Available SDKs

| Language | Package | Version | Status |
|----------|---------|---------|--------|
| **Node.js** | [npm](https://www.npmjs.com/package/hooksniff) | 1.0.0 | ✅ |
| **Python** | [PyPI](https://pypi.org/project/hooksniff/) | 1.0.0 | ✅ |
| **Go** | [pkg.go.dev](https://pkg.go.dev/github.com/servetarslan02/hooksniff-go) | 1.0.0 | ✅ |
| **Rust** | [crates.io](https://crates.io/crates/hooksniff) | 1.0.0 | ✅ |
| **Ruby** | [RubyGems](https://rubygems.org/gems/hooksniff) | 1.0.0 | ✅ |
| **Java** | [Maven Central](https://central.sonatype.com/artifact/com.hooksniff/hooksniff) | 1.0.0 | ✅ |
| **Kotlin** | [Maven Central](https://central.sonatype.com/artifact/com.hooksniff/hooksniff-kotlin) | 1.0.0 | ✅ |
| **PHP** | [Packagist](https://packagist.org/packages/hooksniff/hooksniff) | 1.0.0 | ✅ |
| **C#** | [NuGet](https://www.nuget.org/packages/HookSniff) | 1.0.0 | ✅ |
| **Elixir** | [Hex.pm](https://hex.pm/packages/hooksniff) | 1.0.0 | ✅ |
| **Swift** | [Swift Package Index](https://swiftpackageindex.com/servetarslan02/hooksniff-swift) | 1.0.0 | ✅ |

## Features (All SDKs)

- ✅ Type-safe models (auto-generated from OpenAPI spec)
- ✅ Auto-retry with exponential backoff (429, 5xx)
- ✅ Webhook signature verification (HMAC-SHA256)
- ✅ Auto-idempotency keys
- ✅ Pagination helpers
- ✅ Error handling with typed exceptions

## Quick Start (Any Language)

```bash
# Install
npm install hooksniff      # Node.js
pip install hooksniff      # Python
go get hooksniff-go        # Go
cargo add hooksniff        # Rust
gem install hooksniff      # Ruby
```

```python
# Python example (all languages follow same pattern)
from hooksniff import HookSniff

client = HookSniff("hs_xxx")
endpoints = client.endpoint.list()
message = client.message.create(event="order.created", data={"id": "123"})
```

## Webhook Verification

```python
from hooksniff import Webhook

wh = Webhook("whsec_xxx")
payload = wh.verify(raw_body, headers)
```

## Documentation

- [Quick Start Guide](docs/quickstart.md)
- [API Reference](https://api.hooksniff.com)
- [Examples](examples/)

## SDK Development

```bash
# Generate types from OpenAPI spec
python3 openapi-codegen.py all

# Test all SDKs
bash local-sdk-test.sh all

# Publish all SDKs (dry-run)
bash local-sdk-publish.sh dry-run all
```
