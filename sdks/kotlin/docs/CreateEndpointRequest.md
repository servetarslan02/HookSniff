
# CreateEndpointRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **url** | [**java.net.URI**](java.net.URI.md) |  |  |
| **description** | **kotlin.String** |  |  [optional] |
| **allowedIps** | **kotlin.collections.List&lt;kotlin.String&gt;** |  |  [optional] |
| **eventFilter** | **kotlin.collections.List&lt;kotlin.String&gt;** |  |  [optional] |
| **customHeaders** | [**kotlin.Any**](.md) |  |  [optional] |
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  [optional] |
| **routingStrategy** | [**inline**](#RoutingStrategy) |  |  [optional] |
| **fallbackUrl** | [**java.net.URI**](java.net.URI.md) |  |  [optional] |
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



