# TransformRuleListResponse

Paginated list of transform rules

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[TransformRule]**](TransformRule.md) |  | 

## Example

```python
from hooksniff.models.transform_rule_list_response import TransformRuleListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of TransformRuleListResponse from a JSON string
transform_rule_list_response_instance = TransformRuleListResponse.from_json(json)
# print the JSON string representation of the object
print(TransformRuleListResponse.to_json())

# convert the object into a dict
transform_rule_list_response_dict = transform_rule_list_response_instance.to_dict()
# create an instance of TransformRuleListResponse from a dict
transform_rule_list_response_from_dict = TransformRuleListResponse.from_dict(transform_rule_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


