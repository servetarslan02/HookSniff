# AdminAuditEntry

A single admin audit log entry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**customer_id** | **UUID** |  | 
**action** | **str** |  | 
**resource_type** | **str** |  | 
**resource_id** | **str** |  | [optional] 
**details** | **object** |  | [optional] 
**ip_address** | **str** |  | [optional] 
**user_agent** | **str** |  | [optional] 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.admin_audit_entry import AdminAuditEntry

# TODO update the JSON string below
json = "{}"
# create an instance of AdminAuditEntry from a JSON string
admin_audit_entry_instance = AdminAuditEntry.from_json(json)
# print the JSON string representation of the object
print(AdminAuditEntry.to_json())

# convert the object into a dict
admin_audit_entry_dict = admin_audit_entry_instance.to_dict()
# create an instance of AdminAuditEntry from a dict
admin_audit_entry_from_dict = AdminAuditEntry.from_dict(admin_audit_entry_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


