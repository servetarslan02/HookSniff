

# CustomDomain

A custom domain configured for the account

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**id** | **UUID** |  |  |
|**domain** | **String** | The custom domain (e.g. webhooks.example.com) |  |
|**status** | [**StatusEnum**](#StatusEnum) |  |  |
|**verificationToken** | **String** | TXT record value to prove domain ownership |  [optional] |
|**createdAt** | **OffsetDateTime** |  |  |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| PENDING | &quot;pending&quot; |
| VERIFYING | &quot;verifying&quot; |
| VERIFIED | &quot;verified&quot; |
| FAILED | &quot;failed&quot; |



