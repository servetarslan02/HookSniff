# OpenapiClient::VerifyCustomDomainResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **status** | **String** |  |  |
| **dns_records** | [**Array&lt;DomainDnsRecord&gt;**](DomainDnsRecord.md) | DNS records that need to be configured |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::VerifyCustomDomainResponse.new(
  status: null,
  dns_records: null
)
```

