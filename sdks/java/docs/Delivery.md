

# Delivery


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  [optional] |
|**endpointId** | **UUID** |  |  [optional] |
|**event** | **String** |  |  [optional] |
|**status** | [**StatusEnum**](#StatusEnum) |  |  [optional] |
|**attemptCount** | **Integer** |  |  [optional] |
|**responseStatus** | **Integer** |  |  [optional] |
|**replayCount** | **Integer** |  |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  [optional] |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| PENDING | &quot;pending&quot; |
| PROCESSING | &quot;processing&quot; |
| DELIVERED | &quot;delivered&quot; |
| FAILED | &quot;failed&quot; |



