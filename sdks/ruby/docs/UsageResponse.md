# OpenapiClient::UsageResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **plan** | **String** |  |  |
| **period_start** | **Time** |  |  |
| **period_end** | **Time** |  |  |
| **webhooks_used** | **Integer** |  |  |
| **webhooks_limit** | **Integer** |  |  |
| **endpoints_used** | **Integer** |  |  |
| **endpoints_limit** | **Integer** |  |  |

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

