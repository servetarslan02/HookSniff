# OpenapiClient::UsageStatsResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoints_count** | **Integer** | Number of active endpoints |  |
| **deliveries_count** | **Integer** | Total deliveries in current period |  |
| **teams_count** | **Integer** | Number of teams |  |
| **storage_used_bytes** | **Integer** | Storage used in bytes |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::UsageStatsResponse.new(
  endpoints_count: null,
  deliveries_count: null,
  teams_count: null,
  storage_used_bytes: null
)
```

