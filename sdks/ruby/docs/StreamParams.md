# HookSniff::StreamParams

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **endpoint_id** | **String** |  |  |
| **status** | **String** |  |  |
| **limit** | **Integer** |  | [default to 50] |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::StreamParams.new(
  endpoint_id: null,
  status: null,
  limit: null
)
```

