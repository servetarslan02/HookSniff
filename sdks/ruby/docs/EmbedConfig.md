# OpenapiClient::EmbedConfig

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **allowed_origins** | **Array&lt;String&gt;** | CORS origins allowed to load the embed |  |
| **theme** | [**EmbedConfigTheme**](EmbedConfigTheme.md) |  | [optional] |
| **features** | **Array&lt;String&gt;** | Enabled features (e.g. [deliveries, endpoints, playground]) | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::EmbedConfig.new(
  allowed_origins: null,
  theme: null,
  features: null
)
```

