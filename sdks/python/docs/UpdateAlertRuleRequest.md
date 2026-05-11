# UpdateAlertRuleRequest

Request to update an existing alert rule (all fields optional)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **str** |  | 
**condition** | **str** |  | 
**threshold** | **int** |  | 
**channels** | **List[str]** |  | 

## Example

```python
from hooksniff.models.update_alert_rule_request import UpdateAlertRuleRequest

# TODO update the JSON string below
json = "{}"
# create an instance of UpdateAlertRuleRequest from a JSON string
update_alert_rule_request_instance = UpdateAlertRuleRequest.from_json(json)
# print the JSON string representation of the object
print(UpdateAlertRuleRequest.to_json())

# convert the object into a dict
update_alert_rule_request_dict = update_alert_rule_request_instance.to_dict()
# create an instance of UpdateAlertRuleRequest from a dict
update_alert_rule_request_from_dict = UpdateAlertRuleRequest.from_dict(update_alert_rule_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


