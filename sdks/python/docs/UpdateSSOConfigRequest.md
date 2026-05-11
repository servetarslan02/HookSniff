# UpdateSSOConfigRequest

Update an SSO configuration (all fields optional)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **str** |  | 
**domain** | **str** |  | 

## Example

```python
from hooksniff.models.update_sso_config_request import UpdateSSOConfigRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateSSOConfigRequest from a JSON string
update_sso_config_request_instance = UpdateSSOConfigRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateSSOConfigRequest.to_json())

# convert the object into a dict
update_sso_config_request_dict = update_sso_config_request_instance.to_dict()
# create an instance of UpdateSSOConfigRequest from a dict
update_sso_config_request_from_dict = UpdateSSOConfigRequest.from_dict(update_sso_config_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


