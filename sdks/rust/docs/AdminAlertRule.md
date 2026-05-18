# AdminAlertRule

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**customer_id** | Option<**uuid::Uuid**> |  | [optional]
**customer_email** | Option<**String**> |  | [optional]
**name** | **String** |  | 
**condition** | **Condition** |  (enum: failure_rate, latency, consecutive_failures) | 
**threshold** | **i32** |  | 
**channels** | **Vec<Channels>** |  (enum: slack, email, webhook) | 
**is_active** | **bool** |  | 
**created_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


