

# SimulatorRequest

Send a simulated webhook event

## Properties

| Name | Type | Description | Notes |
|------------ | ------------- | ------------- | -------------|
|**endpointId** | **UUID** |  |  |
|**eventType** | **String** | Event type to simulate (e.g. order.created) |  |
|**payload** | **Object** | The webhook payload to deliver |  |
|**delayMs** | **Integer** | Artificial delay before delivery (for testing timeouts) |  [optional] |



