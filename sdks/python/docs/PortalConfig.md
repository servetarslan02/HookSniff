# PortalConfig

Customer-facing portal branding and configuration

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**logo_url** | **str** |  | [optional] 
**primary_color** | **str** | Hex color code (e.g. | [optional] 
**custom_domain** | **str** |  | [optional] 
**webhook_events** | **List[str]** | Event types to expose in the portal | [optional] 

## Example

```python
from hooksniff.models.portal_config import PortalConfig

# TODO update the JSON string below
json = "{}"
# create an instance of PortalConfig from a JSON string
portal_config_instance = PortalConfig.from_json(json)
# print the JSON string representation of the object
print(PortalConfig.to_json())

# convert the object into a dict
portal_config_dict = portal_config_instance.to_dict()
# create an instance of PortalConfig from a dict
portal_config_from_dict = PortalConfig.from_dict(portal_config_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


