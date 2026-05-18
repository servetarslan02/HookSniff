# Endpoint


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**url** | **str** |  | 
**description** | **str** |  | [optional] 
**is_active** | **bool** |  | 
**retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  | 
**created_at** | **datetime** |  | 
**allowed_ips** | **List[str]** | CIDR blocks or exact IPs | [optional] 
**event_filter** | **List[str]** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] 
**custom_headers** | **object** |  | [optional] 
**routing_strategy** | **str** |  | 
**fallback_url** | **str** |  | [optional] 
**avg_response_ms** | **int** |  | 
**failure_streak** | **int** |  | 
**format** | **str** |  | 

## Example

```python
from hooksniff.models.endpoint import Endpoint

# TODO update the JSON string below
json = "{}"
# create an instance of Endpoint from a JSON string
endpoint_instance = Endpoint.from_json(json)
# print the JSON string representation of the object
print(Endpoint.to_json())

# convert the object into a dict
endpoint_dict = endpoint_instance.to_dict()
# create an instance of Endpoint from a dict
endpoint_from_dict = Endpoint.from_dict(endpoint_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


