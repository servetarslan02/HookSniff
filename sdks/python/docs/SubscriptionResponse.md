# SubscriptionResponse


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**plan** | **str** |  | [optional] 
**status** | **str** |  | [optional] 
**payment_provider** | **str** |  | [optional] 
**webhook_limit** | **int** |  | [optional] 
**endpoint_limit** | **int** |  | [optional] 
**retention_days** | **int** |  | [optional] 
**monthly_price_cents** | **int** |  | [optional] 

## Example

```python
from hooksniff.models.subscription_response import SubscriptionResponse

# TODO update the JSON string below
json = "{}"
# create an instance of SubscriptionResponse from a JSON string
subscription_response_instance = SubscriptionResponse.from_json(json)
# print the JSON string representation of the object
print(SubscriptionResponse.to_json())

# convert the object into a dict
subscription_response_dict = subscription_response_instance.to_dict()
# create an instance of SubscriptionResponse from a dict
subscription_response_from_dict = SubscriptionResponse.from_dict(subscription_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


