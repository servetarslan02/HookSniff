
# Endpoint

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |
| **url** | [**java.net.URI**](java.net.URI.md) |  |  [optional] |
| **description** | **kotlin.String** |  |  [optional] |
| **isActive** | **kotlin.Boolean** |  |  [optional] |
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  [optional] |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  [optional] |
| **allowedIps** | **kotlin.collections.List&lt;kotlin.String&gt;** | CIDR blocks or exact IPs |  [optional] |
| **eventFilter** | **kotlin.collections.List&lt;kotlin.String&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) |  [optional] |
| **customHeaders** | [**kotlin.Any**](.md) |  |  [optional] |
| **routingStrategy** | [**inline**](#RoutingStrategy) |  |  [optional] |
| **fallbackUrl** | [**java.net.URI**](java.net.URI.md) |  |  [optional] |
| **avgResponseMs** | **kotlin.Int** |  |  [optional] |
| **failureStreak** | **kotlin.Int** |  |  [optional] |
| **format** | [**inline**](#Format) |  |  [optional] |


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



