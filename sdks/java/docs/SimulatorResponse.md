

# SimulatorResponse

Result of a simulated webhook delivery

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**deliveryId** | **UUID** |  |  |
|**status** | [**StatusEnum**](#StatusEnum) |  |  |
|**latencyMs** | **Integer** | Response time from the endpoint |  |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| DELIVERED | &quot;delivered&quot; |
| FAILED | &quot;failed&quot; |
| PENDING | &quot;pending&quot; |



