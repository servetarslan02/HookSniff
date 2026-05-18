# OpenapiClient::SubscriptionResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **plan** | **String** |  |  |
| **status** | **String** |  |  |
| **payment_provider** | **String** |  |  |
| **webhook_limit** | **Integer** |  |  |
| **endpoint_limit** | **Integer** |  |  |
| **retention_days** | **Integer** |  |  |
| **monthly_price_cents** | **Integer** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SubscriptionResponse.new(
  plan: null,
  status: null,
  payment_provider: null,
  webhook_limit: null,
  endpoint_limit: null,
  retention_days: null,
  monthly_price_cents: null
)
```

