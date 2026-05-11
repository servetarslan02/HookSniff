# BatchWebhookRequest


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**webhooks** | [**List[CreateWebhookRequest]**](CreateWebhookRequest.md) |  | 

## Example

```python
from hooksniff.models.batch_webhook_request import BatchWebhookRequest

# TODO update the JSON string below
json = "{}"
# create an instance of BatchWebhookRequest from a JSON string
batch_webhook_request_instance = BatchWebhookRequest.from_json(json)
# print the JSON string representation of the object
print(BatchWebhookRequest.to_json())

# convert the object into a dict
batch_webhook_request_dict = batch_webhook_request_instance.to_dict()
# create an instance of BatchWebhookRequest from a dict
batch_webhook_request_from_dict = BatchWebhookRequest.from_dict(batch_webhook_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


