
# Endpoint

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **url** | [**java.net.URI**](java.net.URI.md) |  |  |
| **isActive** | **kotlin.Boolean** |  |  |
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **routingStrategy** | [**inline**](#RoutingStrategy) |  |  |
| **avgResponseMs** | **kotlin.Int** |  |  |
| **failureStreak** | **kotlin.Int** |  |  |
| **format** | [**inline**](#Format) |  |  |
| **description** | **kotlin.String** |  |  [optional] |
| **allowedIps** | **kotlin.collections.List&lt;kotlin.String&gt;** | CIDR blocks or exact IPs |  [optional] |
| **eventFilter** | **kotlin.collections.List&lt;kotlin.String&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) |  [optional] |
| **customHeaders** | [**kotlin.Any**](.md) |  |  [optional] |
| **fallbackUrl** | [**java.net.URI**](java.net.URI.md) |  |  [optional] |


<a id="RoutingStrategy"></a>
## Enum: routing_strategy
| Name | Value |
| ---- | ----- |
| routingStrategy | round-robin, latency, failover |


<a id="Format"></a>
## Enum: format
| Name | Value |
| ---- | ----- |
| format | standard, cloudevents |



