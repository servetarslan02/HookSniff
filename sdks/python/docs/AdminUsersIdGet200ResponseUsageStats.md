# AdminUsersIdGet200ResponseUsageStats


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**total_deliveries** | **int** |  | [optional] 
**success_rate** | **float** |  | [optional] 
**endpoints_count** | **int** |  | [optional] 

## Example

```python
from hooksniff.models.admin_users_id_get200_response_usage_stats import AdminUsersIdGet200ResponseUsageStats

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUsersIdGet200ResponseUsageStats from a JSON string
admin_users_id_get200_response_usage_stats_instance = AdminUsersIdGet200ResponseUsageStats.from_json(json)
# print the JSON string representation of the object
print(AdminUsersIdGet200ResponseUsageStats.to_json())

# convert the object into a dict
admin_users_id_get200_response_usage_stats_dict = admin_users_id_get200_response_usage_stats_instance.to_dict()
# create an instance of AdminUsersIdGet200ResponseUsageStats from a dict
admin_users_id_get200_response_usage_stats_from_dict = AdminUsersIdGet200ResponseUsageStats.from_dict(admin_users_id_get200_response_usage_stats_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


