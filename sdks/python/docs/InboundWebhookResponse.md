# InboundWebhookResponse

Result of processing an inbound webhook

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**status** | **str** | Processing status of the inbound webhook | 
**endpoint_id** | **UUID** |  | 
**received_at** | **datetime** |  | 

## Example

```python
from hooksniff.models.inbound_webhook_response import InboundWebhookResponse

# TODO update the JSON string below
json = "{}"
# create an instance of InboundWebhookResponse from a JSON string
inbound_webhook_response_instance = InboundWebhookResponse.from_json(json)
# print the JSON string representation of the object
print(InboundWebhookResponse.to_json())

# convert the object into a dict
inbound_webhook_response_dict = inbound_webhook_response_instance.to_dict()
# create an instance of InboundWebhookResponse from a dict
inbound_webhook_response_from_dict = InboundWebhookResponse.from_dict(inbound_webhook_response_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


