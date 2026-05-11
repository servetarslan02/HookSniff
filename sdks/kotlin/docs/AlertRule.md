
# AlertRule

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |
| **name** | **kotlin.String** |  |  [optional] |
| **condition** | [**inline**](#Condition) |  |  [optional] |
| **threshold** | **kotlin.Int** |  |  [optional] |
| **channels** | [**inline**](#kotlin.collections.List&lt;Channels&gt;) |  |  [optional] |
| **isActive** | **kotlin.Boolean** |  |  [optional] |
| **createdAt** | **kotlin.String** |  |  [optional] |


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



