# SimulatorPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **str** |  | [optional] 
**event** | **str** |  | [optional] 
**data** | **object** |  | [optional] 

## Example

```python
from hooksniff.models.simulator_post_request import SimulatorPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of SimulatorPostRequest from a JSON string
simulator_post_request_instance = SimulatorPostRequest.from_json(json)
# print the JSON string representation of the object
print(SimulatorPostRequest.to_json())

# convert the object into a dict
simulator_post_request_dict = simulator_post_request_instance.to_dict()
# create an instance of SimulatorPostRequest from a dict
simulator_post_request_from_dict = SimulatorPostRequest.from_dict(simulator_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


