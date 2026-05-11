
# InboundWebhookResponse

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **status** | [**inline**](#Status) | Processing status of the inbound webhook |  |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **receivedAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |


<a id="Status"></a>
## Enum: status
| Name | Value |
| ---- | ----- |
| status | accepted, rejected, processing |



