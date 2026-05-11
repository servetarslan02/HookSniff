

# AlertNotificationListResponseDataInner

Alert notification entry

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  [optional] |
|**alertRuleId** | **UUID** |  |  [optional] |
|**message** | **String** |  |  [optional] |
|**channel** | **String** |  |  [optional] |
|**status** | [**StatusEnum**](#StatusEnum) |  |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  [optional] |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| SENT | &quot;sent&quot; |
| FAILED | &quot;failed&quot; |
| PENDING | &quot;pending&quot; |



