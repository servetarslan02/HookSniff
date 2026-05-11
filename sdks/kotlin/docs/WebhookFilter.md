
# WebhookFilter

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **status** | [**inline**](#Status) | Filter by delivery status |  |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **eventType** | **kotlin.String** | Filter by event type (e.g. order.created) |  |
| **fromDate** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **toDate** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **page** | **kotlin.Int** |  |  |
| **perPage** | **kotlin.Int** |  |  |


<a id="Status"></a>
## Enum: status
| Name | Value |
| ---- | ----- |
| status | pending, processing, delivered, failed |



