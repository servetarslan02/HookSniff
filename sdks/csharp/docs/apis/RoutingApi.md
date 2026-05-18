# hooksniff.Api.RoutingApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**EndpointsIdHealthGet**](RoutingApi.md#endpointsidhealthget) | **GET** /endpoints/{id}/health | Get endpoint health status |
| [**EndpointsIdRoutingGet**](RoutingApi.md#endpointsidroutingget) | **GET** /endpoints/{id}/routing | Get routing config for endpoint |
| [**EndpointsIdRoutingPut**](RoutingApi.md#endpointsidroutingput) | **PUT** /endpoints/{id}/routing | Update routing config |

<a id="endpointsidhealthget"></a>
# **EndpointsIdHealthGet**
> EndpointHealth EndpointsIdHealthGet (Guid id)

Get endpoint health status


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

<a id="endpointsidroutingget"></a>
# **EndpointsIdRoutingGet**
> RoutingInfo EndpointsIdRoutingGet (Guid id)

Get routing config for endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Routing info |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsidroutingput"></a>
# **EndpointsIdRoutingPut**
> RoutingInfo EndpointsIdRoutingPut (Guid id, UpdateRoutingRequest updateRoutingRequest)

Update routing config


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **updateRoutingRequest** | [**UpdateRoutingRequest**](UpdateRoutingRequest.md) |  |  |

### Return type

[**RoutingInfo**](RoutingInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Routing updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

