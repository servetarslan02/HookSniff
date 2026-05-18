# OpenapiClient::LatencyResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **p50** | **Float** | 50th percentile (median) latency in ms |  |
| **p90** | **Float** | 90th percentile latency in ms |  |
| **p95** | **Float** | 95th percentile latency in ms |  |
| **p99** | **Float** | 99th percentile latency in ms |  |
| **period** | **String** | Time range of the data |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::LatencyResponse.new(
  p50: null,
  p90: null,
  p95: null,
  p99: null,
  period: null
)
```

