# InboundConfig


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**customer_id** | **UUID** |  | [optional] 
**provider** | **str** | Provider name (stripe, github, shopify, generic) | [optional] 
**secret** | **str** | Webhook signing secret | [optional] 
**endpoint_id** | **UUID** |  | [optional] 
**enabled** | **bool** |  | [optional] 
**created_at** | **datetime** |  | [optional] 

## Example

```python
from hooksniff.models.inbound_config import InboundConfig

# TODO update the JSON string below
json = "{}"
# create an instance of InboundConfig from a JSON string
inbound_config_instance = InboundConfig.from_json(json)
# print the JSON string representation of the object
print(InboundConfig.to_json())

# convert the object into a dict
inbound_config_dict = inbound_config_instance.to_dict()
# create an instance of InboundConfig from a dict
inbound_config_from_dict = InboundConfig.from_dict(inbound_config_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


