# EmbedConfig

Configuration for embedded webhook dashboard

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**allowed_origins** | **List[str]** | CORS origins allowed to load the embed | 
**theme** | [**EmbedConfigTheme**](EmbedConfigTheme.md) |  | [optional] 
**features** | **List[str]** | Enabled features (e.g. [deliveries, endpoints, playground]) | [optional] 

## Example

```python
from hooksniff.models.embed_config import EmbedConfig

# TODO update the JSON string below
json = "{}"
# create an instance of EmbedConfig from a JSON string
embed_config_instance = EmbedConfig.from_json(json)
# print the JSON string representation of the object
print(EmbedConfig.to_json())

# convert the object into a dict
embed_config_dict = embed_config_instance.to_dict()
# create an instance of EmbedConfig from a dict
embed_config_from_dict = EmbedConfig.from_dict(embed_config_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


