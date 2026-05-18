# Verify2faRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**temp_token** | **str** |  | 
**code** | **str** |  | 

## Example

```python
from hooksniff.models.verify2fa_request import Verify2faRequest

# TODO update the JSON string below
json = "{}"
# create an instance of Verify2faRequest from a JSON string
verify2fa_request_instance = Verify2faRequest.from_json(json)
# print the JSON string representation of the object
print(Verify2faRequest.to_json())

# convert the object into a dict
verify2fa_request_dict = verify2fa_request_instance.to_dict()
# create an instance of Verify2faRequest from a dict
verify2fa_request_from_dict = Verify2faRequest.from_dict(verify2fa_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


