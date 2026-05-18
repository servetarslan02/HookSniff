

# AuditLogEntry

A single audit log record

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  |
|**actor** | **String** | Who performed the action (user id or email) |  |
|**action** | **String** | The action taken (e.g. endpoint.create, team.invite) |  |
|**resourceType** | **String** | Type of resource affected (endpoint, team, api_key, etc.) |  |
|**resourceId** | **String** | ID of the affected resource |  |
|**timestamp** | **OffsetDateTime** |  |  |
|**metadata** | **Object** | Additional context (old_value, new_value, ip, etc.) |  [optional] |



