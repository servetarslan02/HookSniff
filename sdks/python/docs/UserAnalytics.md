# UserAnalytics

User analytics data for admin view

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**daily_deliveries** | [**List[DailyDeliveryCount]**](DailyDeliveryCount.md) |  | 
**top_events** | [**List[EventTypeCount]**](EventTypeCount.md) |  | 
**endpoint_health** | [**List[EndpointHealth]**](EndpointHealth.md) |  | 

## Example

```python
from hooksniff.models.user_analytics import UserAnalytics

# TODO update the JSON string below
json = "{}"
# create an instance of UserAnalytics from a JSON string
user_analytics_instance = UserAnalytics.from_json(json)
# print the JSON string representation of the object
print(UserAnalytics.to_json())

# convert the object into a dict
user_analytics_dict = user_analytics_instance.to_dict()
# create an instance of UserAnalytics from a dict
user_analytics_from_dict = UserAnalytics.from_dict(user_analytics_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


