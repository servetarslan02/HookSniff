# OpenapiClient::BatchResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **deliveries** | [**Array&lt;Delivery&gt;**](Delivery.md) |  | [optional] |
| **errors** | [**Array&lt;BatchResponseErrorsInner&gt;**](BatchResponseErrorsInner.md) |  | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::BatchResponse.new(
  deliveries: null,
  errors: null
)
```

