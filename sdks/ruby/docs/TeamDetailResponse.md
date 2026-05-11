# HooksniffSdk::TeamDetailResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **team** | [**Team**](Team.md) |  |  |
| **members** | [**Array&lt;TeamMember&gt;**](TeamMember.md) |  |  |
| **invites** | [**Array&lt;TeamInvite&gt;**](TeamInvite.md) |  |  |

## Example

```ruby
require 'hooksniff-sdk'

instance = HooksniffSdk::TeamDetailResponse.new(
  team: null,
  members: null,
  invites: null
)
```

