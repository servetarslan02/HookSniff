
# AdminCreateAlertRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **name** | **kotlin.String** |  |  |
| **condition** | [**inline**](#Condition) |  |  |
| **threshold** | **kotlin.Int** |  |  |
| **channels** | [**inline**](#kotlin.collections.List&lt;Channels&gt;) |  |  |
| **customerId** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |


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



