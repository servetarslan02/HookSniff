

# CreateSSOConfigRequest

Create a new SSO configuration

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**provider** | [**ProviderEnum**](#ProviderEnum) |  |  |
|**domain** | **String** |  |  |
|**metadataUrl** | **URI** | URL to SAML metadata or OIDC discovery document |  |



## Enum: ProviderEnum

| Name | Value |
|---- | -----|
| SAML | &quot;saml&quot; |
| OIDC | &quot;oidc&quot; |



