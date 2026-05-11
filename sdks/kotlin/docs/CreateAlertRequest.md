
# CreateAlertRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **name** | **kotlin.String** |  |  |
| **condition** | [**inline**](#Condition) |  |  |
| **threshold** | **kotlin.Int** |  |  |
| **channels** | **kotlin.collections.List&lt;kotlin.String&gt;** |  |  |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |


<a id="Condition"></a>
## Enum: condition
| Name | Value |
| ---- | ----- |
| condition | failure_rate, latency, consecutive_failures |



