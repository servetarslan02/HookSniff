
# UpdateEndpointRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **url** | [**java.net.URI**](java.net.URI.md) |  |  |
| **description** | **kotlin.String** |  |  |
| **isActive** | **kotlin.Boolean** |  |  |
| **allowedIps** | **kotlin.collections.List&lt;kotlin.String&gt;** |  |  |
| **eventFilter** | **kotlin.collections.List&lt;kotlin.String&gt;** |  |  |
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  |
| **routingStrategy** | [**inline**](#RoutingStrategy) |  |  |
| **fallbackUrl** | [**java.net.URI**](java.net.URI.md) |  |  |
| **format** | [**inline**](#Format) |  |  |
| **customHeaders** | [**kotlin.Any**](.md) |  |  [optional] |


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



