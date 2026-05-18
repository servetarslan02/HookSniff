# UserSummary


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**email** | **str** |  | 
**name** | **str** |  | [optional] 
**plan** | **str** |  | 
**is_active** | **bool** |  | 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.user_summary import UserSummary

# TODO update the JSON string below
json = "{}"
# create an instance of UserSummary from a JSON string
user_summary_instance = UserSummary.from_json(json)
# print the JSON string representation of the object
print(UserSummary.to_json())

# convert the object into a dict
user_summary_dict = user_summary_instance.to_dict()
# create an instance of UserSummary from a dict
user_summary_from_dict = UserSummary.from_dict(user_summary_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


