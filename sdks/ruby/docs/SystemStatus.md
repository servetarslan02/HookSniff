# OpenapiClient::SystemStatus

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **overall_status** | **String** |  |  |
| **uptime_30d** | **Float** |  |  |
| **components** | [**Array&lt;SystemStatusComponentsInner&gt;**](SystemStatusComponentsInner.md) |  |  |
| **checked_at** | **String** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SystemStatus.new(
  overall_status: null,
  uptime_30d: null,
  components: null,
  checked_at: null
)
```

