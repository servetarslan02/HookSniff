# InboundConfigsIdPutRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**secret** | **str** |  | [optional] 
**endpoint_id** | **UUID** |  | [optional] 
**enabled** | **bool** |  | [optional] 

## Example

```python
from hooksniff.models.inbound_configs_id_put_request import InboundConfigsIdPutRequest

# TODO update the JSON string below
json = "{}"
# create an instance of InboundConfigsIdPutRequest from a JSON string
inbound_configs_id_put_request_instance = InboundConfigsIdPutRequest.from_json(json)
# print the JSON string representation of the object
print(InboundConfigsIdPutRequest.to_json())

# convert the object into a dict
inbound_configs_id_put_request_dict = inbound_configs_id_put_request_instance.to_dict()
# create an instance of InboundConfigsIdPutRequest from a dict
inbound_configs_id_put_request_from_dict = InboundConfigsIdPutRequest.from_dict(inbound_configs_id_put_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


