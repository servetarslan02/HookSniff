

# Delivery


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  |
|**endpointId** | **UUID** |  |  |
|**event** | **String** |  |  [optional] |
|**status** | [**StatusEnum**](#StatusEnum) |  |  |
|**attemptCount** | **Integer** |  |  |
|**responseStatus** | **Integer** |  |  [optional] |
|**replayCount** | **Integer** |  |  |
|**createdAt** | **OffsetDateTime** |  |  |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| PENDING | &quot;pending&quot; |
| PROCESSING | &quot;processing&quot; |
| DELIVERED | &quot;delivered&quot; |
| FAILED | &quot;failed&quot; |



