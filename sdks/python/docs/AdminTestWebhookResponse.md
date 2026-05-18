# AdminTestWebhookResponse

Result of a test webhook delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status_code** | **int** |  | 
**response_body** | **str** |  | 
**duration_ms** | **int** |  | 

## Example

```python
from hooksniff.models.admin_test_webhook_response import AdminTestWebhookResponse

# TODO update the JSON string below
json = "{}"
# create an instance of AdminTestWebhookResponse from a JSON string
admin_test_webhook_response_instance = AdminTestWebhookResponse.from_json(json)
# print the JSON string representation of the object
print(AdminTestWebhookResponse.to_json())

# convert the object into a dict
admin_test_webhook_response_dict = admin_test_webhook_response_instance.to_dict()
# create an instance of AdminTestWebhookResponse from a dict
admin_test_webhook_response_from_dict = AdminTestWebhookResponse.from_dict(admin_test_webhook_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


