
# SSOConfig

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **provider** | [**inline**](#Provider) |  |  |
| **domain** | **kotlin.String** | Email domain for SSO routing |  |
| **entityId** | **kotlin.String** | SAML entity ID or OIDC issuer |  [optional] |
| **ssoUrl** | [**java.net.URI**](java.net.URI.md) |  |  [optional] |
| **certificate** | **kotlin.String** | PEM-encoded X.509 certificate (SAML) |  [optional] |


<a id="Provider"></a>
## Enum: provider
| Name | Value |
| ---- | ----- |
| provider | saml, oidc |



