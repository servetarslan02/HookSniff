# OpenapiClient::UsageResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **plan** | **String** |  | [optional] |
| **period_start** | **Time** |  | [optional] |
| **period_end** | **Time** |  | [optional] |
| **webhooks_used** | **Integer** |  | [optional] |
| **webhooks_limit** | **Integer** |  | [optional] |
| **endpoints_used** | **Integer** |  | [optional] |
| **endpoints_limit** | **Integer** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::UsageResponse.new(
  plan: null,
  period_start: null,
  period_end: null,
  webhooks_used: null,
  webhooks_limit: null,
  endpoints_used: null,
  endpoints_limit: null
)
```

