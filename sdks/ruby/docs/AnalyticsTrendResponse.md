# HookSniff::AnalyticsTrendResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **data** | [**Array&lt;AnalyticsTrendPoint&gt;**](AnalyticsTrendPoint.md) | Array of trend data points |  |
| **period** | **String** | Time range of the data |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::AnalyticsTrendResponse.new(
  data: null,
  period: null
)
```

