# SsoConfigPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **str** |  | [optional] 
**enabled** | **bool** |  | [optional] 

## Example

```python
from hooksniff.models.sso_config_post_request import SsoConfigPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of SsoConfigPostRequest from a JSON string
sso_config_post_request_instance = SsoConfigPostRequest.from_json(json)
# print the JSON string representation of the object
print(SsoConfigPostRequest.to_json())

# convert the object into a dict
sso_config_post_request_dict = sso_config_post_request_instance.to_dict()
# create an instance of SsoConfigPostRequest from a dict
sso_config_post_request_from_dict = SsoConfigPostRequest.from_dict(sso_config_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


