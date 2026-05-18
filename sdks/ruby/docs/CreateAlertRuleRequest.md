# OpenapiClient::CreateAlertRuleRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** | Human-readable alert name |  |
| **condition** | **String** | Condition that triggers the alert |  |
| **threshold** | **Integer** | Threshold value for the condition |  |
| **channels** | **Array&lt;String&gt;** | Notification channels to alert on |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::CreateAlertRuleRequest.new(
  name: null,
  condition: null,
  threshold: null,
  channels: null
)
```

