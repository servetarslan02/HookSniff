# HookSniff Rust SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Rust SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
[dependencies]
hooksniff = "1.0.0"
```

## Quick Start

```rust
use hooksniff::HookSniff;

let client = HookSniff::new("hs_xxx");
let endpoints = client.endpoint().list().await?;
println!("{:?}", endpoints);
```

## Webhook Verification

```rust
use hooksniff::Webhook;

let wh = Webhook::new("whsec_xxx");
payload = wh.verify(body, headers)?;
```

## Resources

| Resource | Methods |
|----------|---------|
| Endpoint | list, create, get, update, delete |
| Message | create, list, get |
| MessageAttempt | list, listByMsg, get, resend |
| Authentication | dashboardAccess |
| EventType | list |
| Statistics | aggregate |

## Links

- [Documentation](https://docs.hooksniff.com)
- [API Reference](https://api.hooksniff.com)
- [GitHub](https://github.com/servetarslan02/HookSniff)
