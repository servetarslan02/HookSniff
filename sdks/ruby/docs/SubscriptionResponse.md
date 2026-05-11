# OpenapiClient::SubscriptionResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **plan** | **String** |  | [optional] |
| **status** | **String** |  | [optional] |
| **payment_provider** | **String** |  | [optional] |
| **webhook_limit** | **Integer** |  | [optional] |
| **endpoint_limit** | **Integer** |  | [optional] |
| **retention_days** | **Integer** |  | [optional] |
| **monthly_price_cents** | **Integer** |  | [optional] |

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

