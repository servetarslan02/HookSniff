# AuditLogEntry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **string** |  |
**actor** | **string** | Who performed the action (user id or email) |
**action** | **string** | The action taken (e.g. endpoint.create, team.invite) |
**resource_type** | **string** | Type of resource affected (endpoint, team, api_key, etc.) |
**resource_id** | **string** | ID of the affected resource |
**timestamp** | **\DateTime** |  |
**metadata** | **object** | Additional context (old_value, new_value, ip, etc.) | [optional]

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
