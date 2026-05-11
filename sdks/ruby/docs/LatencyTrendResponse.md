# OpenapiClient::LatencyTrendResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  | [optional] |
| **buckets** | [**Array&lt;LatencyTrendResponseBucketsInner&gt;**](LatencyTrendResponseBucketsInner.md) |  | [optional] |
| **overall_avg_ms** | **Float** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::LatencyTrendResponse.new(
  range: null,
  buckets: null,
  overall_avg_ms: null
)
```

