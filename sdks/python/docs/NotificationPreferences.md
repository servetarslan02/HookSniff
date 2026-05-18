# NotificationPreferences


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email_on_failure** | **bool** |  | [default to True]
**email_on_dead_letter** | **bool** |  | [default to True]
**email_on_success** | **bool** |  | [default to False]
**slack_webhook_url** | **str** |  | [optional] 
**discord_webhook_url** | **str** |  | [optional] 
**webhook_url** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.notification_preferences import NotificationPreferences

# TODO update the JSON string below
json = "{}"
# create an instance of NotificationPreferences from a JSON string
notification_preferences_instance = NotificationPreferences.from_json(json)
# print the JSON string representation of the object
print(NotificationPreferences.to_json())

# convert the object into a dict
notification_preferences_dict = notification_preferences_instance.to_dict()
# create an instance of NotificationPreferences from a dict
notification_preferences_from_dict = NotificationPreferences.from_dict(notification_preferences_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


