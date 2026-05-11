# RoutingRuleListResponseDataInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**name** | **String** |  | 
**conditions** | **serde_json::Value** |  | 
**transform** | Option<**serde_json::Value**> |  | [optional]
**target_endpoint_id** | **uuid::Uuid** |  | 
**enabled** | Option<**bool**> |  | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


