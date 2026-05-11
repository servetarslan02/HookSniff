# ResendVerificationRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **str** |  | 

## Example

```python
from hooksniff.models.resend_verification_request import ResendVerificationRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ResendVerificationRequest from a JSON string
resend_verification_request_instance = ResendVerificationRequest.from_json(json)
# print the JSON string representation of the object
print(ResendVerificationRequest.to_json())

# convert the object into a dict
resend_verification_request_dict = resend_verification_request_instance.to_dict()
# create an instance of ResendVerificationRequest from a dict
resend_verification_request_from_dict = ResendVerificationRequest.from_dict(resend_verification_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


