# ApiKeyInfo


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**prefix** | **str** | Masked key prefix (e.g. \&quot;hs_abc1...\&quot;) | 
**created_at** | **datetime** |  | 
**last_used_at** | **str** |  | [optional] 
**is_active** | **bool** |  | 

## Example

```python
from hooksniff.models.api_key_info import ApiKeyInfo

# TODO update the JSON string below
json = "{}"
# create an instance of ApiKeyInfo from a JSON string
api_key_info_instance = ApiKeyInfo.from_json(json)
# print the JSON string representation of the object
print(ApiKeyInfo.to_json())

# convert the object into a dict
api_key_info_dict = api_key_info_instance.to_dict()
# create an instance of ApiKeyInfo from a dict
api_key_info_from_dict = ApiKeyInfo.from_dict(api_key_info_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


