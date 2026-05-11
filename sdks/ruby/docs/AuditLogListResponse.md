# HookSniff::AuditLogListResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **data** | [**Array&lt;AuditLogEntry&gt;**](AuditLogEntry.md) |  |  |
| **has_more** | **Boolean** |  |  |
| **total** | **Integer** |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::AuditLogListResponse.new(
  data: null,
  has_more: null,
  total: null
)
```

