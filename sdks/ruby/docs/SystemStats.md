# OpenapiClient::SystemStats

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **total_users** | **Integer** |  | [optional] |
| **active_users** | **Integer** |  | [optional] |
| **total_endpoints** | **Integer** |  | [optional] |
| **total_deliveries** | **Integer** |  | [optional] |
| **plan_breakdown** | [**Array&lt;SystemStatsPlanBreakdownInner&gt;**](SystemStatsPlanBreakdownInner.md) |  | [optional] |

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

