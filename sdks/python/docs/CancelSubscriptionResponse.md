# CancelSubscriptionResponse

Result of subscription cancellation

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**cancelled_at** | **datetime** |  | 
**ends_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.cancel_subscription_response import CancelSubscriptionResponse

# TODO update the JSON string below
json = "{}"
# create an instance of CancelSubscriptionResponse from a JSON string
cancel_subscription_response_instance = CancelSubscriptionResponse.from_json(json)
# print the JSON string representation of the object
print(CancelSubscriptionResponse.to_json())

# convert the object into a dict
cancel_subscription_response_dict = cancel_subscription_response_instance.to_dict()
# create an instance of CancelSubscriptionResponse from a dict
cancel_subscription_response_from_dict = CancelSubscriptionResponse.from_dict(cancel_subscription_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


