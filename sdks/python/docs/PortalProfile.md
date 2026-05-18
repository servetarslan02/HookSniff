# PortalProfile


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**email** | **str** |  | 
**name** | **str** |  | [optional] 
**plan** | **str** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.portal_profile import PortalProfile

# TODO update the JSON string below
json = "{}"
# create an instance of PortalProfile from a JSON string
portal_profile_instance = PortalProfile.from_json(json)
# print the JSON string representation of the object
print(PortalProfile.to_json())

# convert the object into a dict
portal_profile_dict = portal_profile_instance.to_dict()
# create an instance of PortalProfile from a dict
portal_profile_from_dict = PortalProfile.from_dict(portal_profile_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


