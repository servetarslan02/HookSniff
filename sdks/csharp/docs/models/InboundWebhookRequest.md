# hooksniff.Model.InboundWebhookRequest
Raw webhook payload received from an external provider (Stripe, GitHub, etc.)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Provider** | **string** | Provider name (e.g. stripe, github, shopify) | 
**Payload** | **Object** | Raw webhook payload body | 
**Headers** | **Object** | HTTP headers from the incoming webhook request | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

