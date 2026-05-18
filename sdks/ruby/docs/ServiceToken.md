# OpenapiClient::ServiceToken

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  | [optional] |
| **name** | **String** |  | [optional] |
| **token_prefix** | **String** | Token prefix (first 24 chars + ...) | [optional] |
| **created_at** | **Time** |  | [optional] |
| **last_used_at** | **Time** |  | [optional] |
| **is_active** | **Boolean** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::ServiceToken.new(
  id: null,
  name: null,
  token_prefix: null,
  created_at: null,
  last_used_at: null,
  is_active: null
)
```

