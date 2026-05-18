

# WebhookFilter

Query parameters for filtering webhook deliveries

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**status** | [**StatusEnum**](#StatusEnum) | Filter by delivery status |  |
|**endpointId** | **UUID** |  |  |
|**eventType** | **String** | Filter by event type (e.g. order.created) |  |
|**fromDate** | **OffsetDateTime** |  |  |
|**toDate** | **OffsetDateTime** |  |  |
|**page** | **Integer** |  |  |
|**perPage** | **Integer** |  |  |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| PENDING | &quot;pending&quot; |
| PROCESSING | &quot;processing&quot; |
| DELIVERED | &quot;delivered&quot; |
| FAILED | &quot;failed&quot; |



