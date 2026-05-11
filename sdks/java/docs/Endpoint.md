

# Endpoint


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  [optional] |
|**url** | **URI** |  |  [optional] |
|**description** | **String** |  |  [optional] |
|**isActive** | **Boolean** |  |  [optional] |
|**retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  [optional] |
|**allowedIps** | **List&lt;String&gt;** | CIDR blocks or exact IPs |  [optional] |
|**eventFilter** | **List&lt;String&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) |  [optional] |
|**customHeaders** | **Object** |  |  [optional] |
|**routingStrategy** | [**RoutingStrategyEnum**](#RoutingStrategyEnum) |  |  [optional] |
|**fallbackUrl** | **URI** |  |  [optional] |
|**avgResponseMs** | **Integer** |  |  [optional] |
|**failureStreak** | **Integer** |  |  [optional] |
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



