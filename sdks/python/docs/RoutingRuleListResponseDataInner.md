# RoutingRuleListResponseDataInner


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**name** | **str** |  | 
**conditions** | **object** |  | 
**transform** | **object** |  | [optional] 
**target_endpoint_id** | **UUID** |  | 
**enabled** | **bool** |  | [optional] 
**created_at** | **datetime** |  | [optional] 

## Example

```python
from hooksniff.models.routing_rule_list_response_data_inner import RoutingRuleListResponseDataInner

# TODO update the JSON string below
json = "{}"
# create an instance of RoutingRuleListResponseDataInner from a JSON string
routing_rule_list_response_data_inner_instance = RoutingRuleListResponseDataInner.from_json(json)
# print the JSON string representation of the object
print(RoutingRuleListResponseDataInner.to_json())

# convert the object into a dict
routing_rule_list_response_data_inner_dict = routing_rule_list_response_data_inner_instance.to_dict()
# create an instance of RoutingRuleListResponseDataInner from a dict
routing_rule_list_response_data_inner_from_dict = RoutingRuleListResponseDataInner.from_dict(routing_rule_list_response_data_inner_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


