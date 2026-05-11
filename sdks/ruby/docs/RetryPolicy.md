# OpenapiClient::RetryPolicy

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **max_attempts** | **Integer** |  | [optional][default to 3] |
| **backoff** | **String** |  | [optional][default to &#39;exponential&#39;] |
| **initial_delay_secs** | **Integer** |  | [optional][default to 10] |
| **max_delay_secs** | **Integer** |  | [optional][default to 3600] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::RetryPolicy.new(
  max_attempts: null,
  backoff: null,
  initial_delay_secs: null,
  max_delay_secs: null
)
```

