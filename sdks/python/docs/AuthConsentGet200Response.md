# AuthConsentGet200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**consents** | **Dict[str, bool]** |  | [optional] 

## Example

```python
from hooksniff.models.auth_consent_get200_response import AuthConsentGet200Response

# TODO update the JSON string below
json = "{}"
# create an instance of AuthConsentGet200Response from a JSON string
auth_consent_get200_response_instance = AuthConsentGet200Response.from_json(json)
# print the JSON string representation of the object
print(AuthConsentGet200Response.to_json())

# convert the object into a dict
auth_consent_get200_response_dict = auth_consent_get200_response_instance.to_dict()
# create an instance of AuthConsentGet200Response from a dict
auth_consent_get200_response_from_dict = AuthConsentGet200Response.from_dict(auth_consent_get200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


