# OpenapiClient::StatsResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **total_deliveries** | **Integer** |  | [optional] |
| **successful_deliveries** | **Integer** |  | [optional] |
| **failed_deliveries** | **Integer** |  | [optional] |
| **total_endpoints** | **Integer** |  | [optional] |
| **active_endpoints** | **Integer** |  | [optional] |
| **plan** | **String** |  | [optional] |
| **webhook_limit** | **Integer** |  | [optional] |
| **webhook_count** | **Integer** |  | [optional] |

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

