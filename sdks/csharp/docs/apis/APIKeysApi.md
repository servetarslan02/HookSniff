# hooksniff.Api.APIKeysApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

| Method | HTTP request | Description |
|--------|--------------|-------------|
| [**ApiKeysGet**](APIKeysApi.md#apikeysget) | **GET** /api-keys | List API keys |
| [**ApiKeysIdDelete**](APIKeysApi.md#apikeysiddelete) | **DELETE** /api-keys/{id} | Delete (revoke) an API key |
| [**ApiKeysIdRotatePost**](APIKeysApi.md#apikeysidrotatepost) | **POST** /api-keys/{id}/rotate | Rotate an API key |
| [**ApiKeysPost**](APIKeysApi.md#apikeyspost) | **POST** /api-keys | Create a new API key |

<a id="apikeysget"></a>
# **ApiKeysGet**
> List&lt;ApiKeyInfo&gt; ApiKeysGet ()

List API keys


### Parameters
This endpoint does not need any parameter.
### Return type

[**List&lt;ApiKeyInfo&gt;**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | API key list |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="apikeysiddelete"></a>
# **ApiKeysIdDelete**
> void ApiKeysIdDelete (Guid id)

Delete (revoke) an API key


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
| **200** | API key revoked |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="apikeysidrotatepost"></a>
# **ApiKeysIdRotatePost**
> CreateApiKeyResponse ApiKeysIdRotatePost (Guid id)

Rotate an API key


### Parameters

| Name | Type | Description | Notes |
|------|------|-------------|-------|
| **id** | **Guid** |  |  |

### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | New key generated |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

<a id="apikeyspost"></a>
# **ApiKeysPost**
> CreateApiKeyResponse ApiKeysPost ()

Create a new API key


### Parameters
This endpoint does not need any parameter.
### Return type

[**CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | API key created |  -  |

[[Back to top]](#) [[Back to API list]](../../README.md#documentation-for-api-endpoints) [[Back to Model list]](../../README.md#documentation-for-models) [[Back to README]](../../README.md)

