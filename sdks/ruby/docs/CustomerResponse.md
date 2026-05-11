# OpenapiClient::CustomerResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  | [optional] |
| **email** | **String** |  | [optional] |
| **name** | **String** |  | [optional] |
| **api_key** | **String** | Only returned on registration | [optional] |
| **plan** | **String** |  | [optional] |
| **webhook_limit** | **Integer** |  | [optional] |
| **webhook_count** | **Integer** |  | [optional] |
| **is_admin** | **Boolean** |  | [optional] |
| **created_at** | **Time** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::CustomerResponse.new(
  id: null,
  email: null,
  name: null,
  api_key: null,
  plan: null,
  webhook_limit: null,
  webhook_count: null,
  is_admin: null,
  created_at: null
)
```

