# HookSniff::SimulatorResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **delivery_id** | **String** |  |  |
| **status** | **String** |  |  |
| **latency_ms** | **Integer** | Response time from the endpoint |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::SimulatorResponse.new(
  delivery_id: null,
  status: null,
  latency_ms: null
)
```

