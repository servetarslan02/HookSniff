# EndpointListResponse

Paginated list of endpoints

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[Endpoint]**](Endpoint.md) |  | 
**total** | **int** |  | 
**has_more** | **bool** |  | 

## Example

```python
from hooksniff.models.endpoint_list_response import EndpointListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of EndpointListResponse from a JSON string
endpoint_list_response_instance = EndpointListResponse.from_json(json)
# print the JSON string representation of the object
print(EndpointListResponse.to_json())

# convert the object into a dict
endpoint_list_response_dict = endpoint_list_response_instance.to_dict()
# create an instance of EndpointListResponse from a dict
endpoint_list_response_from_dict = EndpointListResponse.from_dict(endpoint_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


