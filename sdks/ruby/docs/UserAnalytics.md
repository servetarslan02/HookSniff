# OpenapiClient::UserAnalytics

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **daily_deliveries** | [**Array&lt;DailyDeliveryCount&gt;**](DailyDeliveryCount.md) |  |  |
| **top_events** | [**Array&lt;EventTypeCount&gt;**](EventTypeCount.md) |  |  |
| **endpoint_health** | [**Array&lt;EndpointHealth&gt;**](EndpointHealth.md) |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::UserAnalytics.new(
  daily_deliveries: null,
  top_events: null,
  endpoint_health: null
)
```

