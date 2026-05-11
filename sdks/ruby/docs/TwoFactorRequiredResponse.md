# OpenapiClient::TwoFactorRequiredResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **requires_2fa** | **Boolean** |  | [optional] |
| **temp_token** | **String** |  | [optional] |
| **message** | **String** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::TwoFactorRequiredResponse.new(
  requires_2fa: true,
  temp_token: null,
  message: null
)
```

