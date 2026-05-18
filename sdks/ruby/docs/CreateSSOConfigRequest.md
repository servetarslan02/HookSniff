# OpenapiClient::CreateSSOConfigRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** |  |  |
| **domain** | **String** |  |  |
| **metadata_url** | **String** | URL to SAML metadata or OIDC discovery document |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::CreateSSOConfigRequest.new(
  provider: null,
  domain: null,
  metadata_url: null
)
```

