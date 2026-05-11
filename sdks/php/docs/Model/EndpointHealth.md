# EndpointHealth

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**endpoint_id** | **string** |  |
**is_healthy** | **bool** |  |
**failure_streak** | **int** |  | [optional]
**avg_response_ms** | **int** |  | [optional]
**last_failure_at** | **\DateTime** |  | [optional]
**success_rate** | **float** | Success rate as a fraction (0.0–1.0) | [optional]
**avg_latency_ms** | **float** | Average delivery latency in milliseconds | [optional]
**last_delivery_at** | **\DateTime** |  | [optional]
**total_deliveries** | **int** |  | [optional]
**failed_deliveries** | **int** |  | [optional]

[[Back to Model list]](../../README.md#models) [[Back to API list]](../../README.md#endpoints) [[Back to README]](../../README.md)
