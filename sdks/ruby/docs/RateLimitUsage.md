# OpenapiClient::RateLimitUsage

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **current_rps** | **Float** | Current requests per second being consumed |  |
| **limit_rps** | **Float** | Configured requests per second limit |  |
| **remaining** | **Float** | Remaining capacity |  |
| **reset_at** | **Time** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::RateLimitUsage.new(
  current_rps: null,
  limit_rps: null,
  remaining: null,
  reset_at: null
)
```

