# Enable2faResponse

TOTP secret and QR code URL returned after enabling 2FA

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**secret** | **str** | TOTP secret key | 
**qr_url** | **str** | QR code provisioning URL | 

## Example

```python
from hooksniff.models.enable2fa_response import Enable2faResponse

# TODO update the JSON string below
json = "{}"
# create an instance of Enable2faResponse from a JSON string
enable2fa_response_instance = Enable2faResponse.from_json(json)
# print the JSON string representation of the object
print(Enable2faResponse.to_json())

# convert the object into a dict
enable2fa_response_dict = enable2fa_response_instance.to_dict()
# create an instance of Enable2faResponse from a dict
enable2fa_response_from_dict = Enable2faResponse.from_dict(enable2fa_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


