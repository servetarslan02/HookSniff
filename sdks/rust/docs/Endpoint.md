# Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | 
**url** | **String** |  | 
**description** | Option<**String**> |  | [optional]
**is_active** | **bool** |  | 
**retry_policy** | [**models::RetryPolicy**](RetryPolicy.md) |  | 
**created_at** | **chrono::DateTime<chrono::FixedOffset>** |  | 
**allowed_ips** | Option<**Vec<String>**> | CIDR blocks or exact IPs | [optional]
**event_filter** | Option<**Vec<String>**> | Wildcard patterns (e.g. \"order.*\") | [optional]
**custom_headers** | Option<**serde_json::Value**> |  | [optional]
**routing_strategy** | **RoutingStrategy** |  (enum: round-robin, latency, failover) | 
**fallback_url** | Option<**String**> |  | [optional]
**avg_response_ms** | **i32** |  | 
**failure_streak** | **i32** |  | 
**format** | **Format** |  (enum: standard, cloudevents) | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


