# AdminAuditEntry

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**customer_id** | **uuid::Uuid** |  | 
**action** | **String** |  | 
**resource_type** | **String** |  | 
**resource_id** | Option<**String**> |  | [optional]
**details** | Option<**serde_json::Value**> |  | [optional]
**ip_address** | Option<**String**> |  | [optional]
**user_agent** | Option<**String**> |  | [optional]
**created_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


