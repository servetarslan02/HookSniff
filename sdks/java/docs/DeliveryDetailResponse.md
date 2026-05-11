

# DeliveryDetailResponse

Full delivery detail including all retry attempts and endpoint info

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**delivery** | [**Delivery**](Delivery.md) |  |  |
|**attempts** | [**List&lt;DeliveryAttempt&gt;**](DeliveryAttempt.md) |  |  |
|**endpoint** | [**Endpoint**](Endpoint.md) |  |  [optional] |
|**requestHeaders** | **Object** | Original request headers sent with the delivery |  [optional] |
|**requestBody** | **Object** | Original request body sent with the delivery |  [optional] |
|**responseHeaders** | **Object** | Response headers received from the endpoint |  [optional] |



