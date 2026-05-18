# AdminUsersIdGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**user** | [**UserSummary**](UserSummary.md) |  | [optional] 
**endpoints** | [**List[AdminUsersIdGet200ResponseEndpointsInner]**](AdminUsersIdGet200ResponseEndpointsInner.md) |  | [optional] 
**recent_deliveries** | [**List[AdminUsersIdGet200ResponseRecentDeliveriesInner]**](AdminUsersIdGet200ResponseRecentDeliveriesInner.md) |  | [optional] 
**usage_stats** | [**AdminUsersIdGet200ResponseUsageStats**](AdminUsersIdGet200ResponseUsageStats.md) |  | [optional] 

## Example

```python
from hooksniff.models.admin_users_id_get200_response import AdminUsersIdGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUsersIdGet200Response from a JSON string
admin_users_id_get200_response_instance = AdminUsersIdGet200Response.from_json(json)
# print the JSON string representation of the object
print(AdminUsersIdGet200Response.to_json())

# convert the object into a dict
admin_users_id_get200_response_dict = admin_users_id_get200_response_instance.to_dict()
# create an instance of AdminUsersIdGet200Response from a dict
admin_users_id_get200_response_from_dict = AdminUsersIdGet200Response.from_dict(admin_users_id_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


