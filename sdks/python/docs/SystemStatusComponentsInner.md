# SystemStatusComponentsInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | [optional] 
**status** | **str** |  | [optional] 
**latency_ms** | **int** |  | [optional] 
**description** | **str** |  | [optional] 
**last_checked** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.system_status_components_inner import SystemStatusComponentsInner

# TODO update the JSON string below
json = "{}"
# create an instance of SystemStatusComponentsInner from a JSON string
system_status_components_inner_instance = SystemStatusComponentsInner.from_json(json)
# print the JSON string representation of the object
print(SystemStatusComponentsInner.to_json())

# convert the object into a dict
system_status_components_inner_dict = system_status_components_inner_instance.to_dict()
# create an instance of SystemStatusComponentsInner from a dict
system_status_components_inner_from_dict = SystemStatusComponentsInner.from_dict(system_status_components_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


