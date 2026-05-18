

# InboundWebhookResponse

Result of processing an inbound webhook

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  |
|**status** | [**StatusEnum**](#StatusEnum) | Processing status of the inbound webhook |  |
|**endpointId** | **UUID** |  |  |
|**receivedAt** | **OffsetDateTime** |  |  |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| ACCEPTED | &quot;accepted&quot; |
| REJECTED | &quot;rejected&quot; |
| PROCESSING | &quot;processing&quot; |



