# InboundWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **String** | Provider name (e.g. stripe, github, shopify) | 
**payload** | **serde_json::Value** | Raw webhook payload body | 
**headers** | Option<**serde_json::Value**> | HTTP headers from the incoming webhook request | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


