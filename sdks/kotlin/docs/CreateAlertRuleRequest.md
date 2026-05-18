
# CreateAlertRuleRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **name** | **kotlin.String** | Human-readable alert name |  |
| **condition** | [**inline**](#Condition) | Condition that triggers the alert |  |
| **threshold** | **kotlin.Int** | Threshold value for the condition |  |
| **channels** | [**inline**](#kotlin.collections.List&lt;Channels&gt;) | Notification channels to alert on |  |


<a id="Condition"></a>
## Enum: condition
| Name | Value |
| ---- | ----- |
| condition | failure_rate, latency, consecutive_failures |


<a id="kotlin.collections.List<Channels>"></a>
## Enum: channels
| Name | Value |
| ---- | ----- |
| channels | slack, email, webhook |



