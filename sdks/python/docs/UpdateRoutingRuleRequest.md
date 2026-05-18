# UpdateRoutingRuleRequest

Update an existing routing rule (all fields optional)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**conditions** | **object** |  | [optional] 
**transform** | **object** |  | [optional] 

## Example

```python
from hooksniff.models.update_routing_rule_request import UpdateRoutingRuleRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateRoutingRuleRequest from a JSON string
update_routing_rule_request_instance = UpdateRoutingRuleRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateRoutingRuleRequest.to_json())

# convert the object into a dict
update_routing_rule_request_dict = update_routing_rule_request_instance.to_dict()
# create an instance of UpdateRoutingRuleRequest from a dict
update_routing_rule_request_from_dict = UpdateRoutingRuleRequest.from_dict(update_routing_rule_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


