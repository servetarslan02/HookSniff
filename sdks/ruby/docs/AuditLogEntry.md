# OpenapiClient::AuditLogEntry

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **actor** | **String** | Who performed the action (user id or email) |  |
| **action** | **String** | The action taken (e.g. endpoint.create, team.invite) |  |
| **resource_type** | **String** | Type of resource affected (endpoint, team, api_key, etc.) |  |
| **resource_id** | **String** | ID of the affected resource |  |
| **timestamp** | **Time** |  |  |
| **metadata** | **Object** | Additional context (old_value, new_value, ip, etc.) | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AuditLogEntry.new(
  id: null,
  actor: null,
  action: null,
  resource_type: null,
  resource_id: null,
  timestamp: null,
  metadata: null
)
```

