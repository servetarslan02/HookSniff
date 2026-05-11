# AuditLogEntry

A single audit log record

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**actor** | **str** | Who performed the action (user id or email) | 
**action** | **str** | The action taken (e.g. endpoint.create, team.invite) | 
**resource_type** | **str** | Type of resource affected (endpoint, team, api_key, etc.) | 
**resource_id** | **str** | ID of the affected resource | 
**timestamp** | **datetime** |  | 
**metadata** | **object** | Additional context (old_value, new_value, ip, etc.) | [optional] 

## Example

```python
from hooksniff.models.audit_log_entry import AuditLogEntry

# TODO update the JSON string below
json = "{}"
# create an instance of AuditLogEntry from a JSON string
audit_log_entry_instance = AuditLogEntry.from_json(json)
# print the JSON string representation of the object
print(AuditLogEntry.to_json())

# convert the object into a dict
audit_log_entry_dict = audit_log_entry_instance.to_dict()
# create an instance of AuditLogEntry from a dict
audit_log_entry_from_dict = AuditLogEntry.from_dict(audit_log_entry_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


