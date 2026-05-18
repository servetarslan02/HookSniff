# ChurnedUser

A user who churned (became inactive) recently

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**email** | **str** |  | 
**name** | **str** |  | [optional] 
**plan** | **str** |  | 
**amount** | **float** |  | 
**churn_date** | **datetime** |  | 

## Example

```python
from hooksniff.models.churned_user import ChurnedUser

# TODO update the JSON string below
json = "{}"
# create an instance of ChurnedUser from a JSON string
churned_user_instance = ChurnedUser.from_json(json)
# print the JSON string representation of the object
print(ChurnedUser.to_json())

# convert the object into a dict
churned_user_dict = churned_user_instance.to_dict()
# create an instance of ChurnedUser from a dict
churned_user_from_dict = ChurnedUser.from_dict(churned_user_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


