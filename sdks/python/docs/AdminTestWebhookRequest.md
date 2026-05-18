# AdminTestWebhookRequest

Send a test HTTP POST to a URL (admin)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_url** | **str** |  | 
**event_type** | **str** |  | [optional] 
**payload** | **object** |  | 

## Example

```python
from hooksniff.models.admin_test_webhook_request import AdminTestWebhookRequest

# TODO update the JSON string below
json = "{}"
# create an instance of AdminTestWebhookRequest from a JSON string
admin_test_webhook_request_instance = AdminTestWebhookRequest.from_json(json)
# print the JSON string representation of the object
print(AdminTestWebhookRequest.to_json())

# convert the object into a dict
admin_test_webhook_request_dict = admin_test_webhook_request_instance.to_dict()
# create an instance of AdminTestWebhookRequest from a dict
admin_test_webhook_request_from_dict = AdminTestWebhookRequest.from_dict(admin_test_webhook_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


