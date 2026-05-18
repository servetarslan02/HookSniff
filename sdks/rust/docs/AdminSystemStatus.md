# AdminSystemStatus

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**version** | **String** |  | 
**uptime_seconds** | **i32** |  | 
**db_status** | **DbStatus** |  (enum: healthy, degraded, down) | 
**redis_status** | **RedisStatus** |  (enum: healthy, degraded, down) | 
**queue_depth** | **i32** | Number of pending jobs in the delivery queue | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


