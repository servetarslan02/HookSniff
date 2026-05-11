# HookSniff::CreateWebhookRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **event** | **String** | Event type (e.g. \&quot;order.created\&quot;) | [optional] |
| **data** | **Object** | Webhook payload |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::CreateWebhookRequest.new(
  endpoint_id: null,
  event: null,
  data: null
)
```

