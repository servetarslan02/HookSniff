# HooksniffSdk::Enable2faResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **secret** | **String** | TOTP secret key |  |
| **qr_url** | **String** | QR code provisioning URL |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::Enable2faResponse.new(
  secret: null,
  qr_url: null
)
```

