# AuditLogEntry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**actor** | **String** | Who performed the action (user id or email) | 
**action** | **String** | The action taken (e.g. endpoint.create, team.invite) | 
**resource_type** | **String** | Type of resource affected (endpoint, team, api_key, etc.) | 
**resource_id** | **String** | ID of the affected resource | 
**timestamp** | **chrono::DateTime<chrono::FixedOffset>** |  | 
**metadata** | Option<**serde_json::Value**> | Additional context (old_value, new_value, ip, etc.) | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


