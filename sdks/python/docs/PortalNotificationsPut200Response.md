# PortalNotificationsPut200Response


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**updated** | **bool** |  | [optional] 
**preferences** | [**NotificationPreferences**](NotificationPreferences.md) |  | [optional] 

## Example

```python
from hooksniff.models.portal_notifications_put200_response import PortalNotificationsPut200Response

# TODO update the JSON string below
json = "{}"
# create an instance of PortalNotificationsPut200Response from a JSON string
portal_notifications_put200_response_instance = PortalNotificationsPut200Response.from_json(json)
# print the JSON string representation of the object
print(PortalNotificationsPut200Response.to_json())

# convert the object into a dict
portal_notifications_put200_response_dict = portal_notifications_put200_response_instance.to_dict()
# create an instance of PortalNotificationsPut200Response from a dict
portal_notifications_put200_response_from_dict = PortalNotificationsPut200Response.from_dict(portal_notifications_put200_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


