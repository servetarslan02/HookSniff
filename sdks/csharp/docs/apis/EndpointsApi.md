# hooksniff.Api.EndpointsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**EndpointsGet**](EndpointsApi.md#endpointsget) | **GET** /endpoints | List all endpoints |
| [**EndpointsIdDelete**](EndpointsApi.md#endpointsiddelete) | **DELETE** /endpoints/{id} | Delete endpoint |
| [**EndpointsIdGet**](EndpointsApi.md#endpointsidget) | **GET** /endpoints/{id} | Get endpoint by ID |
| [**EndpointsIdPut**](EndpointsApi.md#endpointsidput) | **PUT** /endpoints/{id} | Update endpoint |
| [**EndpointsIdRetryPolicyPut**](EndpointsApi.md#endpointsidretrypolicyput) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint |
| [**EndpointsIdRotateSecretPost**](EndpointsApi.md#endpointsidrotatesecretpost) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret |
| [**EndpointsPost**](EndpointsApi.md#endpointspost) | **POST** /endpoints | Create a new endpoint |

<a id="endpointsget"></a>
# **EndpointsGet**
> List&lt;Endpoint&gt; EndpointsGet ()

List all endpoints


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;Endpoint&gt;**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Endpoint list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsiddelete"></a>
# **EndpointsIdDelete**
> void EndpointsIdDelete (Guid id)

Delete endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

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
| **200** | Endpoint deleted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsidget"></a>
# **EndpointsIdGet**
> Endpoint EndpointsIdGet (Guid id)

Get endpoint by ID


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Endpoint details |  -  |
| **404** | Not found |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsidput"></a>
# **EndpointsIdPut**
> Endpoint EndpointsIdPut (Guid id, UpdateEndpointRequest updateEndpointRequest)

Update endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **updateEndpointRequest** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md) |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Endpoint updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsidretrypolicyput"></a>
# **EndpointsIdRetryPolicyPut**
> Endpoint EndpointsIdRetryPolicyPut (Guid id, RetryPolicy retryPolicy)

Update retry policy for an endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **retryPolicy** | [**RetryPolicy**](RetryPolicy.md) |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Retry policy updated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointsidrotatesecretpost"></a>
# **EndpointsIdRotateSecretPost**
> EndpointsIdRotateSecretPost200Response EndpointsIdRotateSecretPost (Guid id)

Rotate endpoint signing secret


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**EndpointsIdRotateSecretPost200Response**](EndpointsIdRotateSecretPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Secret rotated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="endpointspost"></a>
# **EndpointsPost**
> Endpoint EndpointsPost (CreateEndpointRequest createEndpointRequest)

Create a new endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **createEndpointRequest** | [**CreateEndpointRequest**](CreateEndpointRequest.md) |  |  |

### Return type

[**Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Endpoint created |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

