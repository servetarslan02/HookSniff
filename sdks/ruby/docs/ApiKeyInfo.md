# OpenapiClient::ApiKeyInfo

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **prefix** | **String** | Masked key prefix (e.g. \&quot;hs_abc1...\&quot;) |  |
| **created_at** | **Time** |  |  |
| **last_used_at** | **String** |  | [optional] |
| **is_active** | **Boolean** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::ApiKeyInfo.new(
  id: null,
  prefix: null,
  created_at: null,
  last_used_at: null,
  is_active: null
)
```

