# UpdateEndpointRequest

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**url** | Option<**String**> |  | [optional]
**description** | Option<**String**> |  | [optional]
**is_active** | Option<**bool**> |  | [optional]
**allowed_ips** | Option<**Vec<String>**> |  | [optional]
**event_filter** | Option<**Vec<String>**> |  | [optional]
**custom_headers** | Option<**serde_json::Value**> |  | [optional]
**retry_policy** | Option<[**models::RetryPolicy**](RetryPolicy.md)> |  | [optional]
**routing_strategy** | Option<**RoutingStrategy**> |  (enum: round-robin, latency, failover) | [optional]
**fallback_url** | Option<**String**> |  | [optional]
**format** | Option<**Format**> |  (enum: standard, cloudevents) | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


