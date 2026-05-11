# SchemaResponse

A registered JSON Schema for event validation

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**name** | **str** |  | 
**version** | **int** |  | 
**schema_json** | **object** | The JSON Schema document | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.schema_response import SchemaResponse

# TODO update the JSON string below
json = "{}"
# create an instance of SchemaResponse from a JSON string
schema_response_instance = SchemaResponse.from_json(json)
# print the JSON string representation of the object
print(SchemaResponse.to_json())

# convert the object into a dict
schema_response_dict = schema_response_instance.to_dict()
# create an instance of SchemaResponse from a dict
schema_response_from_dict = SchemaResponse.from_dict(schema_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


