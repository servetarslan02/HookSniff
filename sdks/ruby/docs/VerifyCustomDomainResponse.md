# HooksniffSdk::VerifyCustomDomainResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **status** | **String** |  |  |
| **dns_records** | [**Array&lt;DomainDnsRecord&gt;**](DomainDnsRecord.md) | DNS records that need to be configured |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::VerifyCustomDomainResponse.new(
  status: null,
  dns_records: null
)
```

