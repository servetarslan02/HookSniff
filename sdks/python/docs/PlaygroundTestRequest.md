# PlaygroundTestRequest

Test a webhook payload against an endpoint in sandbox

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **UUID** |  | 
**payload** | **object** | The payload to send | 
**headers** | **object** | Custom headers to include with the request | [optional] 

## Example

```python
from hooksniff.models.playground_test_request import PlaygroundTestRequest

# TODO update the JSON string below
json = "{}"
# create an instance of PlaygroundTestRequest from a JSON string
playground_test_request_instance = PlaygroundTestRequest.from_json(json)
# print the JSON string representation of the object
print(PlaygroundTestRequest.to_json())

# convert the object into a dict
playground_test_request_dict = playground_test_request_instance.to_dict()
# create an instance of PlaygroundTestRequest from a dict
playground_test_request_from_dict = PlaygroundTestRequest.from_dict(playground_test_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


