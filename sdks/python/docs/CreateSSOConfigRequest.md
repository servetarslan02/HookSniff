# CreateSSOConfigRequest

Create a new SSO configuration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **str** |  | 
**domain** | **str** |  | 
**metadata_url** | **str** | URL to SAML metadata or OIDC discovery document | 

## Example

```python
from hooksniff.models.create_sso_config_request import CreateSSOConfigRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateSSOConfigRequest from a JSON string
create_sso_config_request_instance = CreateSSOConfigRequest.from_json(json)
# print the JSON string representation of the object
print(CreateSSOConfigRequest.to_json())

# convert the object into a dict
create_sso_config_request_dict = create_sso_config_request_instance.to_dict()
# create an instance of CreateSSOConfigRequest from a dict
create_sso_config_request_from_dict = CreateSSOConfigRequest.from_dict(create_sso_config_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


