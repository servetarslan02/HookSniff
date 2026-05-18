# InboundConfig

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**customer_id** | Option<**uuid::Uuid**> |  | [optional]
**provider** | Option<**String**> | Provider name (stripe, github, shopify, generic) | [optional]
**secret** | Option<**String**> | Webhook signing secret | [optional]
**endpoint_id** | Option<**uuid::Uuid**> |  | [optional]
**enabled** | Option<**bool**> |  | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


