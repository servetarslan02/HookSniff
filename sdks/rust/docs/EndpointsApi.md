# \EndpointsApi

All URIs are relative to *https://hooksniff-api-1046140057667.europe-west1.run.app/v1*

Method | HTTP request | Description
------------- | ------------- | -------------
[**endpoints_get**](EndpointsApi.md#endpoints_get) | **GET** /endpoints | List all endpoints
[**endpoints_id_delete**](EndpointsApi.md#endpoints_id_delete) | **DELETE** /endpoints/{id} | Delete endpoint
[**endpoints_id_get**](EndpointsApi.md#endpoints_id_get) | **GET** /endpoints/{id} | Get endpoint by ID
[**endpoints_id_put**](EndpointsApi.md#endpoints_id_put) | **PUT** /endpoints/{id} | Update endpoint
[**endpoints_id_retry_policy_put**](EndpointsApi.md#endpoints_id_retry_policy_put) | **PUT** /endpoints/{id}/retry-policy | Update retry policy for an endpoint
[**endpoints_id_rotate_secret_post**](EndpointsApi.md#endpoints_id_rotate_secret_post) | **POST** /endpoints/{id}/rotate-secret | Rotate endpoint signing secret
[**endpoints_post**](EndpointsApi.md#endpoints_post) | **POST** /endpoints | Create a new endpoint



## endpoints_get

> Vec<models::Endpoint> endpoints_get()
List all endpoints

### Parameters

This endpoint does not need any parameter.

### Return type

[**Vec<models::Endpoint>**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_id_delete

> endpoints_id_delete(id)
Delete endpoint

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


## endpoints_id_get

> models::Endpoint endpoints_id_get(id)
Get endpoint by ID

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_id_put

> models::Endpoint endpoints_id_put(id, update_endpoint_request)
Update endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**update_endpoint_request** | [**UpdateEndpointRequest**](UpdateEndpointRequest.md) |  | [required] |

### Return type

[**models::Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_id_retry_policy_put

> models::Endpoint endpoints_id_retry_policy_put(id, retry_policy)
Update retry policy for an endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |
**retry_policy** | [**RetryPolicy**](RetryPolicy.md) |  | [required] |

### Return type

[**models::Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_id_rotate_secret_post

> models::EndpointsIdRotateSecretPost200Response endpoints_id_rotate_secret_post(id)
Rotate endpoint signing secret

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**id** | **uuid::Uuid** |  | [required] |

### Return type

[**models::EndpointsIdRotateSecretPost200Response**](_endpoints__id__rotate_secret_post_200_response.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


## endpoints_post

> models::Endpoint endpoints_post(create_endpoint_request)
Create a new endpoint

### Parameters


Name | Type | Description  | Required | Notes
------------- | ------------- | ------------- | ------------- | -------------
**create_endpoint_request** | [**CreateEndpointRequest**](CreateEndpointRequest.md) |  | [required] |

### Return type

[**models::Endpoint**](Endpoint.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

