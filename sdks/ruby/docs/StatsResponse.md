# OpenapiClient::StatsResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **total_deliveries** | **Integer** |  |  |
| **successful_deliveries** | **Integer** |  |  |
| **failed_deliveries** | **Integer** |  |  |
| **total_endpoints** | **Integer** |  |  |
| **active_endpoints** | **Integer** |  |  |
| **plan** | **String** |  |  |
| **webhook_limit** | **Integer** |  |  |
| **webhook_count** | **Integer** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::StatsResponse.new(
  total_deliveries: null,
  successful_deliveries: null,
  failed_deliveries: null,
  total_endpoints: null,
  active_endpoints: null,
  plan: null,
  webhook_limit: null,
  webhook_count: null
)
```

