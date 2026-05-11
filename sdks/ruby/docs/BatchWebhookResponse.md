# HookSniff::BatchWebhookResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **delivery_ids** | **Array&lt;String&gt;** | List of created delivery IDs |  |
| **count** | **Integer** | Number of deliveries created |  |

## Example

```ruby
require 'hooksniff'

instance = HookSniff::BatchWebhookResponse.new(
  delivery_ids: null,
  count: null
)
```

