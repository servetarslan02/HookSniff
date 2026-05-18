

# VerifyCustomDomainResponse

Result of domain verification attempt

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**status** | [**StatusEnum**](#StatusEnum) |  |  |
|**dnsRecords** | [**List&lt;DomainDnsRecord&gt;**](DomainDnsRecord.md) | DNS records that need to be configured |  |



## Enum: StatusEnum

| Name | Value |
|---- | -----|
| VERIFIED | &quot;verified&quot; |
| PENDING | &quot;pending&quot; |
| FAILED | &quot;failed&quot; |



