# CreateTransformRuleRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**rule_type** | **str** |  | 
**config** | **object** |  | 

## Example

```python
from hooksniff.models.create_transform_rule_request import CreateTransformRuleRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateTransformRuleRequest from a JSON string
create_transform_rule_request_instance = CreateTransformRuleRequest.from_json(json)
# print the JSON string representation of the object
print(CreateTransformRuleRequest.to_json())

# convert the object into a dict
create_transform_rule_request_dict = create_transform_rule_request_instance.to_dict()
# create an instance of CreateTransformRuleRequest from a dict
create_transform_rule_request_from_dict = CreateTransformRuleRequest.from_dict(create_transform_rule_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


