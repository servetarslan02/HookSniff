# HooksniffSdk::LatencyTrendResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **range** | **String** |  |  |
| **buckets** | [**Array&lt;LatencyTrendResponseBucketsInner&gt;**](LatencyTrendResponseBucketsInner.md) |  |  |
| **overall_avg_ms** | **Float** |  |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::LatencyTrendResponse.new(
  range: null,
  buckets: null,
  overall_avg_ms: null
)
```

