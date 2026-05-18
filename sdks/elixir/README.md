# HookSniff Elixir SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Elixir SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
{ :hooksniff, "~> 1.0" }
```

## Quick Start

```elixir
client = HookSniff.new("hs_xxx")
{:ok, endpoints} = HookSniff.Endpoint.list(client)
IO.inspect(endpoints)
```

## Webhook Verification

```elixir
{:ok, payload} = HookSniff.Webhook.verify(body, headers, "whsec_xxx")
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
