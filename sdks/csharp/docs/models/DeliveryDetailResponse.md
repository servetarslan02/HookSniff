# hooksniff.Model.DeliveryDetailResponse
Full delivery detail including all retry attempts and endpoint info

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Delivery** | [**Delivery**](Delivery.md) |  | 
**Attempts** | [**List&lt;DeliveryAttempt&gt;**](DeliveryAttempt.md) |  | 
**Endpoint** | [**Endpoint**](Endpoint.md) |  | [optional] 
**RequestHeaders** | **Object** | Original request headers sent with the delivery | [optional] 
**RequestBody** | **Object** | Original request body sent with the delivery | [optional] 
**ResponseHeaders** | **Object** | Response headers received from the endpoint | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

