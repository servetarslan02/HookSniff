# OpenapiClient::CreateEndpointRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **url** | **String** |  |  |
| **description** | **String** |  | [optional] |
| **allowed_ips** | **Array&lt;String&gt;** |  | [optional] |
| **event_filter** | **Array&lt;String&gt;** |  | [optional] |
| **custom_headers** | **Object** |  | [optional] |
| **retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  | [optional] |
| **routing_strategy** | **String** |  | [optional] |
| **fallback_url** | **String** |  | [optional] |
| **format** | **String** |  | [optional][default to &#39;standard&#39;] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::CreateEndpointRequest.new(
  url: null,
  description: null,
  allowed_ips: null,
  event_filter: null,
  custom_headers: null,
  retry_policy: null,
  routing_strategy: null,
  fallback_url: null,
  format: null
)
```

