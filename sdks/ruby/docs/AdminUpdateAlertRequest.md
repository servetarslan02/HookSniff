# OpenapiClient::AdminUpdateAlertRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** |  | [optional] |
| **condition** | **String** |  | [optional] |
| **threshold** | **Integer** |  | [optional] |
| **channels** | **Array&lt;String&gt;** |  | [optional] |
| **is_active** | **Boolean** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminUpdateAlertRequest.new(
  name: null,
  condition: null,
  threshold: null,
  channels: null,
  is_active: null
)
```

