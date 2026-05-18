# SSOConfig

Single Sign-On configuration (SAML or OIDC)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **str** |  | 
**domain** | **str** | Email domain for SSO routing | 
**entity_id** | **str** | SAML entity ID or OIDC issuer | [optional] 
**sso_url** | **str** |  | [optional] 
**certificate** | **str** | PEM-encoded X.509 certificate (SAML) | [optional] 

## Example

```python
from hooksniff.models.sso_config import SSOConfig

# TODO update the JSON string below
json = "{}"
# create an instance of SSOConfig from a JSON string
sso_config_instance = SSOConfig.from_json(json)
# print the JSON string representation of the object
print(SSOConfig.to_json())

# convert the object into a dict
sso_config_dict = sso_config_instance.to_dict()
# create an instance of SSOConfig from a dict
sso_config_from_dict = SSOConfig.from_dict(sso_config_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


