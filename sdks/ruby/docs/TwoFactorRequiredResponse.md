# OpenapiClient::TwoFactorRequiredResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **requires_2fa** | **Boolean** |  |  |
| **temp_token** | **String** |  |  |
| **message** | **String** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::TwoFactorRequiredResponse.new(
  requires_2fa: true,
  temp_token: null,
  message: null
)
```

