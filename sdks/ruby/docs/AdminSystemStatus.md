# OpenapiClient::AdminSystemStatus

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **version** | **String** |  |  |
| **uptime_seconds** | **Integer** |  |  |
| **db_status** | **String** |  |  |
| **redis_status** | **String** |  |  |
| **queue_depth** | **Integer** | Number of pending jobs in the delivery queue |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminSystemStatus.new(
  version: null,
  uptime_seconds: null,
  db_status: null,
  redis_status: null,
  queue_depth: null
)
```

