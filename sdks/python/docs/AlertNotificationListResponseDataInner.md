# AlertNotificationListResponseDataInner

Alert notification entry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**alert_rule_id** | **UUID** |  | [optional] 
**message** | **str** |  | [optional] 
**channel** | **str** |  | [optional] 
**status** | **str** |  | [optional] 
**created_at** | **datetime** |  | [optional] 

## Example

```python
from hooksniff.models.alert_notification_list_response_data_inner import AlertNotificationListResponseDataInner

# TODO update the JSON string below
json = "{}"
# create an instance of AlertNotificationListResponseDataInner from a JSON string
alert_notification_list_response_data_inner_instance = AlertNotificationListResponseDataInner.from_json(json)
# print the JSON string representation of the object
print(AlertNotificationListResponseDataInner.to_json())

# convert the object into a dict
alert_notification_list_response_data_inner_dict = alert_notification_list_response_data_inner_instance.to_dict()
# create an instance of AlertNotificationListResponseDataInner from a dict
alert_notification_list_response_data_inner_from_dict = AlertNotificationListResponseDataInner.from_dict(alert_notification_list_response_data_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


