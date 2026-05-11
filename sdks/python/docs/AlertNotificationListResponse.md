# AlertNotificationListResponse

Paginated list of alert notifications

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[AlertNotificationListResponseDataInner]**](AlertNotificationListResponseDataInner.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.alert_notification_list_response import AlertNotificationListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AlertNotificationListResponse from a JSON string
alert_notification_list_response_instance = AlertNotificationListResponse.from_json(json)
# print the JSON string representation of the object
print(AlertNotificationListResponse.to_json())

# convert the object into a dict
alert_notification_list_response_dict = alert_notification_list_response_instance.to_dict()
# create an instance of AlertNotificationListResponse from a dict
alert_notification_list_response_from_dict = AlertNotificationListResponse.from_dict(alert_notification_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


