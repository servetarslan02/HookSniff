# SimulatorRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | 
**event_type** | **String** | Event type to simulate (e.g. order.created) | 
**payload** | **serde_json::Value** | The webhook payload to deliver | 
**delay_ms** | Option<**i32**> | Artificial delay before delivery (for testing timeouts) | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


