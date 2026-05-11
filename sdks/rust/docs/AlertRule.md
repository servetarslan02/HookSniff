# AlertRule

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**name** | Option<**String**> |  | [optional]
**condition** | Option<**Condition**> |  (enum: failure_rate, latency, consecutive_failures) | [optional]
**threshold** | Option<**i32**> |  | [optional]
**channels** | Option<**Vec<Channels>**> |  (enum: slack, email, webhook) | [optional]
**is_active** | Option<**bool**> |  | [optional]
**created_at** | Option<**String**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


