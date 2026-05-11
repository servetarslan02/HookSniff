# hooksniff.Api.HealthApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**EndpointHealthGet**](HealthApi.md#endpointhealthget) | **GET** /endpoint-health | List endpoint health statuses |
| [**EndpointHealthIdGet**](HealthApi.md#endpointhealthidget) | **GET** /endpoint-health/{id} | Get specific endpoint health |
| [**StatusGet**](HealthApi.md#statusget) | **GET** /status | System status (public) |

<a id="endpointhealthget"></a>
# **EndpointHealthGet**
> List&lt;EndpointHealth&gt; EndpointHealthGet ()

List endpoint health statuses


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;EndpointHealth&gt;**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Health list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointhealthidget"></a>
# **EndpointHealthIdGet**
> EndpointHealth EndpointHealthIdGet (Guid id)

Get specific endpoint health


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**EndpointHealth**](EndpointHealth.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Health status |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="statusget"></a>
# **StatusGet**
> SystemStatus StatusGet ()

System status (public)


### Parameters
This endpoint does not need any parameter.
### Return type

[**SystemStatus**](SystemStatus.md)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | System operational |  -  |
| **503** | System degraded or down |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

