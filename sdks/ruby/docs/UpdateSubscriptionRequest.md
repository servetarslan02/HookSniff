# HooksniffSdk::UpdateSubscriptionRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **plan** | **String** | Target plan name |  |
| **proration** | **Boolean** | Whether to prorate charges for the current billing period | [optional][default to true] |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::UpdateSubscriptionRequest.new(
  plan: null,
  proration: null
)
```

