# UpdateEndpointRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**url** | **String** |  | 
**description** | **String** |  | 
**is_active** | **bool** |  | 
**allowed_ips** | **Vec<String>** |  | 
**event_filter** | **Vec<String>** |  | 
**custom_headers** | Option<**serde_json::Value**> |  | [optional]
**retry_policy** | [**models::RetryPolicy**](RetryPolicy.md) |  | 
**routing_strategy** | **RoutingStrategy** |  (enum: round-robin, latency, failover) | 
**fallback_url** | **String** |  | 
**format** | **Format** |  (enum: standard, cloudevents) | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


