

# RetryPolicy


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**maxAttempts** | **Integer** |  |  [optional] |
|**backoff** | [**BackoffEnum**](#BackoffEnum) |  |  [optional] |
|**initialDelaySecs** | **Integer** |  |  [optional] |
|**maxDelaySecs** | **Integer** |  |  [optional] |



## Enum: BackoffEnum

| Name | Value |
|---- | -----|
| EXPONENTIAL | &quot;exponential&quot; |
| LINEAR | &quot;linear&quot; |
| FIXED | &quot;fixed&quot; |



