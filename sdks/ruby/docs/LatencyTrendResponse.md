# OpenapiClient::LatencyTrendResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  |  |
| **buckets** | [**Array&lt;LatencyTrendResponseBucketsInner&gt;**](LatencyTrendResponseBucketsInner.md) |  |  |
| **overall_avg_ms** | **Float** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::LatencyTrendResponse.new(
  range: null,
  buckets: null,
  overall_avg_ms: null
)
```

