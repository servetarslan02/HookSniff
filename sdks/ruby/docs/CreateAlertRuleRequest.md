# HookSniff::CreateAlertRuleRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** | Human-readable alert name |  |
| **condition** | **String** | Condition that triggers the alert |  |
| **threshold** | **Integer** | Threshold value for the condition |  |
| **channels** | **Array&lt;String&gt;** | Notification channels to alert on |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::CreateAlertRuleRequest.new(
  name: null,
  condition: null,
  threshold: null,
  channels: null
)
```

