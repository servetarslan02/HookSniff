# OpenapiClient::CustomerResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **email** | **String** |  |  |
| **name** | **String** |  | [optional] |
| **api_key** | **String** | Only returned on registration | [optional] |
| **plan** | **String** |  |  |
| **webhook_limit** | **Integer** |  |  |
| **webhook_count** | **Integer** |  |  |
| **is_admin** | **Boolean** |  |  |
| **created_at** | **Time** |  |  |

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

