# CreateAlertRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**condition** | **str** |  | 
**threshold** | **int** |  | 
**channels** | **List[str]** |  | 
**endpoint_id** | **UUID** |  | [optional] 

## Example

```python
from hooksniff.models.create_alert_request import CreateAlertRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateAlertRequest from a JSON string
create_alert_request_instance = CreateAlertRequest.from_json(json)
# print the JSON string representation of the object
print(CreateAlertRequest.to_json())

# convert the object into a dict
create_alert_request_dict = create_alert_request_instance.to_dict()
# create an instance of CreateAlertRequest from a dict
create_alert_request_from_dict = CreateAlertRequest.from_dict(create_alert_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


