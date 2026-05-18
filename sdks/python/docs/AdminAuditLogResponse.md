# AdminAuditLogResponse

Paginated admin audit log response

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**entries** | [**List[AdminAuditEntry]**](AdminAuditEntry.md) |  | 
**total** | **int** |  | 
**page** | **int** |  | 
**per_page** | **int** |  | 

## Example

```python
from hooksniff.models.admin_audit_log_response import AdminAuditLogResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AdminAuditLogResponse from a JSON string
admin_audit_log_response_instance = AdminAuditLogResponse.from_json(json)
# print the JSON string representation of the object
print(AdminAuditLogResponse.to_json())

# convert the object into a dict
admin_audit_log_response_dict = admin_audit_log_response_instance.to_dict()
# create an instance of AdminAuditLogResponse from a dict
admin_audit_log_response_from_dict = AdminAuditLogResponse.from_dict(admin_audit_log_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


