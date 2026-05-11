# HookSniff::InboundWebhookRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** | Provider name (e.g. stripe, github, shopify) |  |
| **payload** | **Object** | Raw webhook payload body |  |
| **headers** | **Object** | HTTP headers from the incoming webhook request | [optional] |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::InboundWebhookRequest.new(
  provider: null,
  payload: null,
  headers: null
)
```

