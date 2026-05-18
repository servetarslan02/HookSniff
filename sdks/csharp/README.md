# HookSniff C# SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

C# SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
dotnet add package HookSniff
```

## Quick Start

```csharp
var client = new HookSniff("hs_xxx");
var endpoints = await client.Endpoint.ListAsync();
Console.WriteLine(endpoints);
```

## Webhook Verification

```csharp
var wh = new Webhook("whsec_xxx");
var payload = wh.Verify(body, headers);
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
