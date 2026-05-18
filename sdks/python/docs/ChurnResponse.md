# ChurnResponse

Churn report with list of recently churned users

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**users** | [**List[ChurnedUser]**](ChurnedUser.md) |  | 

## Example

```python
from hooksniff.models.churn_response import ChurnResponse

# TODO update the JSON string below
json = "{}"
# create an instance of ChurnResponse from a JSON string
churn_response_instance = ChurnResponse.from_json(json)
# print the JSON string representation of the object
print(ChurnResponse.to_json())

# convert the object into a dict
churn_response_dict = churn_response_instance.to_dict()
# create an instance of ChurnResponse from a dict
churn_response_from_dict = ChurnResponse.from_dict(churn_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


