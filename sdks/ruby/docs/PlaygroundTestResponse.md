# OpenapiClient::PlaygroundTestResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **status_code** | **Integer** | HTTP status code returned by the endpoint |  |
| **response_body** | **String** | Raw response body from the endpoint |  |
| **latency_ms** | **Integer** |  |  |
| **headers** | **Object** | Response headers from the endpoint | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::PlaygroundTestResponse.new(
  status_code: null,
  response_body: null,
  latency_ms: null,
  headers: null
)
```

