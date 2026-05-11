# HookSniff::AlertRule

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **name** | **String** |  |  |
| **condition** | **String** |  |  |
| **threshold** | **Integer** |  |  |
| **channels** | **Array&lt;String&gt;** |  |  |
| **is_active** | **Boolean** |  |  |
| **created_at** | **Time** |  |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::AlertRule.new(
  id: null,
  name: null,
  condition: null,
  threshold: null,
  channels: null,
  is_active: null,
  created_at: null
)
```

