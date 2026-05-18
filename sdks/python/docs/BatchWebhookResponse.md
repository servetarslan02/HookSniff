# BatchWebhookResponse

Response for batch webhook delivery creation

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**delivery_ids** | **List[UUID]** | List of created delivery IDs | 
**count** | **int** | Number of deliveries created | 

## Example

```python
from hooksniff.models.batch_webhook_response import BatchWebhookResponse

# TODO update the JSON string below
json = "{}"
# create an instance of BatchWebhookResponse from a JSON string
batch_webhook_response_instance = BatchWebhookResponse.from_json(json)
# print the JSON string representation of the object
print(BatchWebhookResponse.to_json())

# convert the object into a dict
batch_webhook_response_dict = batch_webhook_response_instance.to_dict()
# create an instance of BatchWebhookResponse from a dict
batch_webhook_response_from_dict = BatchWebhookResponse.from_dict(batch_webhook_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


