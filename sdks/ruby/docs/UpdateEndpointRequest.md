# OpenapiClient::UpdateEndpointRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **url** | **String** |  | [optional] |
| **description** | **String** |  | [optional] |
| **is_active** | **Boolean** |  | [optional] |
| **allowed_ips** | **Array&lt;String&gt;** |  | [optional] |
| **event_filter** | **Array&lt;String&gt;** |  | [optional] |
| **custom_headers** | **Object** |  | [optional] |
| **retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  | [optional] |
| **routing_strategy** | **String** |  | [optional] |
| **fallback_url** | **String** |  | [optional] |
| **format** | **String** |  | [optional] |

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

