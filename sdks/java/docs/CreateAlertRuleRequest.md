

# CreateAlertRuleRequest

Request to create a new alert rule

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**name** | **String** | Human-readable alert name |  |
|**condition** | [**ConditionEnum**](#ConditionEnum) | Condition that triggers the alert |  |
|**threshold** | **Integer** | Threshold value for the condition |  |
|**channels** | [**List&lt;ChannelsEnum&gt;**](#List&lt;ChannelsEnum&gt;) | Notification channels to alert on |  |



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



