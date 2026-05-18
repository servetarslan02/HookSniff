# Confirm2faRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**code** | **str** |  | 

## Example

```python
from hooksniff.models.confirm2fa_request import Confirm2faRequest

# TODO update the JSON string below
json = "{}"
# create an instance of Confirm2faRequest from a JSON string
confirm2fa_request_instance = Confirm2faRequest.from_json(json)
# print the JSON string representation of the object
print(Confirm2faRequest.to_json())

# convert the object into a dict
confirm2fa_request_dict = confirm2fa_request_instance.to_dict()
# create an instance of Confirm2faRequest from a dict
confirm2fa_request_from_dict = Confirm2faRequest.from_dict(confirm2fa_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


