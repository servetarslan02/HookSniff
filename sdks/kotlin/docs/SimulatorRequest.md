
# SimulatorRequest

## Properties
| Name | Type | Description | Notes |
| ------------ | ------------- | ------------- | ------------- |
| **endpointId** | [**java.util.UUID**](java.util.UUID.md) |  |  |
| **eventType** | **kotlin.String** | Event type to simulate (e.g. order.created) |  |
| **payload** | [**kotlin.Any**](.md) | The webhook payload to deliver |  |
| **delayMs** | **kotlin.Int** | Artificial delay before delivery (for testing timeouts) |  [optional] |



