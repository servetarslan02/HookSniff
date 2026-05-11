# HookSniff::RateLimitConfig

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **requests_per_second** | **Integer** | Maximum requests per second allowed |  |
| **burst_size** | **Integer** | Maximum burst above steady-state rate |  |
| **enabled** | **Boolean** |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::RateLimitConfig.new(
  requests_per_second: null,
  burst_size: null,
  enabled: null
)
```

