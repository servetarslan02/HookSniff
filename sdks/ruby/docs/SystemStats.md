# OpenapiClient::SystemStats

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **total_users** | **Integer** |  |  |
| **active_users** | **Integer** |  |  |
| **total_endpoints** | **Integer** |  |  |
| **total_deliveries** | **Integer** |  |  |
| **plan_breakdown** | [**Array&lt;SystemStatsPlanBreakdownInner&gt;**](SystemStatsPlanBreakdownInner.md) |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SystemStats.new(
  total_users: null,
  active_users: null,
  total_endpoints: null,
  total_deliveries: null,
  plan_breakdown: null
)
```

