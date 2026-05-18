# OpenapiClient::SimulatorRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **event_type** | **String** | Event type to simulate (e.g. order.created) |  |
| **payload** | **Object** | The webhook payload to deliver |  |
| **delay_ms** | **Integer** | Artificial delay before delivery (for testing timeouts) | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SimulatorRequest.new(
  endpoint_id: null,
  event_type: null,
  payload: null,
  delay_ms: null
)
```

