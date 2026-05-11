# Delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**endpoint_id** | **uuid::Uuid** |  | 
**event** | Option<**String**> |  | [optional]
**status** | **Status** |  (enum: pending, processing, delivered, failed) | 
**attempt_count** | **i32** |  | 
**response_status** | Option<**i32**> |  | [optional]
**replay_count** | **i32** |  | 
**created_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


