# AuthConsentPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**key** | **str** | Consent key (e.g. cookie_consent, marketing_consent) | 
**value** | **bool** |  | 

## Example

```python
from hooksniff.models.auth_consent_post_request import AuthConsentPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AuthConsentPostRequest from a JSON string
auth_consent_post_request_instance = AuthConsentPostRequest.from_json(json)
# print the JSON string representation of the object
print(AuthConsentPostRequest.to_json())

# convert the object into a dict
auth_consent_post_request_dict = auth_consent_post_request_instance.to_dict()
# create an instance of AuthConsentPostRequest from a dict
auth_consent_post_request_from_dict = AuthConsentPostRequest.from_dict(auth_consent_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


