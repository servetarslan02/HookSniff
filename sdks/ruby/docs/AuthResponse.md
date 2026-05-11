# HookSniff::AuthResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **token** | **String** | JWT access token |  |
| **customer** | [**CustomerResponse**](CustomerResponse.md) |  |  |
| **refresh_token** | **String** | Refresh token (when applicable) | [optional] |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::AuthResponse.new(
  token: null,
  customer: null,
  refresh_token: null
)
```

