# ServiceTokenCreateResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**name** | **str** |  | [optional] 
**token** | **str** | Full token value (only shown once) | [optional] 
**token_prefix** | **str** |  | [optional] 
**message** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.service_token_create_response import ServiceTokenCreateResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ServiceTokenCreateResponse from a JSON string
service_token_create_response_instance = ServiceTokenCreateResponse.from_json(json)
# print the JSON string representation of the object
print(ServiceTokenCreateResponse.to_json())

# convert the object into a dict
service_token_create_response_dict = service_token_create_response_instance.to_dict()
# create an instance of ServiceTokenCreateResponse from a dict
service_token_create_response_from_dict = ServiceTokenCreateResponse.from_dict(service_token_create_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


