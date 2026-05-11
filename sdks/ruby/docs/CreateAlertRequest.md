# HookSniff::CreateAlertRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** |  |  |
| **condition** | **String** |  |  |
| **threshold** | **Integer** |  |  |
| **channels** | **Array&lt;String&gt;** |  |  |
| **endpoint_id** | **String** |  | [optional] |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::CreateAlertRequest.new(
  name: null,
  condition: null,
  threshold: null,
  channels: null,
  endpoint_id: null
)
```

