# AdminCreateAlertRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**customer_id** | Option<**uuid::Uuid**> |  | [optional]
**name** | **String** |  | 
**condition** | **Condition** |  (enum: failure_rate, latency, consecutive_failures) | 
**threshold** | **i32** |  | 
**channels** | **Vec<Channels>** |  (enum: slack, email, webhook) | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


