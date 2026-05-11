# HooksniffSdk::TwoFactorRequiredResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **requires_2fa** | **Boolean** |  |  |
| **temp_token** | **String** |  |  |
| **message** | **String** |  |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::TwoFactorRequiredResponse.new(
  requires_2fa: true,
  temp_token: null,
  message: null
)
```

