# UpdateTransformRuleRequest

Update an existing transform rule (all fields optional)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**config** | **object** | Updated transformation configuration | [optional] 

## Example

```python
from hooksniff.models.update_transform_rule_request import UpdateTransformRuleRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateTransformRuleRequest from a JSON string
update_transform_rule_request_instance = UpdateTransformRuleRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateTransformRuleRequest.to_json())

# convert the object into a dict
update_transform_rule_request_dict = update_transform_rule_request_instance.to_dict()
# create an instance of UpdateTransformRuleRequest from a dict
update_transform_rule_request_from_dict = UpdateTransformRuleRequest.from_dict(update_transform_rule_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


