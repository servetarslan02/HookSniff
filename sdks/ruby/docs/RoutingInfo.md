# OpenapiClient::RoutingInfo

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  | [optional] |
| **routing_strategy** | **String** |  | [optional] |
| **fallback_url** | **String** |  | [optional] |
| **avg_response_ms** | **Integer** |  | [optional] |
| **failure_streak** | **Integer** |  | [optional] |
| **is_healthy** | **Boolean** |  | [optional] |

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

