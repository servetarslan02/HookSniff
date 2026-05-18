# OpenapiClient::Endpoint

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **url** | **String** |  |  |
| **description** | **String** |  | [optional] |
| **is_active** | **Boolean** |  |  |
| **retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  |  |
| **created_at** | **Time** |  |  |
| **allowed_ips** | **Array&lt;String&gt;** | CIDR blocks or exact IPs | [optional] |
| **event_filter** | **Array&lt;String&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] |
| **custom_headers** | **Object** |  | [optional] |
| **routing_strategy** | **String** |  |  |
| **fallback_url** | **String** |  | [optional] |
| **avg_response_ms** | **Integer** |  |  |
| **failure_streak** | **Integer** |  |  |
| **format** | **String** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::Endpoint.new(
  id: null,
  url: null,
  description: null,
  is_active: null,
  retry_policy: null,
  created_at: null,
  allowed_ips: null,
  event_filter: null,
  custom_headers: null,
  routing_strategy: null,
  fallback_url: null,
  avg_response_ms: null,
  failure_streak: null,
  format: null
)
```

