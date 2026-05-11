# Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | Option<**uuid::Uuid**> |  | [optional]
**url** | Option<**String**> |  | [optional]
**description** | Option<**String**> |  | [optional]
**is_active** | Option<**bool**> |  | [optional]
**retry_policy** | Option<[**models::RetryPolicy**](RetryPolicy.md)> |  | [optional]
**created_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]
**allowed_ips** | Option<**Vec<String>**> | CIDR blocks or exact IPs | [optional]
**event_filter** | Option<**Vec<String>**> | Wildcard patterns (e.g. \"order.*\") | [optional]
**custom_headers** | Option<**serde_json::Value**> |  | [optional]
**routing_strategy** | Option<**RoutingStrategy**> |  (enum: round-robin, latency, failover) | [optional]
**fallback_url** | Option<**String**> |  | [optional]
**avg_response_ms** | Option<**i32**> |  | [optional]
**failure_streak** | Option<**i32**> |  | [optional]
**format** | Option<**Format**> |  (enum: standard, cloudevents) | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


