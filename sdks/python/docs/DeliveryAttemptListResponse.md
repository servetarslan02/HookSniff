# DeliveryAttemptListResponse

Paginated list of delivery attempts

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**data** | [**List[DeliveryAttempt]**](DeliveryAttempt.md) |  | 
**has_more** | **bool** |  | 
**total** | **int** |  | 

## Example

```python
from hooksniff.models.delivery_attempt_list_response import DeliveryAttemptListResponse

# TODO update the JSON string below
json = "{}"
# create an instance of DeliveryAttemptListResponse from a JSON string
delivery_attempt_list_response_instance = DeliveryAttemptListResponse.from_json(json)
# print the JSON string representation of the object
print(DeliveryAttemptListResponse.to_json())

# convert the object into a dict
delivery_attempt_list_response_dict = delivery_attempt_list_response_instance.to_dict()
# create an instance of DeliveryAttemptListResponse from a dict
delivery_attempt_list_response_from_dict = DeliveryAttemptListResponse.from_dict(delivery_attempt_list_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


