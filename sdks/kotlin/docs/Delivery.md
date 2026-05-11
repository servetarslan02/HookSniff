
# Delivery

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **status** | [**inline**](#Status) |  |  |
| **attemptCount** | **kotlin.Int** |  |  |
| **replayCount** | **kotlin.Int** |  |  |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **event** | **kotlin.String** |  |  [optional] |
| **responseStatus** | **kotlin.Int** |  |  [optional] |


<a id="Status"></a>
## Enum: status
| Name | Value |
| ---- | ----- |
| status | pending, processing, delivered, failed |



