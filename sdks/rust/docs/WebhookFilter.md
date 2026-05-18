# WebhookFilter

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **Status** | Filter by delivery status (enum: pending, processing, delivered, failed) | 
**endpoint_id** | **uuid::Uuid** |  | 
**event_type** | **String** | Filter by event type (e.g. order.created) | 
**from_date** | **chrono::DateTime<chrono::FixedOffset>** |  | 
**to_date** | **chrono::DateTime<chrono::FixedOffset>** |  | 
**page** | **i32** |  | [default to 1]
**per_page** | **i32** |  | [default to 20]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


