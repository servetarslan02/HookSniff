

# CustomerResponse


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  |
|**email** | **String** |  |  |
|**name** | **String** |  |  [optional] |
|**apiKey** | **String** | Only returned on registration |  [optional] |
|**plan** | [**PlanEnum**](#PlanEnum) |  |  |
|**webhookLimit** | **Integer** |  |  |
|**webhookCount** | **Integer** |  |  |
|**isAdmin** | **Boolean** |  |  |
|**createdAt** | **OffsetDateTime** |  |  |



## Enum: PlanEnum

| Name | Value |
|---- | -----|
| FREE | &quot;free&quot; |
| PRO | &quot;pro&quot; |
| BUSINESS | &quot;business&quot; |



