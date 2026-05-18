# AlertRuleListResponse

Paginated list of alert rules

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[AlertRule]**](AlertRule.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.alert_rule_list_response import AlertRuleListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AlertRuleListResponse from a JSON string
alert_rule_list_response_instance = AlertRuleListResponse.from_json(json)
# print the JSON string representation of the object
print(AlertRuleListResponse.to_json())

# convert the object into a dict
alert_rule_list_response_dict = alert_rule_list_response_instance.to_dict()
# create an instance of AlertRuleListResponse from a dict
alert_rule_list_response_from_dict = AlertRuleListResponse.from_dict(alert_rule_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


