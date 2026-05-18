# DeliveryDetailResponse

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**delivery** | [**models::Delivery**](Delivery.md) |  | 
**attempts** | [**Vec<models::DeliveryAttempt>**](DeliveryAttempt.md) |  | 
**endpoint** | Option<[**models::Endpoint**](Endpoint.md)> |  | [optional]
**request_headers** | Option<**serde_json::Value**> | Original request headers sent with the delivery | [optional]
**request_body** | Option<**serde_json::Value**> | Original request body sent with the delivery | [optional]
**response_headers** | Option<**serde_json::Value**> | Response headers received from the endpoint | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


