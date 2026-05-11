# HooksniffSdk::CreateSSOConfigRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** |  |  |
| **domain** | **String** |  |  |
| **metadata_url** | **String** | URL to SAML metadata or OIDC discovery document |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::CreateSSOConfigRequest.new(
  provider: null,
  domain: null,
  metadata_url: null
)
```

