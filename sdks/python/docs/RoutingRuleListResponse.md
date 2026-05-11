# RoutingRuleListResponse

List of routing rules

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[RoutingRuleListResponseDataInner]**](RoutingRuleListResponseDataInner.md) |  | 

## Example

```python
from hooksniff.models.routing_rule_list_response import RoutingRuleListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of RoutingRuleListResponse from a JSON string
routing_rule_list_response_instance = RoutingRuleListResponse.from_json(json)
# print the JSON string representation of the object
print(RoutingRuleListResponse.to_json())

# convert the object into a dict
routing_rule_list_response_dict = routing_rule_list_response_instance.to_dict()
# create an instance of RoutingRuleListResponse from a dict
routing_rule_list_response_from_dict = RoutingRuleListResponse.from_dict(routing_rule_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


