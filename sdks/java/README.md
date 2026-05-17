# HookSniff Java SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

Java SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
<dependency>
  <groupId>com.hooksniff</groupId>
  <artifactId>hooksniff</artifactId>
  <version>1.0.0</version>
</dependency>
```

## Quick Start

```java
HookSniff client = new HookSniff("hs_xxx");
var endpoints = client.getEndpoint().list();
System.out.println(endpoints);
```

## Webhook Verification

```java
Webhook wh = new Webhook("whsec_xxx");
wh.verify(body, headers);
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
