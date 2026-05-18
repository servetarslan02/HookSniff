# OpenapiClient::Delivery

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **endpoint_id** | **String** |  |  |
| **event** | **String** |  | [optional] |
| **status** | **String** |  |  |
| **attempt_count** | **Integer** |  |  |
| **response_status** | **Integer** |  | [optional] |
| **replay_count** | **Integer** |  |  |
| **created_at** | **Time** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::Delivery.new(
  id: null,
  endpoint_id: null,
  event: null,
  status: null,
  attempt_count: null,
  response_status: null,
  replay_count: null,
  created_at: null
)
```

