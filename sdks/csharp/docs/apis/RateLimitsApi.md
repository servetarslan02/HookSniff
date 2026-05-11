# hooksniff.Api.RateLimitsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**RateLimitsEndpointIdDelete**](RateLimitsApi.md#ratelimitsendpointiddelete) | **DELETE** /rate-limits/{endpoint_id} | Delete rate limit for endpoint |
| [**RateLimitsEndpointIdGet**](RateLimitsApi.md#ratelimitsendpointidget) | **GET** /rate-limits/{endpoint_id} | Get rate limit for endpoint |
| [**RateLimitsEndpointIdPost**](RateLimitsApi.md#ratelimitsendpointidpost) | **POST** /rate-limits/{endpoint_id} | Set rate limit for endpoint |
| [**RateLimitsGet**](RateLimitsApi.md#ratelimitsget) | **GET** /rate-limits | List rate limits |

<a id="ratelimitsendpointiddelete"></a>
# **RateLimitsEndpointIdDelete**
> void RateLimitsEndpointIdDelete (string endpointId)

Delete rate limit for endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **string** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="ratelimitsendpointidget"></a>
# **RateLimitsEndpointIdGet**
> void RateLimitsEndpointIdGet (string endpointId)

Get rate limit for endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **string** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit config |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="ratelimitsendpointidpost"></a>
# **RateLimitsEndpointIdPost**
> void RateLimitsEndpointIdPost (string endpointId)

Set rate limit for endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **endpointId** | **string** |  |  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit set |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="ratelimitsget"></a>
# **RateLimitsGet**
> void RateLimitsGet ()

List rate limits


### Parameters
This endpoint does not need any parameter.
### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Rate limit list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

