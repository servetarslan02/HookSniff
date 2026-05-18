# OpenapiClient::DeliveryAttempt

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **attempt_number** | **Integer** |  |  |
| **status_code** | **Integer** |  | [optional] |
| **response_body** | **String** |  | [optional] |
| **duration_ms** | **Integer** |  | [optional] |
| **error_message** | **String** |  | [optional] |
| **created_at** | **Time** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::DeliveryAttempt.new(
  id: null,
  attempt_number: null,
  status_code: null,
  response_body: null,
  duration_ms: null,
  error_message: null,
  created_at: null
)
```

