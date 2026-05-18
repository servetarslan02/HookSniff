# OpenapiClient::RoutingRuleListResponseDataInner

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **id** | **String** |  |  |
| **name** | **String** |  |  |
| **conditions** | **Object** |  |  |
| **transform** | **Object** |  | [optional] |
| **target_endpoint_id** | **String** |  |  |
| **enabled** | **Boolean** |  | [optional] |
| **created_at** | **Time** |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::RoutingRuleListResponseDataInner.new(
  id: null,
  name: null,
  conditions: null,
  transform: null,
  target_endpoint_id: null,
  enabled: null,
  created_at: null
)
```

