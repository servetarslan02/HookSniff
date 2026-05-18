# EndpointHealth

Endpoint health metrics and status

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **UUID** |  | 
**is_healthy** | **bool** |  | 
**failure_streak** | **int** |  | [optional] 
**avg_response_ms** | **int** |  | [optional] 
**last_failure_at** | **datetime** |  | [optional] 
**success_rate** | **float** | Success rate as a fraction (0.0–1.0) | [optional] 
**avg_latency_ms** | **float** | Average delivery latency in milliseconds | [optional] 
**last_delivery_at** | **datetime** |  | [optional] 
**total_deliveries** | **int** |  | [optional] 
**failed_deliveries** | **int** |  | [optional] 

## Example

```python
from hooksniff.models.endpoint_health import EndpointHealth

# TODO update the JSON string below
json = "{}"
# create an instance of EndpointHealth from a JSON string
endpoint_health_instance = EndpointHealth.from_json(json)
# print the JSON string representation of the object
print(EndpointHealth.to_json())

# convert the object into a dict
endpoint_health_dict = endpoint_health_instance.to_dict()
# create an instance of EndpointHealth from a dict
endpoint_health_from_dict = EndpointHealth.from_dict(endpoint_health_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


