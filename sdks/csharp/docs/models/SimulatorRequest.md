# hooksniff.Model.SimulatorRequest
Send a simulated webhook event

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **Guid** |  | 
**EventType** | **string** | Event type to simulate (e.g. order.created) | 
**Payload** | **Object** | The webhook payload to deliver | 
**DelayMs** | **int** | Artificial delay before delivery (for testing timeouts) | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

