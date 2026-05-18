# SimulatorResponse

Result of a simulated webhook delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**delivery_id** | **UUID** |  | 
**status** | **str** |  | 
**latency_ms** | **int** | Response time from the endpoint | 

## Example

```python
from hooksniff.models.simulator_response import SimulatorResponse

# TODO update the JSON string below
json = "{}"
# create an instance of SimulatorResponse from a JSON string
simulator_response_instance = SimulatorResponse.from_json(json)
# print the JSON string representation of the object
print(SimulatorResponse.to_json())

# convert the object into a dict
simulator_response_dict = simulator_response_instance.to_dict()
# create an instance of SimulatorResponse from a dict
simulator_response_from_dict = SimulatorResponse.from_dict(simulator_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


