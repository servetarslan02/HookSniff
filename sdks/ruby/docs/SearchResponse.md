# HooksniffSdk::SearchResponse

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
require 'hooksniff-sdk'

instance = HooksniffSdk::SearchResponse.new(
  deliveries: null,
  total: null,
  page: null,
  per_page: null,
  has_more: null
)
```

