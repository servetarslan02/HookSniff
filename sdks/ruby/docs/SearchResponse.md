# OpenapiClient::SearchResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **deliveries** | [**Array&lt;Delivery&gt;**](Delivery.md) |  |  |
| **total** | **Integer** |  |  |
| **page** | **Integer** |  |  |
| **per_page** | **Integer** |  |  |
| **has_more** | **Boolean** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SearchResponse.new(
  deliveries: null,
  total: null,
  page: null,
  per_page: null,
  has_more: null
)
```

