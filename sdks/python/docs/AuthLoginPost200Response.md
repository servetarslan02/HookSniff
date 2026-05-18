# AuthLoginPost200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **str** | JWT access token | 
**customer** | [**CustomerResponse**](CustomerResponse.md) |  | 
**refresh_token** | **str** | Refresh token (when applicable) | [optional] 
**requires_2fa** | **bool** |  | 
**temp_token** | **str** |  | 
**message** | **str** |  | 

## Example

```python
from hooksniff.models.auth_login_post200_response import AuthLoginPost200Response

# TODO update the JSON string below
json = "{}"
# create an instance of AuthLoginPost200Response from a JSON string
auth_login_post200_response_instance = AuthLoginPost200Response.from_json(json)
# print the JSON string representation of the object
print(AuthLoginPost200Response.to_json())

# convert the object into a dict
auth_login_post200_response_dict = auth_login_post200_response_instance.to_dict()
# create an instance of AuthLoginPost200Response from a dict
auth_login_post200_response_from_dict = AuthLoginPost200Response.from_dict(auth_login_post200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


