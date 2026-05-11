# OpenapiClient::EndpointHealth

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  | [optional] |
| **is_healthy** | **Boolean** |  | [optional] |
| **failure_streak** | **Integer** |  | [optional] |
| **avg_response_ms** | **Integer** |  | [optional] |
| **last_failure_at** | **Time** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::EndpointHealth.new(
  endpoint_id: null,
  is_healthy: null,
  failure_streak: null,
  avg_response_ms: null,
  last_failure_at: null
)
```

