# AdminUsersIdGet200ResponseRecentDeliveriesInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**endpoint_id** | **UUID** |  | [optional] 
**status** | **str** |  | [optional] 
**event_type** | **str** |  | [optional] 
**created_at** | **datetime** |  | [optional] 
**attempt_count** | **int** |  | [optional] 

## Example

```python
from hooksniff.models.admin_users_id_get200_response_recent_deliveries_inner import AdminUsersIdGet200ResponseRecentDeliveriesInner

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUsersIdGet200ResponseRecentDeliveriesInner from a JSON string
admin_users_id_get200_response_recent_deliveries_inner_instance = AdminUsersIdGet200ResponseRecentDeliveriesInner.from_json(json)
# print the JSON string representation of the object
print(AdminUsersIdGet200ResponseRecentDeliveriesInner.to_json())

# convert the object into a dict
admin_users_id_get200_response_recent_deliveries_inner_dict = admin_users_id_get200_response_recent_deliveries_inner_instance.to_dict()
# create an instance of AdminUsersIdGet200ResponseRecentDeliveriesInner from a dict
admin_users_id_get200_response_recent_deliveries_inner_from_dict = AdminUsersIdGet200ResponseRecentDeliveriesInner.from_dict(admin_users_id_get200_response_recent_deliveries_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


