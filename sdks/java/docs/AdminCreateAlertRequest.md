

# AdminCreateAlertRequest

Create a platform alert rule (admin)

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**customerId** | **UUID** |  |  [optional] |
|**name** | **String** |  |  |
|**condition** | [**ConditionEnum**](#ConditionEnum) |  |  |
|**threshold** | **Integer** |  |  |
|**channels** | [**List&lt;ChannelsEnum&gt;**](#List&lt;ChannelsEnum&gt;) |  |  |



## Enum: ConditionEnum

| Name | Value |
|---- | -----|
| FAILURE_RATE | &quot;failure_rate&quot; |
| LATENCY | &quot;latency&quot; |
| CONSECUTIVE_FAILURES | &quot;consecutive_failures&quot; |



## Enum: List&lt;ChannelsEnum&gt;

| Name | Value |
|---- | -----|
| SLACK | &quot;slack&quot; |
| EMAIL | &quot;email&quot; |
| WEBHOOK | &quot;webhook&quot; |



