# TransformRule


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**endpoint_id** | **UUID** |  | [optional] 
**name** | **str** |  | [optional] 
**rule_type** | **str** |  | [optional] 
**config** | **object** |  | [optional] 
**is_active** | **bool** |  | [optional] 
**created_at** | **datetime** |  | [optional] 

## Example

```python
from hooksniff.models.transform_rule import TransformRule

# TODO update the JSON string below
json = "{}"
# create an instance of TransformRule from a JSON string
transform_rule_instance = TransformRule.from_json(json)
# print the JSON string representation of the object
print(TransformRule.to_json())

# convert the object into a dict
transform_rule_dict = transform_rule_instance.to_dict()
# create an instance of TransformRule from a dict
transform_rule_from_dict = TransformRule.from_dict(transform_rule_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


