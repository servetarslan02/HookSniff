

# RetryPolicy


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**maxAttempts** | **Integer** |  |  |
|**backoff** | [**BackoffEnum**](#BackoffEnum) |  |  |
|**initialDelaySecs** | **Integer** |  |  |
|**maxDelaySecs** | **Integer** |  |  |



## Enum: BackoffEnum

| Name | Value |
|---- | -----|
| EXPONENTIAL | &quot;exponential&quot; |
| LINEAR | &quot;linear&quot; |
| FIXED | &quot;fixed&quot; |



