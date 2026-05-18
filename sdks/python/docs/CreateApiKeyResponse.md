# CreateApiKeyResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**key** | **str** | Full API key — only shown once | 
**prefix** | **str** |  | 
**message** | **str** |  | 

## Example

```python
from hooksniff.models.create_api_key_response import CreateApiKeyResponse

# TODO update the JSON string below
json = "{}"
# create an instance of CreateApiKeyResponse from a JSON string
create_api_key_response_instance = CreateApiKeyResponse.from_json(json)
# print the JSON string representation of the object
print(CreateApiKeyResponse.to_json())

# convert the object into a dict
create_api_key_response_dict = create_api_key_response_instance.to_dict()
# create an instance of CreateApiKeyResponse from a dict
create_api_key_response_from_dict = CreateApiKeyResponse.from_dict(create_api_key_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


