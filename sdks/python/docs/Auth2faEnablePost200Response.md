# Auth2faEnablePost200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**secret** | **str** |  | [optional] 
**qr_url** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.auth2fa_enable_post200_response import Auth2faEnablePost200Response

# TODO update the JSON string below
json = "{}"
# create an instance of Auth2faEnablePost200Response from a JSON string
auth2fa_enable_post200_response_instance = Auth2faEnablePost200Response.from_json(json)
# print the JSON string representation of the object
print(Auth2faEnablePost200Response.to_json())

# convert the object into a dict
auth2fa_enable_post200_response_dict = auth2fa_enable_post200_response_instance.to_dict()
# create an instance of Auth2faEnablePost200Response from a dict
auth2fa_enable_post200_response_from_dict = Auth2faEnablePost200Response.from_dict(auth2fa_enable_post200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


