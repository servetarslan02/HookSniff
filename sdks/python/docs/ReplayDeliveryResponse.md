# ReplayDeliveryResponse

Result of replaying a delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**message** | **str** |  | 
**original_id** | **UUID** |  | 
**new_delivery_id** | **UUID** |  | 

## Example

```python
from hooksniff.models.replay_delivery_response import ReplayDeliveryResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ReplayDeliveryResponse from a JSON string
replay_delivery_response_instance = ReplayDeliveryResponse.from_json(json)
# print the JSON string representation of the object
print(ReplayDeliveryResponse.to_json())

# convert the object into a dict
replay_delivery_response_dict = replay_delivery_response_instance.to_dict()
# create an instance of ReplayDeliveryResponse from a dict
replay_delivery_response_from_dict = ReplayDeliveryResponse.from_dict(replay_delivery_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


