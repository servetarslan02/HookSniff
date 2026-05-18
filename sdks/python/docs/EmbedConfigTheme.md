# EmbedConfigTheme

Visual customization for the embed

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**primary_color** | **str** |  | [optional] 
**background_color** | **str** |  | [optional] 
**font_family** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.embed_config_theme import EmbedConfigTheme

# TODO update the JSON string below
json = "{}"
# create an instance of EmbedConfigTheme from a JSON string
embed_config_theme_instance = EmbedConfigTheme.from_json(json)
# print the JSON string representation of the object
print(EmbedConfigTheme.to_json())

# convert the object into a dict
embed_config_theme_dict = embed_config_theme_instance.to_dict()
# create an instance of EmbedConfigTheme from a dict
embed_config_theme_from_dict = EmbedConfigTheme.from_dict(embed_config_theme_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


