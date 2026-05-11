# OpenapiClient::SystemStatus

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **overall_status** | **String** |  | [optional] |
| **uptime_30d** | **Float** |  | [optional] |
| **components** | [**Array&lt;SystemStatusComponentsInner&gt;**](SystemStatusComponentsInner.md) |  | [optional] |
| **checked_at** | **String** |  | [optional] |

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

