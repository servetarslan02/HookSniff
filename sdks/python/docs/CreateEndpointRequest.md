# CreateEndpointRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**url** | **str** |  | 
**description** | **str** |  | [optional] 
**allowed_ips** | **List[str]** |  | [optional] 
**event_filter** | **List[str]** |  | [optional] 
**custom_headers** | **object** |  | [optional] 
**retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  | [optional] 
**routing_strategy** | **str** |  | [optional] 
**fallback_url** | **str** |  | [optional] 
**format** | **str** |  | [optional] [default to 'standard']

## Example

```python
from hooksniff.models.create_endpoint_request import CreateEndpointRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateEndpointRequest from a JSON string
create_endpoint_request_instance = CreateEndpointRequest.from_json(json)
# print the JSON string representation of the object
print(CreateEndpointRequest.to_json())

# convert the object into a dict
create_endpoint_request_dict = create_endpoint_request_instance.to_dict()
# create an instance of CreateEndpointRequest from a dict
create_endpoint_request_from_dict = CreateEndpointRequest.from_dict(create_endpoint_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


