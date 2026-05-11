# Endpoint

## Properties
Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **UUID** |  | [optional] 
**url** | **String** |  | [optional] 
**description** | **String** |  | [optional] 
**isActive** | **Bool** |  | [optional] 
**retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  | [optional] 
**createdAt** | **Date** |  | [optional] 
**allowedIps** | **[String]** | CIDR blocks or exact IPs | [optional] 
**eventFilter** | **[String]** | Wildcard patterns (e.g. \&quot;order.*\&quot;) | [optional] 
**customHeaders** | **AnyCodable** |  | [optional] 
**routingStrategy** | **String** |  | [optional] 
**fallbackUrl** | **String** |  | [optional] 
**avgResponseMs** | **Int** |  | [optional] 
**failureStreak** | **Int** |  | [optional] 
**format** | **String** |  | [optional] 

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


