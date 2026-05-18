# OpenapiClient::CreateWebhookRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **event** | **String** | Event type (e.g. \&quot;order.created\&quot;) | [optional] |
| **data** | **Object** | Webhook payload |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::CreateWebhookRequest.new(
  endpoint_id: null,
  event: null,
  data: null
)
```

