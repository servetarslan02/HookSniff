# OpenapiClient::ApiKeyInfo

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  | [optional] |
| **prefix** | **String** | Masked key prefix (e.g. \&quot;hs_abc1...\&quot;) | [optional] |
| **created_at** | **String** |  | [optional] |
| **last_used_at** | **String** |  | [optional] |
| **is_active** | **Boolean** |  | [optional] |

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

