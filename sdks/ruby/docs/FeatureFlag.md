# OpenapiClient::FeatureFlag

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  | [optional] |
| **name** | **String** |  | [optional] |
| **description** | **String** |  | [optional] |
| **is_enabled** | **Boolean** |  | [optional] |
| **rollout_percentage** | **Integer** |  | [optional] |
| **enabled_for_plans** | **Array&lt;String&gt;** |  | [optional] |
| **created_by** | **String** |  | [optional] |
| **created_at** | **Time** |  | [optional] |
| **updated_at** | **Time** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::FeatureFlag.new(
  id: null,
  name: null,
  description: null,
  is_enabled: null,
  rollout_percentage: null,
  enabled_for_plans: null,
  created_by: null,
  created_at: null,
  updated_at: null
)
```

