# OpenapiClient::SearchRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **query** | **String** | Search query string |  |
| **filters** | [**SearchRequestFilters**](SearchRequestFilters.md) |  | [optional] |
| **page** | **Integer** |  | [optional][default to 1] |
| **per_page** | **Integer** |  | [optional][default to 20] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::SearchRequest.new(
  query: null,
  filters: null,
  page: null,
  per_page: null
)
```

