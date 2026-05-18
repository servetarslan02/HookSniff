# ServiceTokensIdPutRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.service_tokens_id_put_request import ServiceTokensIdPutRequest

# TODO update the JSON string below
json = "{}"
# create an instance of ServiceTokensIdPutRequest from a JSON string
service_tokens_id_put_request_instance = ServiceTokensIdPutRequest.from_json(json)
# print the JSON string representation of the object
print(ServiceTokensIdPutRequest.to_json())

# convert the object into a dict
service_tokens_id_put_request_dict = service_tokens_id_put_request_instance.to_dict()
# create an instance of ServiceTokensIdPutRequest from a dict
service_tokens_id_put_request_from_dict = ServiceTokensIdPutRequest.from_dict(service_tokens_id_put_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


