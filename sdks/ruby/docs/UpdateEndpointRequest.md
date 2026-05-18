# OpenapiClient::UpdateEndpointRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **url** | **String** |  |  |
| **description** | **String** |  |  |
| **is_active** | **Boolean** |  |  |
| **allowed_ips** | **Array&lt;String&gt;** |  |  |
| **event_filter** | **Array&lt;String&gt;** |  |  |
| **custom_headers** | **Object** |  | [optional] |
| **retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  |  |
| **routing_strategy** | **String** |  |  |
| **fallback_url** | **String** |  |  |
| **format** | **String** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::UpdateEndpointRequest.new(
  url: null,
  description: null,
  is_active: null,
  allowed_ips: null,
  event_filter: null,
  custom_headers: null,
  retry_policy: null,
  routing_strategy: null,
  fallback_url: null,
  format: null
)
```

