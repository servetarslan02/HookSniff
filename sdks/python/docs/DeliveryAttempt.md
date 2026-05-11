# DeliveryAttempt


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**attempt_number** | **int** |  | 
**status_code** | **int** |  | [optional] 
**response_body** | **str** |  | [optional] 
**duration_ms** | **int** |  | [optional] 
**error_message** | **str** |  | [optional] 
**created_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.delivery_attempt import DeliveryAttempt

# TODO update the JSON string below
json = "{}"
# create an instance of DeliveryAttempt from a JSON string
delivery_attempt_instance = DeliveryAttempt.from_json(json)
# print the JSON string representation of the object
print(DeliveryAttempt.to_json())

# convert the object into a dict
delivery_attempt_dict = delivery_attempt_instance.to_dict()
# create an instance of DeliveryAttempt from a dict
delivery_attempt_from_dict = DeliveryAttempt.from_dict(delivery_attempt_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


