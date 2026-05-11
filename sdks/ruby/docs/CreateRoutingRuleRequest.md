# HookSniff::CreateRoutingRuleRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** |  |  |
| **conditions** | **Object** | Conditions that trigger this rule (e.g. event_type, header match) |  |
| **transform** | **Object** | Optional payload transformation config | [optional] |
| **target_endpoint_id** | **String** |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::CreateRoutingRuleRequest.new(
  name: null,
  conditions: null,
  transform: null,
  target_endpoint_id: null
)
```

