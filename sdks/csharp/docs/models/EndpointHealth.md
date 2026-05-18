# hooksniff.Model.EndpointHealth
Endpoint health metrics and status

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**EndpointId** | **Guid** |  | 
**IsHealthy** | **bool** |  | 
**FailureStreak** | **int** |  | [optional] 
**AvgResponseMs** | **int** |  | [optional] 
**LastFailureAt** | **DateTime** |  | [optional] 
**SuccessRate** | **double** | Success rate as a fraction (0.0–1.0) | [optional] 
**AvgLatencyMs** | **decimal** | Average delivery latency in milliseconds | [optional] 
**LastDeliveryAt** | **DateTime** |  | [optional] 
**TotalDeliveries** | **int** |  | [optional] 
**FailedDeliveries** | **int** |  | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

