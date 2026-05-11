# EventTypeListResponse

Paginated list of event types

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[EventType]**](EventType.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.event_type_list_response import EventTypeListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of EventTypeListResponse from a JSON string
event_type_list_response_instance = EventTypeListResponse.from_json(json)
# print the JSON string representation of the object
print(EventTypeListResponse.to_json())

# convert the object into a dict
event_type_list_response_dict = event_type_list_response_instance.to_dict()
# create an instance of EventTypeListResponse from a dict
event_type_list_response_from_dict = EventTypeListResponse.from_dict(event_type_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


