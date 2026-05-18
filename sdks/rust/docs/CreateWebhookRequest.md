# CreateWebhookRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | 
**event** | Option<**String**> | Event type (e.g. \"order.created\") | [optional]
**data** | **serde_json::Value** | Webhook payload | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


