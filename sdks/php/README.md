# HookSniff PHP SDK

<p align="center">
  <a href="https://github.com/servetarslan02/HookSniff"><img src="https://img.shields.io/github/license/servetarslan02/HookSniff" alt="License"></a>
</p>

PHP SDK for the [HookSniff](https://hooksniff.com) webhook delivery platform.

## Installation

```bash
composer require hooksniff/hooksniff
```

## Quick Start

```php
$client = new HookSniff("hs_xxx");
$endpoints = $client->endpoint->list();
print_r($endpoints);
```

## Webhook Verification

```php
$wh = new Webhook("whsec_xxx");
$payload = $wh->verify($body, $headers);
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
