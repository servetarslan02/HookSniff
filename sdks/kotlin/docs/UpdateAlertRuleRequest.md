
# UpdateAlertRuleRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **name** | **kotlin.String** |  |  |
| **condition** | [**inline**](#Condition) |  |  |
| **threshold** | **kotlin.Int** |  |  |
| **channels** | [**inline**](#kotlin.collections.List&lt;Channels&gt;) |  |  |


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



