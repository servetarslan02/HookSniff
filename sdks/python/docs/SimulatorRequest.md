# SimulatorRequest

Send a simulated webhook event

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **UUID** |  | 
**event_type** | **str** | Event type to simulate (e.g. order.created) | 
**payload** | **object** | The webhook payload to deliver | 
**delay_ms** | **int** | Artificial delay before delivery (for testing timeouts) | [optional] 

## Example

```python
from hooksniff.models.simulator_request import SimulatorRequest

# TODO update the JSON string below
json = "{}"
# create an instance of SimulatorRequest from a JSON string
simulator_request_instance = SimulatorRequest.from_json(json)
# print the JSON string representation of the object
print(SimulatorRequest.to_json())

# convert the object into a dict
simulator_request_dict = simulator_request_instance.to_dict()
# create an instance of SimulatorRequest from a dict
simulator_request_from_dict = SimulatorRequest.from_dict(simulator_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


