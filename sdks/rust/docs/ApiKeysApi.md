# \ApiKeysApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**api_keys_get**](ApiKeysApi.md#api_keys_get) | **GET** /api-keys | List API keys
[**api_keys_id_delete**](ApiKeysApi.md#api_keys_id_delete) | **DELETE** /api-keys/{id} | Delete (revoke) an API key
[**api_keys_id_rotate_post**](ApiKeysApi.md#api_keys_id_rotate_post) | **POST** /api-keys/{id}/rotate | Rotate an API key
[**api_keys_post**](ApiKeysApi.md#api_keys_post) | **POST** /api-keys | Create a new API key



## api_keys_get

> Vec<models::ApiKeyInfo> api_keys_get()
List API keys

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::ApiKeyInfo>**](ApiKeyInfo.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## api_keys_id_delete

> api_keys_id_delete(id)
Delete (revoke) an API key

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## api_keys_id_rotate_post

> models::CreateApiKeyResponse api_keys_id_rotate_post(id)
Rotate an API key

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## api_keys_post

> models::CreateApiKeyResponse api_keys_post()
Create a new API key

### Parameters

This endpoint does not need any parameter.

### Return type

[**models::CreateApiKeyResponse**](CreateApiKeyResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

