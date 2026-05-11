

# DomainDnsRecord

A DNS record required for domain verification

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**type** | [**TypeEnum**](#TypeEnum) |  |  |
|**name** | **String** | DNS record name/host |  |
|**value** | **String** | DNS record value |  |
|**status** | [**StatusEnum**](#StatusEnum) |  |  |



## Enum: TypeEnum

| Name | Value |
|---- | -----|
| TXT | &quot;TXT&quot; |
| CNAME | &quot;CNAME&quot; |
| A | &quot;A&quot; |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| PENDING | &quot;pending&quot; |
| VERIFIED | &quot;verified&quot; |
| FAILED | &quot;failed&quot; |



