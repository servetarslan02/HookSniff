# OpenapiClient::AdminFeatureFlagsIdPutRequest

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **name** | **String** |  | [optional] |
| **description** | **String** |  | [optional] |
| **is_enabled** | **Boolean** |  | [optional] |
| **rollout_percentage** | **Integer** |  | [optional] |
| **enabled_for_plans** | **Array&lt;String&gt;** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminFeatureFlagsIdPutRequest.new(
  name: null,
  description: null,
  is_enabled: null,
  rollout_percentage: null,
  enabled_for_plans: null
)
```

