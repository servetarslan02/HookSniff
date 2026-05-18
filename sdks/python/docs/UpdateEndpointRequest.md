# UpdateEndpointRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**url** | **str** |  | 
**description** | **str** |  | 
**is_active** | **bool** |  | 
**allowed_ips** | **List[str]** |  | 
**event_filter** | **List[str]** |  | 
**custom_headers** | **object** |  | [optional] 
**retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  | 
**routing_strategy** | **str** |  | 
**fallback_url** | **str** |  | 
**format** | **str** |  | 

## Example

```python
from hooksniff.models.update_endpoint_request import UpdateEndpointRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateEndpointRequest from a JSON string
update_endpoint_request_instance = UpdateEndpointRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateEndpointRequest.to_json())

# convert the object into a dict
update_endpoint_request_dict = update_endpoint_request_instance.to_dict()
# create an instance of UpdateEndpointRequest from a dict
update_endpoint_request_from_dict = UpdateEndpointRequest.from_dict(update_endpoint_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


