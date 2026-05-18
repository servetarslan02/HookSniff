# AdminUsersIdStatusPutRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**is_active** | **bool** |  | [optional] 

## Example

```python
from hooksniff.models.admin_users_id_status_put_request import AdminUsersIdStatusPutRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUsersIdStatusPutRequest from a JSON string
admin_users_id_status_put_request_instance = AdminUsersIdStatusPutRequest.from_json(json)
# print the JSON string representation of the object
print(AdminUsersIdStatusPutRequest.to_json())

# convert the object into a dict
admin_users_id_status_put_request_dict = admin_users_id_status_put_request_instance.to_dict()
# create an instance of AdminUsersIdStatusPutRequest from a dict
admin_users_id_status_put_request_from_dict = AdminUsersIdStatusPutRequest.from_dict(admin_users_id_status_put_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


