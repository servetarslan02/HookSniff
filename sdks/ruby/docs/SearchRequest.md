# HooksniffSdk::SearchRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **query** | **String** | Search query string |  |
| **filters** | [**SearchRequestFilters**](SearchRequestFilters.md) |  | [optional] |
| **page** | **Integer** |  | [optional][default to 1] |
| **per_page** | **Integer** |  | [optional][default to 20] |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::SearchRequest.new(
  query: null,
  filters: null,
  page: null,
  per_page: null
)
```

