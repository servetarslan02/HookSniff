# HooksniffSdk::InboundWebhookRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** | Provider name (e.g. stripe, github, shopify) |  |
| **payload** | **Object** | Raw webhook payload body |  |
| **headers** | **Object** | HTTP headers from the incoming webhook request | [optional] |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::InboundWebhookRequest.new(
  provider: null,
  payload: null,
  headers: null
)
```

