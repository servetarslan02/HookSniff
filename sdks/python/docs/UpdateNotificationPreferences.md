# UpdateNotificationPreferences


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email_on_failure** | **bool** |  | 
**email_on_dead_letter** | **bool** |  | 
**email_on_success** | **bool** |  | 
**slack_webhook_url** | **str** |  | [optional] 
**discord_webhook_url** | **str** |  | [optional] 
**webhook_url** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.update_notification_preferences import UpdateNotificationPreferences

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateNotificationPreferences from a JSON string
update_notification_preferences_instance = UpdateNotificationPreferences.from_json(json)
# print the JSON string representation of the object
print(UpdateNotificationPreferences.to_json())

# convert the object into a dict
update_notification_preferences_dict = update_notification_preferences_instance.to_dict()
# create an instance of UpdateNotificationPreferences from a dict
update_notification_preferences_from_dict = UpdateNotificationPreferences.from_dict(update_notification_preferences_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


