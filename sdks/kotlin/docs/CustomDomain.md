
# CustomDomain

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **id** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **domain** | **kotlin.String** | The custom domain (e.g. webhooks.example.com) |  |
| **status** | [**inline**](#Status) |  |  |
| **createdAt** | [**java.time.OffsetDateTime**](java.time.OffsetDateTime.md) |  |  |
| **verificationToken** | **kotlin.String** | TXT record value to prove domain ownership |  [optional] |


<a id="Status"></a>
## Enum: status
| Name | Value |
| ---- | ----- |
| status | pending, verifying, verified, failed |



