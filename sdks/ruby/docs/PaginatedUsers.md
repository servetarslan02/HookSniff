# OpenapiClient::PaginatedUsers

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **users** | [**Array&lt;UserSummary&gt;**](UserSummary.md) |  | [optional] |
| **total** | **Integer** |  | [optional] |
| **page** | **Integer** |  | [optional] |
| **per_page** | **Integer** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::PaginatedUsers.new(
  users: null,
  total: null,
  page: null,
  per_page: null
)
```

