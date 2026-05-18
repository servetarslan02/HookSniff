# EventTypeCount

Event type occurrence count

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**event** | **str** |  | [optional] 
**count** | **int** |  | 

## Example

```python
from hooksniff.models.event_type_count import EventTypeCount

# TODO update the JSON string below
json = "{}"
# create an instance of EventTypeCount from a JSON string
event_type_count_instance = EventTypeCount.from_json(json)
# print the JSON string representation of the object
print(EventTypeCount.to_json())

# convert the object into a dict
event_type_count_dict = event_type_count_instance.to_dict()
# create an instance of EventTypeCount from a dict
event_type_count_from_dict = EventTypeCount.from_dict(event_type_count_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


