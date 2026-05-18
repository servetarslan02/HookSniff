# Endpoint

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | 
**url** | **String** |  | 
**description** | **String** |  | [optional] 
**isActive** | **Bool** |  | 
**retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | 
**createdAt** | **Date** |  | 
**allowedIps** | **[String]** | CIDR blocks or exact IPs | [optional] 
**eventFilter** | **[String]** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] 
**customHeaders** | **AnyCodable** |  | [optional] 
**routingStrategy** | **String** |  | 
**fallbackUrl** | **String** |  | [optional] 
**avgResponseMs** | **Int** |  | 
**failureStreak** | **Int** |  | 
**format** | **String** |  | 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


