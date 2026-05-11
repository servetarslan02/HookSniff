# SSOConfigListResponse

List of SSO configurations for the account

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[SSOConfig]**](SSOConfig.md) |  | 

## Example

```python
from hooksniff.models.sso_config_list_response import SSOConfigListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of SSOConfigListResponse from a JSON string
sso_config_list_response_instance = SSOConfigListResponse.from_json(json)
# print the JSON string representation of the object
print(SSOConfigListResponse.to_json())

# convert the object into a dict
sso_config_list_response_dict = sso_config_list_response_instance.to_dict()
# create an instance of SSOConfigListResponse from a dict
sso_config_list_response_from_dict = SSOConfigListResponse.from_dict(sso_config_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


