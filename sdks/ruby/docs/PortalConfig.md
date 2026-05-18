# OpenapiClient::PortalConfig

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **logo_url** | **String** |  | [optional] |
| **primary_color** | **String** | Hex color code (e.g. | [optional] |
| **custom_domain** | **String** |  | [optional] |
| **webhook_events** | **Array&lt;String&gt;** | Event types to expose in the portal | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::PortalConfig.new(
  logo_url: null,
  primary_color: null,
  custom_domain: null,
  webhook_events: null
)
```

