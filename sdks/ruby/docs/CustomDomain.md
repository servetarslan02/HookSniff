# HooksniffSdk::CustomDomain

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **domain** | **String** | The custom domain (e.g. webhooks.example.com) |  |
| **status** | **String** |  |  |
| **verification_token** | **String** | TXT record value to prove domain ownership | [optional] |
| **created_at** | **Time** |  |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::CustomDomain.new(
  id: null,
  domain: null,
  status: null,
  verification_token: null,
  created_at: null
)
```

