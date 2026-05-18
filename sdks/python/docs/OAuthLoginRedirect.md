# OAuthLoginRedirect

OAuth redirect information

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**redirect_url** | **str** |  | 

## Example

```python
from hooksniff.models.o_auth_login_redirect import OAuthLoginRedirect

# TODO update the JSON string below
json = "{}"
# create an instance of OAuthLoginRedirect from a JSON string
o_auth_login_redirect_instance = OAuthLoginRedirect.from_json(json)
# print the JSON string representation of the object
print(OAuthLoginRedirect.to_json())

# convert the object into a dict
o_auth_login_redirect_dict = o_auth_login_redirect_instance.to_dict()
# create an instance of OAuthLoginRedirect from a dict
o_auth_login_redirect_from_dict = OAuthLoginRedirect.from_dict(o_auth_login_redirect_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


