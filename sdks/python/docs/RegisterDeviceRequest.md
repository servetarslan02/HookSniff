# RegisterDeviceRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **str** | FCM device token | 
**platform** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.register_device_request import RegisterDeviceRequest

# TODO update the JSON string below
json = "{}"
# create an instance of RegisterDeviceRequest from a JSON string
register_device_request_instance = RegisterDeviceRequest.from_json(json)
# print the JSON string representation of the object
print(RegisterDeviceRequest.to_json())

# convert the object into a dict
register_device_request_dict = register_device_request_instance.to_dict()
# create an instance of RegisterDeviceRequest from a dict
register_device_request_from_dict = RegisterDeviceRequest.from_dict(register_device_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


