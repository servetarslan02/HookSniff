# \ServiceTokensApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**service_tokens_get**](ServiceTokensApi.md#service_tokens_get) | **GET** /service-tokens | List service tokens
[**service_tokens_id_delete**](ServiceTokensApi.md#service_tokens_id_delete) | **DELETE** /service-tokens/{id} | Delete service token
[**service_tokens_id_put**](ServiceTokensApi.md#service_tokens_id_put) | **PUT** /service-tokens/{id} | Update service token
[**service_tokens_id_reveal_post**](ServiceTokensApi.md#service_tokens_id_reveal_post) | **POST** /service-tokens/{id}/reveal | Reveal service token
[**service_tokens_post**](ServiceTokensApi.md#service_tokens_post) | **POST** /service-tokens | Create a service token



## service_tokens_get

> Vec<models::ServiceToken> service_tokens_get()
List service tokens

Returns all service tokens for the authenticated user

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::ServiceToken>**](ServiceToken.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## service_tokens_id_delete

> service_tokens_id_delete(id)
Delete service token

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


## service_tokens_id_put

> service_tokens_id_put(id, service_tokens_id_put_request)
Update service token

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**service_tokens_id_put_request** | Option<[**ServiceTokensIdPutRequest**](ServiceTokensIdPutRequest.md)> |  |  |

### Return type

 (empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: Not defined

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## service_tokens_id_reveal_post

> models::ServiceTokensIdRevealPost200Response service_tokens_id_reveal_post(id)
Reveal service token

Returns the full token value (only available once after creation, or via this endpoint)

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::ServiceTokensIdRevealPost200Response**](_service_tokens__id__reveal_post_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## service_tokens_post

> models::ServiceTokenCreateResponse service_tokens_post(service_tokens_post_request)
Create a service token

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**service_tokens_post_request** | [**ServiceTokensPostRequest**](ServiceTokensPostRequest.md) |  | [required] |

### Return type

[**models::ServiceTokenCreateResponse**](ServiceTokenCreateResponse.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

