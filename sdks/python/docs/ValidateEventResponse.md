# ValidateEventResponse

Result of validating an event payload against a schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**valid** | **bool** |  | 
**errors** | [**List[ValidateEventResponseErrorsInner]**](ValidateEventResponseErrorsInner.md) |  | [optional] 

## Example

```python
from hooksniff.models.validate_event_response import ValidateEventResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ValidateEventResponse from a JSON string
validate_event_response_instance = ValidateEventResponse.from_json(json)
# print the JSON string representation of the object
print(ValidateEventResponse.to_json())

# convert the object into a dict
validate_event_response_dict = validate_event_response_instance.to_dict()
# create an instance of ValidateEventResponse from a dict
validate_event_response_from_dict = ValidateEventResponse.from_dict(validate_event_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


