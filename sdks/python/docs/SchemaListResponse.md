# SchemaListResponse

Paginated list of registered schemas

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[SchemaResponse]**](SchemaResponse.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.schema_list_response import SchemaListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of SchemaListResponse from a JSON string
schema_list_response_instance = SchemaListResponse.from_json(json)
# print the JSON string representation of the object
print(SchemaListResponse.to_json())

# convert the object into a dict
schema_list_response_dict = schema_list_response_instance.to_dict()
# create an instance of SchemaListResponse from a dict
schema_list_response_from_dict = SchemaListResponse.from_dict(schema_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


