# hooksniff.Api.InboundApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**InboundConfigsGet**](InboundApi.md#inboundconfigsget) | **GET** /inbound/configs | List inbound webhook configs |
| [**InboundConfigsIdDelete**](InboundApi.md#inboundconfigsiddelete) | **DELETE** /inbound/configs/{id} | Delete inbound config |
| [**InboundConfigsIdPut**](InboundApi.md#inboundconfigsidput) | **PUT** /inbound/configs/{id} | Update inbound config |
| [**InboundConfigsPost**](InboundApi.md#inboundconfigspost) | **POST** /inbound/configs | Create inbound webhook config |
| [**InboundProviderEndpointIdPost**](InboundApi.md#inboundproviderendpointidpost) | **POST** /inbound/{provider}/{endpoint_id} | Receive inbound webhook for a specific endpoint |
| [**InboundProviderPost**](InboundApi.md#inboundproviderpost) | **POST** /inbound/{provider} | Receive inbound webhook from a provider |

<a id="inboundconfigsget"></a>
# **InboundConfigsGet**
> List&lt;InboundConfig&gt; InboundConfigsGet ()

List inbound webhook configs

Returns all inbound webhook configurations for the authenticated user


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;InboundConfig&gt;**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | List of inbound configs |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="inboundconfigsiddelete"></a>
# **InboundConfigsIdDelete**
> void InboundConfigsIdDelete (Guid id)

Delete inbound config


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
| **200** | Config deleted |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="inboundconfigsidput"></a>
# **InboundConfigsIdPut**
> InboundConfig InboundConfigsIdPut (Guid id, InboundConfigsIdPutRequest inboundConfigsIdPutRequest = null)

Update inbound config


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |
| **inboundConfigsIdPutRequest** | [**InboundConfigsIdPutRequest**](InboundConfigsIdPutRequest.md) |  | [optional]  |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Config updated |  -  |
| **404** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="inboundconfigspost"></a>
# **InboundConfigsPost**
> InboundConfig InboundConfigsPost (InboundConfigsPostRequest inboundConfigsPostRequest)

Create inbound webhook config


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **inboundConfigsPostRequest** | [**InboundConfigsPostRequest**](InboundConfigsPostRequest.md) |  |  |

### Return type

[**InboundConfig**](InboundConfig.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Config created |  -  |
| **400** | Validation error |  -  |
| **401** |  |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="inboundproviderendpointidpost"></a>
# **InboundProviderEndpointIdPost**
> void InboundProviderEndpointIdPost (string provider, Guid endpointId, Object body)

Receive inbound webhook for a specific endpoint


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **provider** | **string** |  |  |
| **endpointId** | **Guid** |  |  |
| **body** | **Object** |  |  |

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
| **200** | Webhook accepted |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="inboundproviderpost"></a>
# **InboundProviderPost**
> void InboundProviderPost (string provider, Object body)

Receive inbound webhook from a provider

Accepts webhooks from external providers (Stripe, GitHub, etc.) and routes them to the customer's endpoints. 


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **provider** | **string** |  |  |
| **body** | **Object** |  |  |

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
| **200** | Webhook accepted |  -  |
| **400** | Invalid payload |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

