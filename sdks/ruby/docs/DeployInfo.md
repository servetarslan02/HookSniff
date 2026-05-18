# OpenapiClient::DeployInfo

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **version** | **String** | Semantic version from Cargo.toml | [optional] |
| **git_commit** | **String** | Git SHA of the deployed commit | [optional] |
| **build_time** | **String** | ISO 8601 build timestamp | [optional] |
| **environment** | **String** | Deployment environment (production, staging, etc.) | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::DeployInfo.new(
  version: null,
  git_commit: null,
  build_time: null,
  environment: null
)
```

