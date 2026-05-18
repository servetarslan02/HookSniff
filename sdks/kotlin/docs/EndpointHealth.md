
# EndpointHealth

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **isHealthy** | **kotlin.Boolean** |  |  |
| **failureStreak** | **kotlin.Int** |  |  [optional] |
| **avgResponseMs** | **kotlin.Int** |  |  [optional] |
| **lastFailureAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  [optional] |
| **successRate** | **kotlin.Double** | Success rate as a fraction (0.0–1.0) |  [optional] |
| **avgLatencyMs** | [**java.math.BigDecimal**](java.math.BigDecimal.md) | Average delivery latency in milliseconds |  [optional] |
| **lastDeliveryAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  [optional] |
| **totalDeliveries** | **kotlin.Int** |  |  [optional] |
| **failedDeliveries** | **kotlin.Int** |  |  [optional] |



