# OpenapiClient::AdminCreateAlertRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **customer_id** | **String** |  | [optional] |
| **name** | **String** |  |  |
| **condition** | **String** |  |  |
| **threshold** | **Integer** |  |  |
| **channels** | **Array&lt;String&gt;** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminCreateAlertRequest.new(
  customer_id: null,
  name: null,
  condition: null,
  threshold: null,
  channels: null
)
```

