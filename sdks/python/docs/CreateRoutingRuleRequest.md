# CreateRoutingRuleRequest

Create a new routing rule

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**conditions** | **object** | Conditions that trigger this rule (e.g. event_type, header match) | 
**transform** | **object** | Optional payload transformation config | [optional] 
**target_endpoint_id** | **UUID** |  | 

## Example

```python
from hooksniff.models.create_routing_rule_request import CreateRoutingRuleRequest

# TODO update the JSON string below
json = "{}"
# create an instance of CreateRoutingRuleRequest from a JSON string
create_routing_rule_request_instance = CreateRoutingRuleRequest.from_json(json)
# print the JSON string representation of the object
print(CreateRoutingRuleRequest.to_json())

# convert the object into a dict
create_routing_rule_request_dict = create_routing_rule_request_instance.to_dict()
# create an instance of CreateRoutingRuleRequest from a dict
create_routing_rule_request_from_dict = CreateRoutingRuleRequest.from_dict(create_routing_rule_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


