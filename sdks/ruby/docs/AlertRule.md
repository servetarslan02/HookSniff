# OpenapiClient::AlertRule

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  | [optional] |
| **name** | **String** |  | [optional] |
| **condition** | **String** |  | [optional] |
| **threshold** | **Integer** |  | [optional] |
| **channels** | **Array&lt;String&gt;** |  | [optional] |
| **is_active** | **Boolean** |  | [optional] |
| **created_at** | **String** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AlertRule.new(
  id: null,
  name: null,
  condition: null,
  threshold: null,
  channels: null,
  is_active: null,
  created_at: null
)
```

