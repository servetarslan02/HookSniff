# OpenapiClient::RateLimitConfig

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **requests_per_second** | **Integer** | Maximum requests per second allowed |  |
| **burst_size** | **Integer** | Maximum burst above steady-state rate |  |
| **enabled** | **Boolean** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::RateLimitConfig.new(
  requests_per_second: null,
  burst_size: null,
  enabled: null
)
```

