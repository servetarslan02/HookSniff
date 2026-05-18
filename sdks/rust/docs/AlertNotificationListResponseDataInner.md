# AlertNotificationListResponseDataInner

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**alert_rule_id** | Option<**uuid::Uuid**> |  | [optional]
**message** | Option<**String**> |  | [optional]
**channel** | Option<**String**> |  | [optional]
**status** | Option<**Status**> |  (enum: sent, failed, pending) | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


