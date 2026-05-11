

# CustomerResponse


## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  [optional] |
|**email** | **String** |  |  [optional] |
|**name** | **String** |  |  [optional] |
|**apiKey** | **String** | Only returned on registration |  [optional] |
|**plan** | [**PlanEnum**](#PlanEnum) |  |  [optional] |
|**webhookLimit** | **Integer** |  |  [optional] |
|**webhookCount** | **Integer** |  |  [optional] |
|**isAdmin** | **Boolean** |  |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  [optional] |



## Enum: PlanEnum

| Name | Value |
|---- | -----|
| FREE | &quot;free&quot; |
| PRO | &quot;pro&quot; |
| BUSINESS | &quot;business&quot; |



