# HooksniffSdk::OAuthCallbackRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **code** | **String** | Authorization code from the provider |  |
| **state** | **String** | CSRF state token |  |
| **redirect_uri** | **String** |  | [optional] |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::OAuthCallbackRequest.new(
  code: null,
  state: null,
  redirect_uri: null
)
```

