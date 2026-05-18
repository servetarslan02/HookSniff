
# AlertRule

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **name** | **kotlin.String** |  |  |
| **condition** | [**inline**](#Condition) |  |  |
| **threshold** | **kotlin.Int** |  |  |
| **channels** | [**inline**](#kotlin.collections.List&lt;Channels&gt;) |  |  |
| **isActive** | **kotlin.Boolean** |  |  |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |


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



