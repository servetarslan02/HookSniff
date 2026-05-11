# TestWebhookRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **UUID** |  | 
**payload** | **object** |  | 
**event** | **str** |  | [optional] 

## Example

```python
from hooksniff.models.test_webhook_request import TestWebhookRequest

# TODO update the JSON string below
json = "{}"
# create an instance of TestWebhookRequest from a JSON string
test_webhook_request_instance = TestWebhookRequest.from_json(json)
# print the JSON string representation of the object
print(TestWebhookRequest.to_json())

# convert the object into a dict
test_webhook_request_dict = test_webhook_request_instance.to_dict()
# create an instance of TestWebhookRequest from a dict
test_webhook_request_from_dict = TestWebhookRequest.from_dict(test_webhook_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


