# EndpointHealth

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **uuid::Uuid** |  | 
**is_healthy** | **bool** |  | 
**failure_streak** | Option<**i32**> |  | [optional]
**avg_response_ms** | Option<**i32**> |  | [optional]
**last_failure_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]
**success_rate** | Option<**f64**> | Success rate as a fraction (0.0–1.0) | [optional]
**avg_latency_ms** | Option<**f64**> | Average delivery latency in milliseconds | [optional]
**last_delivery_at** | Option<**chrono::DateTime<chrono::FixedOffset>**> |  | [optional]
**total_deliveries** | Option<**i32**> |  | [optional]
**failed_deliveries** | Option<**i32**> |  | [optional]

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


