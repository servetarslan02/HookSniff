# TwoFactorRequiredResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**requires_2fa** | **bool** |  | 
**temp_token** | **str** |  | 
**message** | **str** |  | 

## Example

```python
from hooksniff.models.two_factor_required_response import TwoFactorRequiredResponse

# TODO update the JSON string below
json = "{}"
# create an instance of TwoFactorRequiredResponse from a JSON string
two_factor_required_response_instance = TwoFactorRequiredResponse.from_json(json)
# print the JSON string representation of the object
print(TwoFactorRequiredResponse.to_json())

# convert the object into a dict
two_factor_required_response_dict = two_factor_required_response_instance.to_dict()
# create an instance of TwoFactorRequiredResponse from a dict
two_factor_required_response_from_dict = TwoFactorRequiredResponse.from_dict(two_factor_required_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


