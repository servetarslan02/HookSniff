# OpenapiClient::EndpointHealth

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **is_healthy** | **Boolean** |  |  |
| **failure_streak** | **Integer** |  | [optional] |
| **avg_response_ms** | **Integer** |  | [optional] |
| **last_failure_at** | **Time** |  | [optional] |
| **success_rate** | **Float** | Success rate as a fraction (0.0–1.0) | [optional] |
| **avg_latency_ms** | **Float** | Average delivery latency in milliseconds | [optional] |
| **last_delivery_at** | **Time** |  | [optional] |
| **total_deliveries** | **Integer** |  | [optional] |
| **failed_deliveries** | **Integer** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::EndpointHealth.new(
  endpoint_id: null,
  is_healthy: null,
  failure_streak: null,
  avg_response_ms: null,
  last_failure_at: null,
  success_rate: null,
  avg_latency_ms: null,
  last_delivery_at: null,
  total_deliveries: null,
  failed_deliveries: null
)
```

