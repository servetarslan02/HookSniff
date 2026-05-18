# Changelog

All notable changes to the HookSniff SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] — 2026-05-12

### Added
- **Wrapper class** — `new HookSniff(apiKey)` with typed resource accessors
- **Webhook signature verification** — HMAC-SHA256, Standard Webhooks compatible
- **Pagination** — `listAll()` / `paginate()` / `collectAll()` for all list endpoints
- **Serialization** — `_toJsonObject()` / `_fromJsonObject()` for all models
- **Unit tests** — webhook, serialization, pagination, resource mock tests
- **User-Agent header** — `hooksniff-sdk/0.4.0 (lang)`
- **Idempotency key** — auto-generated UUID, custom override supported
- **Custom fetch/HTTP client** — injectable HTTP layer
- **Configurable timeout** — default 30s, configurable per client
- **Retry with exponential backoff + jitter** — default 2 retries for 5xx errors

### Fixed
- API path consistency across all SDKs (Go reference implementation)
- Response type mismatches (paginated vs bare array responses)

## [0.3.0] — 2026-05-11

### Added
- Full API coverage — all 116 OpenAPI endpoints implemented
- 11 SDKs published: Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift

### Changed
- Regenerated all SDKs from updated OpenAPI spec
- Models updated to match latest API schema

## [0.2.0] — 2026-05-10

### Added
- SDK wrapper classes with resource accessors
- Basic webhook signature verification
- Search functionality across all SDKs

### Changed
- Internal HTTP library modernization
- Dependency updates (axum 0.8, opentelemetry 0.32, etc.)

## [0.1.0] — 2026-05-09

### Added
- Initial SDK release
- Auto-generated SDKs from OpenAPI spec
- Published to npm, PyPI, crates.io, Maven Central, RubyGems, NuGet, Hex
