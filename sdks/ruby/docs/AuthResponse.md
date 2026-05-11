# OpenapiClient::AuthResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **token** | **String** | JWT access token | [optional] |
| **customer** | [**CustomerResponse**](CustomerResponse.md) |  | [optional] |
| **refresh_token** | **String** | Refresh token (when applicable) | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AuthResponse.new(
  token: null,
  customer: null,
  refresh_token: null
)
```

