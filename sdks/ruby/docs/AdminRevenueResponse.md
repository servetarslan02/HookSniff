# HookSniff::AdminRevenueResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **data** | [**Array&lt;AdminRevenueEntry&gt;**](AdminRevenueEntry.md) |  |  |
| **total_mrr** | **Float** | Current total MRR across all subscriptions |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::AdminRevenueResponse.new(
  data: null,
  total_mrr: null
)
```

