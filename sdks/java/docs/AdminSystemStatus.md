

# AdminSystemStatus

System-level status for admin dashboard

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**version** | **String** |  |  |
|**uptimeSeconds** | **Integer** |  |  |
|**dbStatus** | [**DbStatusEnum**](#DbStatusEnum) |  |  |
|**redisStatus** | [**RedisStatusEnum**](#RedisStatusEnum) |  |  |
|**queueDepth** | **Integer** | Number of pending jobs in the delivery queue |  |



## Enum: DbStatusEnum

| Name | Value |
|---- | -----|
| HEALTHY | &quot;healthy&quot; |
| DEGRADED | &quot;degraded&quot; |
| DOWN | &quot;down&quot; |



## Enum: RedisStatusEnum

| Name | Value |
|---- | -----|
| HEALTHY | &quot;healthy&quot; |
| DEGRADED | &quot;degraded&quot; |
| DOWN | &quot;down&quot; |



