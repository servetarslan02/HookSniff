# CustomerResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**email** | Option<**String**> |  | [optional]
**name** | Option<**String**> |  | [optional]
**api_key** | Option<**String**> | Only returned on registration | [optional]
**plan** | Option<**Plan**> |  (enum: free, pro, business) | [optional]
**webhook_limit** | Option<**i32**> |  | [optional]
**webhook_count** | Option<**i32**> |  | [optional]
**is_admin** | Option<**bool**> |  | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


