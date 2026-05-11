# PlaygroundTestResponse

Result of a playground test delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status_code** | **int** | HTTP status code returned by the endpoint | 
**response_body** | **str** | Raw response body from the endpoint | 
**latency_ms** | **int** |  | 
**headers** | **object** | Response headers from the endpoint | [optional] 

## Example

```python
from hooksniff.models.playground_test_response import PlaygroundTestResponse

# TODO update the JSON string below
json = "{}"
# create an instance of PlaygroundTestResponse from a JSON string
playground_test_response_instance = PlaygroundTestResponse.from_json(json)
# print the JSON string representation of the object
print(PlaygroundTestResponse.to_json())

# convert the object into a dict
playground_test_response_dict = playground_test_response_instance.to_dict()
# create an instance of PlaygroundTestResponse from a dict
playground_test_response_from_dict = PlaygroundTestResponse.from_dict(playground_test_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


