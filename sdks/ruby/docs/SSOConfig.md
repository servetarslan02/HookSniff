# OpenapiClient::SSOConfig

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **provider** | **String** |  |  |
| **domain** | **String** | Email domain for SSO routing |  |
| **entity_id** | **String** | SAML entity ID or OIDC issuer | [optional] |
| **sso_url** | **String** |  | [optional] |
| **certificate** | **String** | PEM-encoded X.509 certificate (SAML) | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SSOConfig.new(
  provider: null,
  domain: null,
  entity_id: null,
  sso_url: null,
  certificate: null
)
```

