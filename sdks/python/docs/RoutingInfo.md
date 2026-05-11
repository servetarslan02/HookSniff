# RoutingInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **UUID** |  | 
**routing_strategy** | **str** |  | 
**fallback_url** | **str** |  | [optional] 
**avg_response_ms** | **int** |  | 
**failure_streak** | **int** |  | 
**is_healthy** | **bool** |  | 

## Example

```python
from hooksniff.models.routing_info import RoutingInfo

# TODO update the JSON string below
json = "{}"
# create an instance of RoutingInfo from a JSON string
routing_info_instance = RoutingInfo.from_json(json)
# print the JSON string representation of the object
print(RoutingInfo.to_json())

# convert the object into a dict
routing_info_dict = routing_info_instance.to_dict()
# create an instance of RoutingInfo from a dict
routing_info_from_dict = RoutingInfo.from_dict(routing_info_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


