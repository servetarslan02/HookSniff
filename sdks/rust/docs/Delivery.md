# Delivery

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**endpoint_id** | Option<**uuid::Uuid**> |  | [optional]
**event** | Option<**String**> |  | [optional]
**status** | Option<**Status**> |  (enum: pending, processing, delivered, failed) | [optional]
**attempt_count** | Option<**i32**> |  | [optional]
**response_status** | Option<**i32**> |  | [optional]
**replay_count** | Option<**i32**> |  | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


