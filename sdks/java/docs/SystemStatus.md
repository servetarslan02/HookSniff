

# SystemStatus


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**overallStatus** | [**OverallStatusEnum**](#OverallStatusEnum) |  |  [optional] |
|**uptime30d** | **BigDecimal** |  |  [optional] |
|**components** | [**List&lt;SystemStatusComponentsInner&gt;**](SystemStatusComponentsInner.md) |  |  [optional] |
|**checkedAt** | **String** |  |  [optional] |



## Enum: OverallStatusEnum

| Name | Value |
|---- | -----|
| OPERATIONAL | &quot;operational&quot; |
| DEGRADED | &quot;degraded&quot; |
| DOWN | &quot;down&quot; |



