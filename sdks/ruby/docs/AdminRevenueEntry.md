# HookSniff::AdminRevenueEntry

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **date** | **Date** |  |  |
| **mrr** | **Float** | Monthly recurring revenue in dollars |  |
| **new_subscriptions** | **Integer** |  |  |
| **churns** | **Integer** |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::AdminRevenueEntry.new(
  date: null,
  mrr: null,
  new_subscriptions: null,
  churns: null
)
```

