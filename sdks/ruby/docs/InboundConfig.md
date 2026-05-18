# OpenapiClient::InboundConfig

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  | [optional] |
| **customer_id** | **String** |  | [optional] |
| **provider** | **String** | Provider name (stripe, github, shopify, generic) | [optional] |
| **secret** | **String** | Webhook signing secret | [optional] |
| **endpoint_id** | **String** |  | [optional] |
| **enabled** | **Boolean** |  | [optional] |
| **created_at** | **Time** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::InboundConfig.new(
  id: null,
  customer_id: null,
  provider: null,
  secret: null,
  endpoint_id: null,
  enabled: null,
  created_at: null
)
```

