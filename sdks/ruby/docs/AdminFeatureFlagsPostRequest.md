# OpenapiClient::AdminFeatureFlagsPostRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** |  |  |
| **description** | **String** |  | [optional] |
| **is_enabled** | **Boolean** |  | [optional][default to false] |
| **rollout_percentage** | **Integer** |  | [optional][default to 100] |
| **enabled_for_plans** | **Array&lt;String&gt;** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminFeatureFlagsPostRequest.new(
  name: null,
  description: null,
  is_enabled: null,
  rollout_percentage: null,
  enabled_for_plans: null
)
```

