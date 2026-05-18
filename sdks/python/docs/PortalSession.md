# PortalSession

Temporary session token for the customer portal

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**token** | **str** |  | 
**expires_at** | **datetime** |  | 
**url** | **str** | Full URL to the portal with session token | 

## Example

```python
from hooksniff.models.portal_session import PortalSession

# TODO update the JSON string below
json = "{}"
# create an instance of PortalSession from a JSON string
portal_session_instance = PortalSession.from_json(json)
# print the JSON string representation of the object
print(PortalSession.to_json())

# convert the object into a dict
portal_session_dict = portal_session_instance.to_dict()
# create an instance of PortalSession from a dict
portal_session_from_dict = PortalSession.from_dict(portal_session_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


