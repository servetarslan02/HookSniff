# OAuthProviderListResponse

List of available OAuth providers

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[OAuthProvider]**](OAuthProvider.md) |  | 

## Example

```python
from hooksniff.models.o_auth_provider_list_response import OAuthProviderListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of OAuthProviderListResponse from a JSON string
o_auth_provider_list_response_instance = OAuthProviderListResponse.from_json(json)
# print the JSON string representation of the object
print(OAuthProviderListResponse.to_json())

# convert the object into a dict
o_auth_provider_list_response_dict = o_auth_provider_list_response_instance.to_dict()
# create an instance of OAuthProviderListResponse from a dict
o_auth_provider_list_response_from_dict = OAuthProviderListResponse.from_dict(o_auth_provider_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


