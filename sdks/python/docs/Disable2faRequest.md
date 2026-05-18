# Disable2faRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**password** | **str** |  | 

## Example

```python
from hooksniff.models.disable2fa_request import Disable2faRequest

# TODO update the JSON string below
json = "{}"
# create an instance of Disable2faRequest from a JSON string
disable2fa_request_instance = Disable2faRequest.from_json(json)
# print the JSON string representation of the object
print(Disable2faRequest.to_json())

# convert the object into a dict
disable2fa_request_dict = disable2fa_request_instance.to_dict()
# create an instance of Disable2faRequest from a dict
disable2fa_request_from_dict = Disable2faRequest.from_dict(disable2fa_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


