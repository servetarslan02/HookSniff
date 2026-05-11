

# Endpoint


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  |
|**url** | **URI** |  |  |
|**description** | **String** |  |  [optional] |
|**isActive** | **Boolean** |  |  |
|**retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  |
|**createdAt** | **OffsetDateTime** |  |  |
|**allowedIps** | **List&lt;String&gt;** | CIDR blocks or exact IPs |  [optional] |
|**eventFilter** | **List&lt;String&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) |  [optional] |
|**customHeaders** | **Object** |  |  [optional] |
|**routingStrategy** | [**RoutingStrategyEnum**](#RoutingStrategyEnum) |  |  |
|**fallbackUrl** | **URI** |  |  [optional] |
|**avgResponseMs** | **Integer** |  |  |
|**failureStreak** | **Integer** |  |  |
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



