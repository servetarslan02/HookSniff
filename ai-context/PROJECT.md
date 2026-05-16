# HookSniff - AI Context

## Proje Özeti
HookSniff — webhook delivery & management platformu. Rust tabanlı, workspace yapısı:
- `api/` — Axum REST API (auth, admin, billing, webhooks, templates)
- `worker/` — Background job worker (delivery, throttle, circuit breaker)
- `common/` — Shared utilities (SSRF, HTTP client, signing)
- `sdks/rust/` — Rust SDK
- `dashboard/` — Web dashboard (TypeScript)

## Teknoloji Stack
- **Dil:** Rust (edition 2021)
- **Web框架:** Axum
- **DB:** PostgreSQL (sqlx)
- **Cache/Queue:** Redis
- **Metrics:** Prometheus + OpenTelemetry
- **Auth:** JWT + cookie-based sessions

## Kod Kalitesi Kuralları
- `unwrap()` production kodda **yasak** — `?`, `.expect()`, veya `if let` kullan
- Test kodunda `unwrap()` kabul edilebilir
- `HeaderValue::from_static()` tercih et (parse().unwrap() yerine)

## Hafıza Dosyaları
- `ai-context/version-upgrade/` — Versiyon upgrade çalışma dosyaları
- Bu dosyalar her session'da güncellenmeli

## Session Notları
- 1 saatlik oturumlar
- Servet kod bilmiyor, tüm teknik iş AI'da
- GitHub: servetarslan02/HookSniff
