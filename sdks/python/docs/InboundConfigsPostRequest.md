# InboundConfigsPostRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **str** | Provider name (stripe, github, shopify, generic) | 
**secret** | **str** | Webhook signing secret | 
**endpoint_id** | **UUID** | Default target endpoint | [optional] 
**enabled** | **bool** |  | [optional] [default to True]

## Example

```python
from hooksniff.models.inbound_configs_post_request import InboundConfigsPostRequest

# TODO update the JSON string below
json = "{}"
# create an instance of InboundConfigsPostRequest from a JSON string
inbound_configs_post_request_instance = InboundConfigsPostRequest.from_json(json)
# print the JSON string representation of the object
print(InboundConfigsPostRequest.to_json())

# convert the object into a dict
inbound_configs_post_request_dict = inbound_configs_post_request_instance.to_dict()
# create an instance of InboundConfigsPostRequest from a dict
inbound_configs_post_request_from_dict = InboundConfigsPostRequest.from_dict(inbound_configs_post_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


