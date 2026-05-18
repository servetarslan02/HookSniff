# AdminUsersIdGet200ResponseEndpointsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**url** | **str** |  | [optional] 
**description** | **str** |  | [optional] 
**is_active** | **bool** |  | [optional] 
**created_at** | **datetime** |  | [optional] 

## Example

```python
from hooksniff.models.admin_users_id_get200_response_endpoints_inner import AdminUsersIdGet200ResponseEndpointsInner

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUsersIdGet200ResponseEndpointsInner from a JSON string
admin_users_id_get200_response_endpoints_inner_instance = AdminUsersIdGet200ResponseEndpointsInner.from_json(json)
# print the JSON string representation of the object
print(AdminUsersIdGet200ResponseEndpointsInner.to_json())

# convert the object into a dict
admin_users_id_get200_response_endpoints_inner_dict = admin_users_id_get200_response_endpoints_inner_instance.to_dict()
# create an instance of AdminUsersIdGet200ResponseEndpointsInner from a dict
admin_users_id_get200_response_endpoints_inner_from_dict = AdminUsersIdGet200ResponseEndpointsInner.from_dict(admin_users_id_get200_response_endpoints_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


