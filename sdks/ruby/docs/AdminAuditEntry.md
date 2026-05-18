# OpenapiClient::AdminAuditEntry

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **customer_id** | **String** |  |  |
| **action** | **String** |  |  |
| **resource_type** | **String** |  |  |
| **resource_id** | **String** |  | [optional] |
| **details** | **Object** |  | [optional] |
| **ip_address** | **String** |  | [optional] |
| **user_agent** | **String** |  | [optional] |
| **created_at** | **Time** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminAuditEntry.new(
  id: null,
  customer_id: null,
  action: null,
  resource_type: null,
  resource_id: null,
  details: null,
  ip_address: null,
  user_agent: null,
  created_at: null
)
```

