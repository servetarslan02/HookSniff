# OpenapiClient::RoutingInfo

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **routing_strategy** | **String** |  |  |
| **fallback_url** | **String** |  | [optional] |
| **avg_response_ms** | **Integer** |  |  |
| **failure_streak** | **Integer** |  |  |
| **is_healthy** | **Boolean** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::RoutingInfo.new(
  endpoint_id: null,
  routing_strategy: null,
  fallback_url: null,
  avg_response_ms: null,
  failure_streak: null,
  is_healthy: null
)
```

