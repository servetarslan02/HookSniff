
# CustomerResponse

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **email** | **kotlin.String** |  |  |
| **plan** | [**inline**](#Plan) |  |  |
| **webhookLimit** | **kotlin.Int** |  |  |
| **webhookCount** | **kotlin.Int** |  |  |
| **isAdmin** | **kotlin.Boolean** |  |  |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **name** | **kotlin.String** |  |  [optional] |
| **apiKey** | **kotlin.String** | Only returned on registration |  [optional] |


<a id="Plan"></a>
## Enum: plan
| Name | Value |
| ---- | ----- |
| plan | free, pro, business |



