# HookSniff::RegisterDeviceRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **token** | **String** | FCM device token |  |
| **platform** | **String** |  | [optional] |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::RegisterDeviceRequest.new(
  token: null,
  platform: null
)
```

