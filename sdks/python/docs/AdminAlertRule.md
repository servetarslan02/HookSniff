# AdminAlertRule

Admin alert rule with customer info

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**customer_id** | **UUID** |  | [optional] 
**customer_email** | **str** |  | [optional] 
**name** | **str** |  | 
**condition** | **str** |  | 
**threshold** | **int** |  | 
**channels** | **List[str]** |  | 
**is_active** | **bool** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.admin_alert_rule import AdminAlertRule

# TODO update the JSON string below
json = "{}"
# create an instance of AdminAlertRule from a JSON string
admin_alert_rule_instance = AdminAlertRule.from_json(json)
# print the JSON string representation of the object
print(AdminAlertRule.to_json())

# convert the object into a dict
admin_alert_rule_dict = admin_alert_rule_instance.to_dict()
# create an instance of AdminAlertRule from a dict
admin_alert_rule_from_dict = AdminAlertRule.from_dict(admin_alert_rule_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


