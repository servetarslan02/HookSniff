
# Delivery

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |
| **event** | **kotlin.String** |  |  [optional] |
| **status** | [**inline**](#Status) |  |  [optional] |
| **attemptCount** | **kotlin.Int** |  |  [optional] |
| **responseStatus** | **kotlin.Int** |  |  [optional] |
| **replayCount** | **kotlin.Int** |  |  [optional] |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  [optional] |


<a id="Status"></a>
## Enum: status
| Name | Value |
| ---- | ----- |
| status | pending, processing, delivered, failed |



