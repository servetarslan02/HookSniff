# AdminSystemStatus

System-level status for admin dashboard

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **str** |  | 
**uptime_seconds** | **int** |  | 
**db_status** | **str** |  | 
**redis_status** | **str** |  | 
**queue_depth** | **int** | Number of pending jobs in the delivery queue | 

## Example

```python
from hooksniff.models.admin_system_status import AdminSystemStatus

# TODO update the JSON string below
json = "{}"
# create an instance of AdminSystemStatus from a JSON string
admin_system_status_instance = AdminSystemStatus.from_json(json)
# print the JSON string representation of the object
print(AdminSystemStatus.to_json())

# convert the object into a dict
admin_system_status_dict = admin_system_status_instance.to_dict()
# create an instance of AdminSystemStatus from a dict
admin_system_status_from_dict = AdminSystemStatus.from_dict(admin_system_status_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


