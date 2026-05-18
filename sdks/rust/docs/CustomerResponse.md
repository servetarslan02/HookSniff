# CustomerResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**email** | **String** |  | 
**name** | Option<**String**> |  | [optional]
**api_key** | Option<**String**> | Only returned on registration | [optional]
**plan** | **Plan** |  (enum: free, pro, business) | 
**webhook_limit** | **i32** |  | 
**webhook_count** | **i32** |  | 
**is_admin** | **bool** |  | 
**created_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


