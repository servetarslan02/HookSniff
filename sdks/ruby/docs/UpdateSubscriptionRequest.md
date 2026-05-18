# OpenapiClient::UpdateSubscriptionRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **plan** | **String** | Target plan name |  |
| **proration** | **Boolean** | Whether to prorate charges for the current billing period | [optional][default to true] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::UpdateSubscriptionRequest.new(
  plan: null,
  proration: null
)
```

