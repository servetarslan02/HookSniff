# hooksniff.Model.AuditLogEntry
A single audit log record

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **Guid** |  | 
**Actor** | **string** | Who performed the action (user id or email) | 
**Action** | **string** | The action taken (e.g. endpoint.create, team.invite) | 
**ResourceType** | **string** | Type of resource affected (endpoint, team, api_key, etc.) | 
**ResourceId** | **string** | ID of the affected resource | 
**Timestamp** | **DateTime** |  | 
**Metadata** | **Object** | Additional context (old_value, new_value, ip, etc.) | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

