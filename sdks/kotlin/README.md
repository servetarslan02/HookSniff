# HookSniff Kotlin SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Kotlin SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
implementation("com.hooksniff:hooksniff:1.0.0")
```

## Quick Start

```kotlin
val client = HookSniff("hs_xxx")
val endpoints = client.endpoint.list()
println(endpoints)
```

## Webhook Verification

```kotlin
val wh = Webhook("whsec_xxx")
val payload = wh.verify(body, headers)
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
