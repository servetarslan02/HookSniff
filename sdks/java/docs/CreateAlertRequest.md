

# CreateAlertRequest


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**name** | **String** |  |  |
|**condition** | [**ConditionEnum**](#ConditionEnum) |  |  |
|**threshold** | **Integer** |  |  |
|**channels** | **List&lt;String&gt;** |  |  |
|**endpointId** | **UUID** |  |  [optional] |



## Enum: ConditionEnum

| Name | Value |
|---- | -----|
| FAILURE_RATE | &quot;failure_rate&quot; |
| LATENCY | &quot;latency&quot; |
| CONSECUTIVE_FAILURES | &quot;consecutive_failures&quot; |



