# OpenapiClient::WebhookFilter

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **status** | **String** | Filter by delivery status |  |
| **endpoint_id** | **String** |  |  |
| **event_type** | **String** | Filter by event type (e.g. order.created) |  |
| **from_date** | **Time** |  |  |
| **to_date** | **Time** |  |  |
| **page** | **Integer** |  | [default to 1] |
| **per_page** | **Integer** |  | [default to 20] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::WebhookFilter.new(
  status: null,
  endpoint_id: null,
  event_type: null,
  from_date: null,
  to_date: null,
  page: null,
  per_page: null
)
```

