

# SSOConfig

Single Sign-On configuration (SAML or OIDC)

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**provider** | [**ProviderEnum**](#ProviderEnum) |  |  |
|**domain** | **String** | Email domain for SSO routing |  |
|**entityId** | **String** | SAML entity ID or OIDC issuer |  [optional] |
|**ssoUrl** | **URI** |  |  [optional] |
|**certificate** | **String** | PEM-encoded X.509 certificate (SAML) |  [optional] |



## Enum: ProviderEnum

| Name | Value |
|---- | -----|
| SAML | &quot;saml&quot; |
| OIDC | &quot;oidc&quot; |



