# hooksniff.Api.ServiceTokensApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**ServiceTokensGet**](ServiceTokensApi.md#servicetokensget) | **GET** /service-tokens | List service tokens |
| [**ServiceTokensIdDelete**](ServiceTokensApi.md#servicetokensiddelete) | **DELETE** /service-tokens/{id} | Delete service token |
| [**ServiceTokensIdPut**](ServiceTokensApi.md#servicetokensidput) | **PUT** /service-tokens/{id} | Update service token |
| [**ServiceTokensIdRevealPost**](ServiceTokensApi.md#servicetokensidrevealpost) | **POST** /service-tokens/{id}/reveal | Reveal service token |
| [**ServiceTokensPost**](ServiceTokensApi.md#servicetokenspost) | **POST** /service-tokens | Create a service token |

<a id="servicetokensget"></a>
# **ServiceTokensGet**
> List&lt;ServiceToken&gt; ServiceTokensGet ()

List service tokens

Returns all service tokens for the authenticated user


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;ServiceToken&gt;**](ServiceToken.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of service tokens |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="servicetokensiddelete"></a>
# **ServiceTokensIdDelete**
> void ServiceTokensIdDelete (Guid id)

Delete service token


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
| **200** | Token deleted |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="servicetokensidput"></a>
# **ServiceTokensIdPut**
> void ServiceTokensIdPut (Guid id, ServiceTokensIdPutRequest serviceTokensIdPutRequest = null)

Update service token


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **serviceTokensIdPutRequest** | [**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md) |  | [optional]  |

### Return type

void (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token updated |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="servicetokensidrevealpost"></a>
# **ServiceTokensIdRevealPost**
> ServiceTokensIdRevealPost200Response ServiceTokensIdRevealPost (Guid id)

Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**ServiceTokensIdRevealPost200Response**](ServiceTokensIdRevealPost200Response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Token revealed |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="servicetokenspost"></a>
# **ServiceTokensPost**
> ServiceTokenCreateResponse ServiceTokensPost (ServiceTokensPostRequest serviceTokensPostRequest)

Create a service token


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **serviceTokensPostRequest** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md) |  |  |

### Return type

[**ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Token created (full token shown only once) |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

