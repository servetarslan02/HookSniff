

# SystemStatus


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**overallStatus** | [**OverallStatusEnum**](#OverallStatusEnum) |  |  |
|**uptime30d** | **BigDecimal** |  |  |
|**components** | [**List&lt;SystemStatusComponentsInner&gt;**](SystemStatusComponentsInner.md) |  |  |
|**checkedAt** | **String** |  |  |



## Enum: OverallStatusEnum

| Name | Value |
|---- | -----|
| OPERATIONAL | &quot;operational&quot; |
| DEGRADED | &quot;degraded&quot; |
| DOWN | &quot;down&quot; |



