

# EndpointHealth

Endpoint health metrics and status

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**endpointId** | **UUID** |  |  |
|**isHealthy** | **Boolean** |  |  |
|**failureStreak** | **Integer** |  |  [optional] |
|**avgResponseMs** | **Integer** |  |  [optional] |
|**lastFailureAt** | **OffsetDateTime** |  |  [optional] |
|**successRate** | **Double** | Success rate as a fraction (0.0–1.0) |  [optional] |
|**avgLatencyMs** | **BigDecimal** | Average delivery latency in milliseconds |  [optional] |
|**lastDeliveryAt** | **OffsetDateTime** |  |  [optional] |
|**totalDeliveries** | **Integer** |  |  [optional] |
|**failedDeliveries** | **Integer** |  |  [optional] |



