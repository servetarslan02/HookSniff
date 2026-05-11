# HooksniffSdk::OAuthProvider

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **name** | **String** | Provider identifier (e.g. google, github) |  |
| **client_id** | **String** |  |  |
| **authorize_url** | **String** |  |  |
| **token_url** | **String** |  |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::OAuthProvider.new(
  id: null,
  name: null,
  client_id: null,
  authorize_url: null,
  token_url: null
)
```

