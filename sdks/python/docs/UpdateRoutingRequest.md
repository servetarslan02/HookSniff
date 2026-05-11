# UpdateRoutingRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**routing_strategy** | **str** |  | 
**fallback_url** | **str** |  | 

## Example

```python
from hooksniff.models.update_routing_request import UpdateRoutingRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateRoutingRequest from a JSON string
update_routing_request_instance = UpdateRoutingRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateRoutingRequest.to_json())

# convert the object into a dict
update_routing_request_dict = update_routing_request_instance.to_dict()
# create an instance of UpdateRoutingRequest from a dict
update_routing_request_from_dict = UpdateRoutingRequest.from_dict(update_routing_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


