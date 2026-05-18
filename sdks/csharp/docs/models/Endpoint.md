# hooksniff.Model.Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **Guid** |  | 
**Url** | **string** |  | 
**IsActive** | **bool** |  | 
**RetryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | 
**CreatedAt** | **DateTime** |  | 
**RoutingStrategy** | **string** |  | 
**AvgResponseMs** | **int** |  | 
**FailureStreak** | **int** |  | 
**Format** | **string** |  | 
**Description** | **string** |  | [optional] 
**AllowedIps** | **List&lt;string&gt;** | CIDR blocks or exact IPs | [optional] 
**EventFilter** | **List&lt;string&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] 
**CustomHeaders** | **Object** |  | [optional] 
**FallbackUrl** | **string** |  | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

