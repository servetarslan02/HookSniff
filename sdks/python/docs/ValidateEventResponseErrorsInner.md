# ValidateEventResponseErrorsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**path** | **str** | JSON pointer to the failing field | [optional] 
**message** | **str** | Human-readable validation error | [optional] 

## Example

```python
from hooksniff.models.validate_event_response_errors_inner import ValidateEventResponseErrorsInner

# TODO update the JSON string below
json = "{}"
# create an instance of ValidateEventResponseErrorsInner from a JSON string
validate_event_response_errors_inner_instance = ValidateEventResponseErrorsInner.from_json(json)
# print the JSON string representation of the object
print(ValidateEventResponseErrorsInner.to_json())

# convert the object into a dict
validate_event_response_errors_inner_dict = validate_event_response_errors_inner_instance.to_dict()
# create an instance of ValidateEventResponseErrorsInner from a dict
validate_event_response_errors_inner_from_dict = ValidateEventResponseErrorsInner.from_dict(validate_event_response_errors_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


