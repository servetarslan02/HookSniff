# AdminCreateAlertRequest

Create a platform alert rule (admin)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**customer_id** | **UUID** |  | [optional] 
**name** | **str** |  | 
**condition** | **str** |  | 
**threshold** | **int** |  | 
**channels** | **List[str]** |  | 

## Example

```python
from hooksniff.models.admin_create_alert_request import AdminCreateAlertRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminCreateAlertRequest from a JSON string
admin_create_alert_request_instance = AdminCreateAlertRequest.from_json(json)
# print the JSON string representation of the object
print(AdminCreateAlertRequest.to_json())

# convert the object into a dict
admin_create_alert_request_dict = admin_create_alert_request_instance.to_dict()
# create an instance of AdminCreateAlertRequest from a dict
admin_create_alert_request_from_dict = AdminCreateAlertRequest.from_dict(admin_create_alert_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


