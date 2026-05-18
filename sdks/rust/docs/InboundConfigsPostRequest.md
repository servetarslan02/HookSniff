# InboundConfigsPostRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**provider** | **String** | Provider name (stripe, github, shopify, generic) | 
**secret** | **String** | Webhook signing secret | 
**endpoint_id** | Option<**uuid::Uuid**> | Default target endpoint | [optional]
**enabled** | Option<**bool**> |  | [optional][default to true]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


