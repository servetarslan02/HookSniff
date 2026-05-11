# RegisterSchemaRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**var_schema** | **object** | JSON Schema document | 

## Example

```python
from hooksniff.models.register_schema_request import RegisterSchemaRequest

# TODO update the JSON string below
json = "{}"
# create an instance of RegisterSchemaRequest from a JSON string
register_schema_request_instance = RegisterSchemaRequest.from_json(json)
# print the JSON string representation of the object
print(RegisterSchemaRequest.to_json())

# convert the object into a dict
register_schema_request_dict = register_schema_request_instance.to_dict()
# create an instance of RegisterSchemaRequest from a dict
register_schema_request_from_dict = RegisterSchemaRequest.from_dict(register_schema_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


