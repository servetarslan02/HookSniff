
# AuditLogEntry

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **actor** | **kotlin.String** | Who performed the action (user id or email) |  |
| **action** | **kotlin.String** | The action taken (e.g. endpoint.create, team.invite) |  |
| **resourceType** | **kotlin.String** | Type of resource affected (endpoint, team, api_key, etc.) |  |
| **resourceId** | **kotlin.String** | ID of the affected resource |  |
| **timestamp** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **metadata** | [**kotlin.Any**](.md) | Additional context (old_value, new_value, ip, etc.) |  [optional] |



