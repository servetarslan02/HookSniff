# OpenapiClient::AdminUsersIdGet200Response

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **user** | [**UserSummary**](UserSummary.md) |  | [optional] |
| **endpoints** | [**Array&lt;AdminUsersIdGet200ResponseEndpointsInner&gt;**](AdminUsersIdGet200ResponseEndpointsInner.md) |  | [optional] |
| **recent_deliveries** | [**Array&lt;AdminUsersIdGet200ResponseRecentDeliveriesInner&gt;**](AdminUsersIdGet200ResponseRecentDeliveriesInner.md) |  | [optional] |
| **usage_stats** | [**AdminUsersIdGet200ResponseUsageStats**](AdminUsersIdGet200ResponseUsageStats.md) |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::AdminUsersIdGet200Response.new(
  user: null,
  endpoints: null,
  recent_deliveries: null,
  usage_stats: null
)
```

