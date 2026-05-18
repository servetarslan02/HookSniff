# AdminUpdateAlertRequest

Update an alert rule (admin, all fields optional)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | [optional] 
**condition** | **str** |  | [optional] 
**threshold** | **int** |  | [optional] 
**channels** | **List[str]** |  | [optional] 
**is_active** | **bool** |  | [optional] 

## Example

```python
from hooksniff.models.admin_update_alert_request import AdminUpdateAlertRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminUpdateAlertRequest from a JSON string
admin_update_alert_request_instance = AdminUpdateAlertRequest.from_json(json)
# print the JSON string representation of the object
print(AdminUpdateAlertRequest.to_json())

# convert the object into a dict
admin_update_alert_request_dict = admin_update_alert_request_instance.to_dict()
# create an instance of AdminUpdateAlertRequest from a dict
admin_update_alert_request_from_dict = AdminUpdateAlertRequest.from_dict(admin_update_alert_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


