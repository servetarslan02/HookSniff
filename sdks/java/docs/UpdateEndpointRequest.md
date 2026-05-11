

# UpdateEndpointRequest


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**url** | **URI** |  |  |
|**description** | **String** |  |  |
|**isActive** | **Boolean** |  |  |
|**allowedIps** | **List&lt;String&gt;** |  |  |
|**eventFilter** | **List&lt;String&gt;** |  |  |
|**customHeaders** | **Object** |  |  [optional] |
|**retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  |
|**routingStrategy** | [**RoutingStrategyEnum**](#RoutingStrategyEnum) |  |  |
|**fallbackUrl** | **URI** |  |  |
|**format** | [**FormatEnum**](#FormatEnum) |  |  |



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



