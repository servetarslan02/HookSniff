# OpenapiClient::AdminAlertRule

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **customer_id** | **String** |  | [optional] |
| **customer_email** | **String** |  | [optional] |
| **name** | **String** |  |  |
| **condition** | **String** |  |  |
| **threshold** | **Integer** |  |  |
| **channels** | **Array&lt;String&gt;** |  |  |
| **is_active** | **Boolean** |  |  |
| **created_at** | **Time** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminAlertRule.new(
  id: null,
  customer_id: null,
  customer_email: null,
  name: null,
  condition: null,
  threshold: null,
  channels: null,
  is_active: null,
  created_at: null
)
```

