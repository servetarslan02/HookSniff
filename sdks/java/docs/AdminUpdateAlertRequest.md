

# AdminUpdateAlertRequest

Update an alert rule (admin, all fields optional)

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**name** | **String** |  |  [optional] |
|**condition** | [**ConditionEnum**](#ConditionEnum) |  |  [optional] |
|**threshold** | **Integer** |  |  [optional] |
|**channels** | [**List&lt;ChannelsEnum&gt;**](#List&lt;ChannelsEnum&gt;) |  |  [optional] |
|**isActive** | **Boolean** |  |  [optional] |



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



