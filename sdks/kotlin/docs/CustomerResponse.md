
# CustomerResponse

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  [optional] |
| **email** | **kotlin.String** |  |  [optional] |
| **name** | **kotlin.String** |  |  [optional] |
| **apiKey** | **kotlin.String** | Only returned on registration |  [optional] |
| **plan** | [**inline**](#Plan) |  |  [optional] |
| **webhookLimit** | **kotlin.Int** |  |  [optional] |
| **webhookCount** | **kotlin.Int** |  |  [optional] |
| **isAdmin** | **kotlin.Boolean** |  |  [optional] |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  [optional] |


<a id="Plan"></a>
## Enum: plan
| Name | Value |
| ---- | ----- |
| plan | free, pro, business |



