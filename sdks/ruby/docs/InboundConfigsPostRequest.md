# OpenapiClient::InboundConfigsPostRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** | Provider name (stripe, github, shopify, generic) |  |
| **secret** | **String** | Webhook signing secret |  |
| **endpoint_id** | **String** | Default target endpoint | [optional] |
| **enabled** | **Boolean** |  | [optional][default to true] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::InboundConfigsPostRequest.new(
  provider: null,
  secret: null,
  endpoint_id: null,
  enabled: null
)
```

