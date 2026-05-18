# ServiceToken


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**name** | **str** |  | [optional] 
**token_prefix** | **str** | Token prefix (first 24 chars + ...) | [optional] 
**created_at** | **datetime** |  | [optional] 
**last_used_at** | **datetime** |  | [optional] 
**is_active** | **bool** |  | [optional] 

## Example

```python
from hooksniff.models.service_token import ServiceToken

# TODO update the JSON string below
json = "{}"
# create an instance of ServiceToken from a JSON string
service_token_instance = ServiceToken.from_json(json)
# print the JSON string representation of the object
print(ServiceToken.to_json())

# convert the object into a dict
service_token_dict = service_token_instance.to_dict()
# create an instance of ServiceToken from a dict
service_token_from_dict = ServiceToken.from_dict(service_token_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


