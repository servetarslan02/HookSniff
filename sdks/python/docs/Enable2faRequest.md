# Enable2faRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**password** | **str** |  | 

## Example

```python
from hooksniff.models.enable2fa_request import Enable2faRequest

# TODO update the JSON string below
json = "{}"
# create an instance of Enable2faRequest from a JSON string
enable2fa_request_instance = Enable2faRequest.from_json(json)
# print the JSON string representation of the object
print(Enable2faRequest.to_json())

# convert the object into a dict
enable2fa_request_dict = enable2fa_request_instance.to_dict()
# create an instance of Enable2faRequest from a dict
enable2fa_request_from_dict = Enable2faRequest.from_dict(enable2fa_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


