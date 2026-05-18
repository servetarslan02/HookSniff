# OpenapiClient::UpdateNotificationPreferences

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **email_on_failure** | **Boolean** |  |  |
| **email_on_dead_letter** | **Boolean** |  |  |
| **email_on_success** | **Boolean** |  |  |
| **slack_webhook_url** | **String** |  | [optional] |
| **discord_webhook_url** | **String** |  | [optional] |
| **webhook_url** | **String** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::UpdateNotificationPreferences.new(
  email_on_failure: null,
  email_on_dead_letter: null,
  email_on_success: null,
  slack_webhook_url: null,
  discord_webhook_url: null,
  webhook_url: null
)
```

