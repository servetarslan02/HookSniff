# DailyDeliveryCount

Daily delivery count breakdown

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**var_date** | **date** |  | 
**total** | **int** |  | 
**success** | **int** |  | 
**failed** | **int** |  | 

## Example

```python
from hooksniff.models.daily_delivery_count import DailyDeliveryCount

# TODO update the JSON string below
json = "{}"
# create an instance of DailyDeliveryCount from a JSON string
daily_delivery_count_instance = DailyDeliveryCount.from_json(json)
# print the JSON string representation of the object
print(DailyDeliveryCount.to_json())

# convert the object into a dict
daily_delivery_count_dict = daily_delivery_count_instance.to_dict()
# create an instance of DailyDeliveryCount from a dict
daily_delivery_count_from_dict = DailyDeliveryCount.from_dict(daily_delivery_count_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


