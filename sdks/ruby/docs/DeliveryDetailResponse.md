# OpenapiClient::DeliveryDetailResponse

## Properties

| Name | Type | Description | Notes |
| ---- | ---- | ----------- | ----- |
| **delivery** | [**Delivery**](Delivery.md) |  |  |
| **attempts** | [**Array&lt;DeliveryAttempt&gt;**](DeliveryAttempt.md) |  |  |
| **endpoint** | [**Endpoint**](Endpoint.md) |  | [optional] |
| **request_headers** | **Object** | Original request headers sent with the delivery | [optional] |
| **request_body** | **Object** | Original request body sent with the delivery | [optional] |
| **response_headers** | **Object** | Response headers received from the endpoint | [optional] |

## Example

```ruby
require 'openapi_client'

instance = OpenapiClient::DeliveryDetailResponse.new(
  delivery: null,
  attempts: null,
  endpoint: null,
  request_headers: null,
  request_body: null,
  response_headers: null
)
```

