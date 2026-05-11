# HookSniff::PaginatedUsers

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **users** | [**Array&lt;UserSummary&gt;**](UserSummary.md) |  |  |
| **total** | **Integer** |  |  |
| **page** | **Integer** |  |  |
| **per_page** | **Integer** |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::PaginatedUsers.new(
  users: null,
  total: null,
  page: null,
  per_page: null
)
```

