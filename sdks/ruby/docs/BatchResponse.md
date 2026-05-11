# HookSniff::BatchResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **deliveries** | [**Array&lt;Delivery&gt;**](Delivery.md) |  |  |
| **errors** | [**Array&lt;BatchResponseErrorsInner&gt;**](BatchResponseErrorsInner.md) |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::BatchResponse.new(
  deliveries: null,
  errors: null
)
```

