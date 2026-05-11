
# AdminSystemStatus

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **version** | **kotlin.String** |  |  |
| **uptimeSeconds** | **kotlin.Int** |  |  |
| **dbStatus** | [**inline**](#DbStatus) |  |  |
| **redisStatus** | [**inline**](#RedisStatus) |  |  |
| **queueDepth** | **kotlin.Int** | Number of pending jobs in the delivery queue |  |


<a id="DbStatus"></a>
## Enum: db_status
| Name | Value |
| ---- | ----- |
| dbStatus | healthy, degraded, down |


<a id="RedisStatus"></a>
## Enum: redis_status
| Name | Value |
| ---- | ----- |
| redisStatus | healthy, degraded, down |



