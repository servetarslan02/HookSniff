# hooksniff.Model.Endpoint

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**Id** | **Guid** |  | [optional] 
**Url** | **string** |  | [optional] 
**Description** | **string** |  | [optional] 
**IsActive** | **bool** |  | [optional] 
**RetryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | [optional] 
**CreatedAt** | **DateTime** |  | [optional] 
**AllowedIps** | **List&lt;string&gt;** | CIDR blocks or exact IPs | [optional] 
**EventFilter** | **List&lt;string&gt;** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] 
**CustomHeaders** | **Object** |  | [optional] 
**RoutingStrategy** | **string** |  | [optional] 
**FallbackUrl** | **string** |  | [optional] 
**AvgResponseMs** | **int** |  | [optional] 
**FailureStreak** | **int** |  | [optional] 
**Format** | **string** |  | [optional] 

[[Back to Model list]](../../README.md#documentation-for-models) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to README]](../../README.md)

