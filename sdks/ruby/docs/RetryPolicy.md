# HooksniffSdk::RetryPolicy

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **max_attempts** | **Integer** |  | [default to 3] |
| **backoff** | **String** |  | [default to &#39;exponential&#39;] |
| **initial_delay_secs** | **Integer** |  | [default to 10] |
| **max_delay_secs** | **Integer** |  | [default to 3600] |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::RetryPolicy.new(
  max_attempts: null,
  backoff: null,
  initial_delay_secs: null,
  max_delay_secs: null
)
```

