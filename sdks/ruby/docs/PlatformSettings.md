# OpenapiClient::PlatformSettings

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **default_plan** | **String** |  |  |
| **max_endpoints_free** | **Integer** |  |  |
| **max_endpoints_pro** | **Integer** |  |  |
| **max_webhooks_free** | **Integer** |  |  |
| **max_webhooks_pro** | **Integer** |  |  |
| **rate_limit_free** | **Integer** |  |  |
| **rate_limit_pro** | **Integer** |  |  |
| **retry_max_attempts** | **Integer** |  |  |
| **retention_days_free** | **Integer** |  |  |
| **retention_days_pro** | **Integer** |  |  |
| **maintenance_mode** | **Boolean** |  |  |
| **signup_enabled** | **Boolean** |  |  |
| **plan_price_pro** | **Float** |  |  |
| **plan_price_business** | **Float** |  |  |
| **resend_api_key** | **String** |  | [optional] |
| **email_sender** | **String** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::PlatformSettings.new(
  default_plan: null,
  max_endpoints_free: null,
  max_endpoints_pro: null,
  max_webhooks_free: null,
  max_webhooks_pro: null,
  rate_limit_free: null,
  rate_limit_pro: null,
  retry_max_attempts: null,
  retention_days_free: null,
  retention_days_pro: null,
  maintenance_mode: null,
  signup_enabled: null,
  plan_price_pro: null,
  plan_price_business: null,
  resend_api_key: null,
  email_sender: null
)
```

