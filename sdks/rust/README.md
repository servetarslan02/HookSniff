# HookSniff Rust SDK

Adapted from Svix SDK architecture for HookSniff webhook delivery platform.

## Installation

```toml
[dependencies]
hooksniff = "1.0"
```

## Quick Start

```rust
use hooksniff::HookSniff;

#[tokio::main]
async fn main() {
    let hs = HookSniff::new("hooksniff_xxx").unwrap();
    let endpoints = hs.endpoint().list(None).await.unwrap();
    println!("{:?}", endpoints);
}
```

## Resources

| Resource | Description |
|----------|-------------|
| `hs.endpoint()` | Endpoint CRUD, secrets, stats |
| `hs.message()` | Send webhooks, list deliveries |
| `hs.message_attempt()` | Delivery attempts |
| `hs.authentication()` | Login, register, profile |
| `hs.event_type()` | Event type management |
| `hs.statistics()` | Analytics & stats |

## License

MIT
