# OpenapiClient::TeamDetailResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **team** | [**Team**](Team.md) |  | [optional] |
| **members** | [**Array&lt;TeamMember&gt;**](TeamMember.md) |  | [optional] |
| **invites** | [**Array&lt;TeamInvite&gt;**](TeamInvite.md) |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::TeamDetailResponse.new(
  team: null,
  members: null,
  invites: null
)
```

