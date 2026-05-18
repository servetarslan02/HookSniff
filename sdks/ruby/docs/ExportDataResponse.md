# OpenapiClient::ExportDataResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **user** | [**CustomerResponse**](CustomerResponse.md) |  | [optional] |
| **endpoints** | [**Array&lt;Endpoint&gt;**](Endpoint.md) |  | [optional] |
| **deliveries** | [**Array&lt;Delivery&gt;**](Delivery.md) |  | [optional] |
| **teams** | [**Array&lt;Team&gt;**](Team.md) |  | [optional] |
| **exported_at** | **Time** |  |  |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::ExportDataResponse.new(
  user: null,
  endpoints: null,
  deliveries: null,
  teams: null,
  exported_at: null
)
```

