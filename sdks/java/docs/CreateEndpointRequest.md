

# CreateEndpointRequest


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**url** | **URI** |  |  |
|**description** | **String** |  |  [optional] |
|**allowedIps** | **List&lt;String&gt;** |  |  [optional] |
|**eventFilter** | **List&lt;String&gt;** |  |  [optional] |
|**customHeaders** | **Object** |  |  [optional] |
|**retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  [optional] |
|**routingStrategy** | [**RoutingStrategyEnum**](#RoutingStrategyEnum) |  |  [optional] |
|**fallbackUrl** | **URI** |  |  [optional] |
|**format** | [**FormatEnum**](#FormatEnum) |  |  [optional] |



## Enum: RoutingStrategyEnum

| Name | Value |
|---- | -----|
| ROUND_ROBIN | &quot;round-robin&quot; |
| LATENCY | &quot;latency&quot; |
| FAILOVER | &quot;failover&quot; |



## Enum: FormatEnum

| Name | Value |
|---- | -----|
| STANDARD | &quot;standard&quot; |
| CLOUDEVENTS | &quot;cloudevents&quot; |



