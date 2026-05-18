# OpenapiClient::AnalyticsTrendPoint

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **date** | **Date** | Date of the data point |  |
| **total** | **Integer** | Total deliveries on this date |  |
| **successful** | **Integer** | Successfully delivered on this date |  |
| **failed** | **Integer** | Failed deliveries on this date |  |
| **avg_latency_ms** | **Float** | Average delivery latency in milliseconds | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AnalyticsTrendPoint.new(
  date: null,
  total: null,
  successful: null,
  failed: null,
  avg_latency_ms: null
)
```

