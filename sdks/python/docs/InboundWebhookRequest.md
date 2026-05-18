# InboundWebhookRequest

Raw webhook payload received from an external provider (Stripe, GitHub, etc.)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **str** | Provider name (e.g. stripe, github, shopify) | 
**payload** | **object** | Raw webhook payload body | 
**headers** | **object** | HTTP headers from the incoming webhook request | [optional] 

## Example

```python
from hooksniff.models.inbound_webhook_request import InboundWebhookRequest

# TODO update the JSON string below
json = "{}"
# create an instance of InboundWebhookRequest from a JSON string
inbound_webhook_request_instance = InboundWebhookRequest.from_json(json)
# print the JSON string representation of the object
print(InboundWebhookRequest.to_json())

# convert the object into a dict
inbound_webhook_request_dict = inbound_webhook_request_instance.to_dict()
# create an instance of InboundWebhookRequest from a dict
inbound_webhook_request_from_dict = InboundWebhookRequest.from_dict(inbound_webhook_request_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


