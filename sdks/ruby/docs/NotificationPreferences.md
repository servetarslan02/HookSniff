# HookSniff::NotificationPreferences

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **email_on_failure** | **Boolean** |  | [default to true] |
| **email_on_dead_letter** | **Boolean** |  | [default to true] |
| **email_on_success** | **Boolean** |  | [default to false] |
| **slack_webhook_url** | **String** |  | [optional] |
| **discord_webhook_url** | **String** |  | [optional] |
| **webhook_url** | **String** |  | [optional] |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::NotificationPreferences.new(
  email_on_failure: null,
  email_on_dead_letter: null,
  email_on_success: null,
  slack_webhook_url: null,
  discord_webhook_url: null,
  webhook_url: null
)
```

