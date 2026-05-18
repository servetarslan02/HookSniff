# DeviceTokenResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**token** | **str** |  | 
**platform** | **str** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.device_token_response import DeviceTokenResponse

# TODO update the JSON string below
json = "{}"
# create an instance of DeviceTokenResponse from a JSON string
device_token_response_instance = DeviceTokenResponse.from_json(json)
# print the JSON string representation of the object
print(DeviceTokenResponse.to_json())

# convert the object into a dict
device_token_response_dict = device_token_response_instance.to_dict()
# create an instance of DeviceTokenResponse from a dict
device_token_response_from_dict = DeviceTokenResponse.from_dict(device_token_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


